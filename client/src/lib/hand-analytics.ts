/**
 * Hand Analytics Engine
 * Handles landmark detection, trajectory analysis, and stability calculations
 */

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number; // For future haptic feedback
}

export interface HandMetrics {
  stability: number; // 0-100: lower variance = more stable
  smoothness: number; // 0-100: consistency of motion
  velocity: number; // pixels per ms
  acceleration: number; // change in velocity
  jitter: number; // 0-100: inverse of tremor
}

export interface HandAnalysis {
  metrics: HandMetrics;
  trajectory: TrajectoryPoint[];
  dominantHand: 'left' | 'right';
  confidence: number;
}

/**
 * Calculate variance of an array of numbers
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: TrajectoryPoint, p2: TrajectoryPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Enhanced Stability Scoring
 * Measures how steady the hand remains during movement
 * 0 = trembling/unstable, 100 = perfectly steady
 */
export function calculateStability(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 10) return 0;

  // Analyze recent positions for local stability
  const recentPositions = trajectory.slice(-50);
  const xCoords = recentPositions.map(p => p.x);
  const yCoords = recentPositions.map(p => p.y);

  const xVariance = calculateVariance(xCoords);
  const yVariance = calculateVariance(yCoords);
  const avgVariance = (xVariance + yVariance) / 2;

  // Normalize to 0-100 scale (lower variance = higher stability)
  // Adjust threshold based on typical hand tremor range
  const stability = Math.max(0, Math.min(100, 100 - Math.sqrt(avgVariance) / 2));
  return Math.round(stability);
}

/**
 * Enhanced Smoothness Scoring
 * Measures consistency of movement velocity
 * 0 = jerky/inconsistent, 100 = perfectly smooth
 */
export function calculateSmoothness(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 10) return 0;

  const velocities: number[] = [];
  const recentPositions = trajectory.slice(-50);

  // Calculate velocities between consecutive frames
  for (let i = 1; i < recentPositions.length; i++) {
    const distance = calculateDistance(recentPositions[i - 1], recentPositions[i]);
    const timeDelta = recentPositions[i].timestamp - recentPositions[i - 1].timestamp;
    
    if (timeDelta > 0) {
      velocities.push(distance / timeDelta);
    }
  }

  if (velocities.length === 0) return 0;

  // Smoothness is inverse of velocity variance
  const velocityVariance = calculateVariance(velocities);
  const smoothness = Math.max(0, Math.min(100, 100 - velocityVariance / 10));
  
  return Math.round(smoothness);
}

/**
 * Calculate instantaneous velocity
 */
export function calculateVelocity(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 2) return 0;

  const recent = trajectory.slice(-5);
  let totalDistance = 0;
  let totalTime = 0;

  for (let i = 1; i < recent.length; i++) {
    totalDistance += calculateDistance(recent[i - 1], recent[i]);
    totalTime += recent[i].timestamp - recent[i - 1].timestamp;
  }

  return totalTime > 0 ? totalDistance / totalTime : 0;
}

/**
 * Calculate acceleration (change in velocity over time)
 */
export function calculateAcceleration(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 5) return 0;

  const velocities: number[] = [];
  const recentPoints = trajectory.slice(-10);

  for (let i = 1; i < recentPoints.length; i++) {
    const distance = calculateDistance(recentPoints[i - 1], recentPoints[i]);
    const timeDelta = recentPoints[i].timestamp - recentPoints[i - 1].timestamp;
    if (timeDelta > 0) {
      velocities.push(distance / timeDelta);
    }
  }

  if (velocities.length < 2) return 0;

  // Acceleration is change in velocity
  let totalAcceleration = 0;
  for (let i = 1; i < velocities.length; i++) {
    totalAcceleration += Math.abs(velocities[i] - velocities[i - 1]);
  }

  return totalAcceleration / velocities.length;
}

/**
 * Calculate jitter (tremor) - high frequency micro-oscillations
 * Returns 0-100 where 100 = no jitter, 0 = severe tremor
 */
export function calculateJitter(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 10) return 0;

  const positions = trajectory.slice(-30);
  const diffs: number[] = [];

  // Calculate differences in movement (smaller differences = smoother)
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    diffs.push(Math.sqrt(dx * dx + dy * dy));
  }

  const variance = calculateVariance(diffs);
  const stdDev = Math.sqrt(variance);

  // High jitter = high variability in micro-movements
  const jitter = Math.max(0, Math.min(100, 100 - stdDev * 5));
  return Math.round(jitter);
}

/**
 * Aggregate all metrics into HandMetrics
 */
export function calculateHandMetrics(trajectory: TrajectoryPoint[]): HandMetrics {
  return {
    stability: calculateStability(trajectory),
    smoothness: calculateSmoothness(trajectory),
    velocity: calculateVelocity(trajectory),
    acceleration: calculateAcceleration(trajectory),
    jitter: calculateJitter(trajectory),
  };
}

/**
 * Filter trajectory to remove noise
 * Uses simple moving average
 */
export function smoothTrajectory(
  trajectory: TrajectoryPoint[], 
  windowSize: number = 3
): TrajectoryPoint[] {
  if (trajectory.length <= windowSize) return trajectory;

  const smoothed: TrajectoryPoint[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < trajectory.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(trajectory.length, i + halfWindow + 1);
    const window = trajectory.slice(start, end);

    const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
    const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;

    smoothed.push({
      x: avgX,
      y: avgY,
      timestamp: trajectory[i].timestamp,
      pressure: trajectory[i].pressure,
    });
  }

  return smoothed;
}

/**
 * Normalize trajectory coordinates to 0-1 range
 */
export function normalizeTrajectory(trajectory: TrajectoryPoint[]): TrajectoryPoint[] {
  if (trajectory.length === 0) return [];

  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return trajectory.map(p => ({
    ...p,
    x: (p.x - minX) / rangeX,
    y: (p.y - minY) / rangeY,
  }));
}

/**
 * Calculate total path length
 */
export function calculatePathLength(trajectory: TrajectoryPoint[]): number {
  let totalLength = 0;
  for (let i = 1; i < trajectory.length; i++) {
    totalLength += calculateDistance(trajectory[i - 1], trajectory[i]);
  }
  return totalLength;
}

/**
 * Calculate occupied bounding box area
 */
export function calculateBoundingBoxArea(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length === 0) return 0;

  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);

  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  return width * height;
}

/**
 * Detect hand from MediaPipe detection results
 */
export function detectHandedness(results: any): 'left' | 'right' {
  if (results.multiHandedness && results.multiHandedness.length > 0) {
    return results.multiHandedness[0].label === 'Left' ? 'left' : 'right';
  }
  return 'right';
}

/**
 * Get detection confidence
 */
export function getDetectionConfidence(results: any): number {
  if (results.multiHandedness && results.multiHandedness.length > 0) {
    return results.multiHandedness[0].score;
  }
  return 0;
}
