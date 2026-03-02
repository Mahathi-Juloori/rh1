/**
 * Shape Recognition & Accuracy Analysis
 * Matches drawn shapes against templates and calculates accuracy metrics
 */

import { TrajectoryPoint } from './hand-analytics';

export interface ShapeTemplate {
  name: 'circle' | 'square' | 'line' | 'triangle' | 'star';
  points: TrajectoryPoint[];
  description: string;
}

export interface ShapeAccuracy {
  matchScore: number; // 0-100: how well it matches the template
  shapeConfidence: number; // 0-100: confidence it's the intended shape
  completeness: number; // 0-100: how much of shape was drawn
  symmetry: number; // 0-100: symmetry score (for shapes that should be symmetric)
  temporalConsistency: number; // 0-100: consistency of speed throughout
}

/**
 * Generate perfect circle template
 * Center at (0.5, 0.5) with radius 0.3
 */
export function generateCircleTemplate(): TrajectoryPoint[] {
  const template: TrajectoryPoint[] = [];
  const centerX = 0.5;
  const centerY = 0.5;
  const radius = 0.3;
  const points = 100;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    template.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      timestamp: i * 10, // Simulated timestamps
    });
  }

  return template;
}

/**
 * Generate perfect square template
 */
export function generateSquareTemplate(): TrajectoryPoint[] {
  const template: TrajectoryPoint[] = [];
  const startX = 0.2;
  const startY = 0.2;
  const size = 0.6;
  const pointsPerSide = 25;

  let timestamp = 0;

  // Top edge (left to right)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: startX + (i / pointsPerSide) * size,
      y: startY,
      timestamp: timestamp++,
    });
  }

  // Right edge (top to bottom)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: startX + size,
      y: startY + (i / pointsPerSide) * size,
      timestamp: timestamp++,
    });
  }

  // Bottom edge (right to left)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: startX + size - (i / pointsPerSide) * size,
      y: startY + size,
      timestamp: timestamp++,
    });
  }

  // Left edge (bottom to top)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: startX,
      y: startY + size - (i / pointsPerSide) * size,
      timestamp: timestamp++,
    });
  }

  return template;
}

/**
 * Generate straight line template
 */
export function generateLineTemplate(): TrajectoryPoint[] {
  const template: TrajectoryPoint[] = [];
  const points = 50;

  for (let i = 0; i <= points; i++) {
    template.push({
      x: 0.2 + (i / points) * 0.6,
      y: 0.5,
      timestamp: i * 10,
    });
  }

  return template;
}

/**
 * Generate triangle template
 */
export function generateTriangleTemplate(): TrajectoryPoint[] {
  const template: TrajectoryPoint[] = [];
  const pointsPerSide = 30;

  let timestamp = 0;

  // Point 1 (top) to Point 2 (bottom right)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: 0.5 + (i / pointsPerSide) * 0.3,
      y: 0.2 + (i / pointsPerSide) * 0.6,
      timestamp: timestamp++,
    });
  }

  // Point 2 (bottom right) to Point 3 (bottom left)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: 0.8 - (i / pointsPerSide) * 0.6,
      y: 0.8,
      timestamp: timestamp++,
    });
  }

  // Point 3 (bottom left) to Point 1 (top)
  for (let i = 0; i <= pointsPerSide; i++) {
    template.push({
      x: 0.2 - (i / pointsPerSide) * 0.1,
      y: 0.8 - (i / pointsPerSide) * 0.6,
      timestamp: timestamp++,
    });
  }

  return template;
}

/**
 * Resample trajectory to have same number of points as template
 * Using linear interpolation between points
 */
export function resampleTrajectory(
  trajectory: TrajectoryPoint[],
  targetPoints: number
): TrajectoryPoint[] {
  if (trajectory.length === 0) return [];
  if (trajectory.length === 1) return trajectory;
  if (trajectory.length === targetPoints) return trajectory;

  const resampled: TrajectoryPoint[] = [];
  const totalDistance = calculateTotalDistance(trajectory);
  const targetDistance = totalDistance / (targetPoints - 1);

  resampled.push(trajectory[0]);
  let currentIndex = 0;
  let accumulatedDistance = 0;

  for (let i = 1; i < targetPoints - 1; i++) {
    const targetAccumulatedDistance = i * targetDistance;

    while (
      currentIndex < trajectory.length - 1 &&
      accumulatedDistance + getDistance(trajectory[currentIndex], trajectory[currentIndex + 1]) <
        targetAccumulatedDistance
    ) {
      accumulatedDistance += getDistance(trajectory[currentIndex], trajectory[currentIndex + 1]);
      currentIndex++;
    }

    const remainingDistance = targetAccumulatedDistance - accumulatedDistance;
    const segmentDistance = getDistance(trajectory[currentIndex], trajectory[currentIndex + 1]);
    const ratio = segmentDistance > 0 ? remainingDistance / segmentDistance : 0;

    const interpolated: TrajectoryPoint = {
      x:
        trajectory[currentIndex].x +
        (trajectory[currentIndex + 1].x - trajectory[currentIndex].x) * ratio,
      y:
        trajectory[currentIndex].y +
        (trajectory[currentIndex + 1].y - trajectory[currentIndex].y) * ratio,
      timestamp: trajectory[currentIndex].timestamp,
    };

    resampled.push(interpolated);
  }

  resampled.push(trajectory[trajectory.length - 1]);
  return resampled;
}

/**
 * Calculate distance between two points
 */
function getDistance(p1: TrajectoryPoint, p2: TrajectoryPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate total distance of trajectory
 */
function calculateTotalDistance(trajectory: TrajectoryPoint[]): number {
  let total = 0;
  for (let i = 1; i < trajectory.length; i++) {
    total += getDistance(trajectory[i - 1], trajectory[i]);
  }
  return total;
}

/**
 * Calculate Hausdorff distance between two trajectories
 * Measures how far apart two curves are
 */
export function calculateHausdorffDistance(
  trajectory1: TrajectoryPoint[],
  trajectory2: TrajectoryPoint[]
): number {
  let maxDistance = 0;

  for (const p1 of trajectory1) {
    let minDistance = Infinity;
    for (const p2 of trajectory2) {
      const distance = getDistance(p1, p2);
      minDistance = Math.min(minDistance, distance);
    }
    maxDistance = Math.max(maxDistance, minDistance);
  }

  for (const p2 of trajectory2) {
    let minDistance = Infinity;
    for (const p1 of trajectory1) {
      const distance = getDistance(p1, p2);
      minDistance = Math.min(minDistance, distance);
    }
    maxDistance = Math.max(maxDistance, minDistance);
  }

  return maxDistance;
}

/**
 * Calculate Frechet distance
 * Considers the order and continuity of points
 */
export function calculateFrechetDistance(
  trajectory1: TrajectoryPoint[],
  trajectory2: TrajectoryPoint[]
): number {
  const n = trajectory1.length;
  const m = trajectory2.length;

  // DP table
  const dp = Array(n)
    .fill(null)
    .map(() => Array(m).fill(Infinity));

  dp[0][0] = getDistance(trajectory1[0], trajectory2[0]);

  // Fill first row
  for (let j = 1; j < m; j++) {
    dp[0][j] = Math.max(dp[0][j - 1], getDistance(trajectory1[0], trajectory2[j]));
  }

  // Fill first column
  for (let i = 1; i < n; i++) {
    dp[i][0] = Math.max(dp[i - 1][0], getDistance(trajectory1[i], trajectory2[0]));
  }

  // Fill table
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      const distance = getDistance(trajectory1[i], trajectory2[j]);
      dp[i][j] = Math.max(
        Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]),
        distance
      );
    }
  }

  return dp[n - 1][m - 1];
}

/**
 * Calculate shape match score using multiple metrics
 */
export function calculateMatchScore(
  trajectory: TrajectoryPoint[],
  template: TrajectoryPoint[]
): number {
  if (trajectory.length === 0 || template.length === 0) return 0;

  // Resample both to same number of points for fair comparison
  const targetPoints = Math.max(trajectory.length, template.length);
  const resampledTrajectory = resampleTrajectory(trajectory, targetPoints);
  const resampledTemplate = resampleTrajectory(template, targetPoints);

  // Use Frechet distance as primary metric
  const frechetDist = calculateFrechetDistance(resampledTrajectory, resampledTemplate);

  // Normalize to 0-100 score (lower distance = higher score)
  // Threshold: distance > 0.5 is poor match (score near 0)
  const matchScore = Math.max(0, Math.min(100, 100 * Math.exp(-frechetDist * 2)));

  return Math.round(matchScore);
}

/**
 * Calculate completeness score
 * Checks if the drawn shape covers sufficient area of the template
 */
export function calculateCompletenessScore(
  trajectory: TrajectoryPoint[],
  template: TrajectoryPoint[]
): number {
  if (trajectory.length === 0 || template.length === 0) return 0;

  // Get bounding boxes
  const trajectoryBox = getBoundingBox(trajectory);
  const templateBox = getBoundingBox(template);

  // Calculate overlap area (simplified)
  const overlapWidth = Math.min(trajectoryBox.maxX, templateBox.maxX) - 
                       Math.max(trajectoryBox.minX, templateBox.minX);
  const overlapHeight = Math.min(trajectoryBox.maxY, templateBox.maxY) - 
                        Math.max(trajectoryBox.minY, templateBox.minY);
  
  if (overlapWidth <= 0 || overlapHeight <= 0) return 20;

  const overlapArea = overlapWidth * overlapHeight;
  const templateArea = 
    (templateBox.maxX - templateBox.minX) * (templateBox.maxY - templateBox.minY);

  const completeness = Math.min(100, (overlapArea / templateArea) * 100);
  return Math.round(completeness);
}

/**
 * Get bounding box of trajectory
 */
function getBoundingBox(trajectory: TrajectoryPoint[]) {
  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * Calculate symmetry score for symmetric shapes (circle, square)
 */
export function calculateSymmetryScore(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 10) return 0;

  // Get center
  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

  // Check vertical symmetry
  let verticalSymmetry = 0;
  let count = 0;

  for (const point of trajectory) {
    // Find mirror point (reflected across center X)
    const reflectedX = 2 * centerX - point.x;
    const tolerance = 0.1;

    // Count how many points have a mirror counterpart
    for (const otherPoint of trajectory) {
      if (
        Math.abs(otherPoint.x - reflectedX) < tolerance &&
        Math.abs(otherPoint.y - point.y) < tolerance
      ) {
        verticalSymmetry++;
        count++;
        break;
      }
    }
  }

  const symmetryRatio = count > 0 ? verticalSymmetry / trajectory.length : 0;
  return Math.round(Math.min(100, symmetryRatio * 100));
}

/**
 * Calculate temporal consistency
 * Ensures speed is relatively consistent throughout the shape
 */
export function calculateTemporalConsistency(trajectory: TrajectoryPoint[]): number {
  if (trajectory.length < 5) return 0;

  // Calculate velocity at each point
  const velocities: number[] = [];

  for (let i = 1; i < trajectory.length; i++) {
    const dx = trajectory[i].x - trajectory[i - 1].x;
    const dy = trajectory[i].y - trajectory[i - 1].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const time = trajectory[i].timestamp - trajectory[i - 1].timestamp;

    if (time > 0) {
      velocities.push(distance / time);
    }
  }

  if (velocities.length === 0) return 0;

  // Calculate coefficient of variation
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const variance = 
    velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  // Convert to consistency score (lower CV = higher consistency)
  const consistency = Math.max(0, Math.min(100, 100 * Math.exp(-coefficientOfVariation)));
  return Math.round(consistency);
}

/**
 * Comprehensive shape accuracy calculation
 */
export function calculateShapeAccuracy(
  trajectory: TrajectoryPoint[],
  template: TrajectoryPoint[]
): ShapeAccuracy {
  const matchScore = calculateMatchScore(trajectory, template);
  const completeness = calculateCompletenessScore(trajectory, template);
  const symmetry = calculateSymmetryScore(trajectory);
  const temporalConsistency = calculateTemporalConsistency(trajectory);

  // Calculate overall confidence
  const shapeConfidence = Math.round((matchScore + completeness) / 2);

  return {
    matchScore,
    shapeConfidence,
    completeness,
    symmetry,
    temporalConsistency,
  };
}

/**
 * Classify shape based on trajectory characteristics
 */
export function classifyShape(
  trajectory: TrajectoryPoint[]
): 'circle' | 'square' | 'line' | 'triangle' | 'star' | 'unknown' {
  if (trajectory.length < 5) return 'unknown';

  // Get bounding box
  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  // Check aspect ratio
  const aspectRatio = width / height;

  // Line: very elongated (either horizontal or vertical)
  if (aspectRatio > 3 || aspectRatio < 0.33) {
    return 'line';
  }

  // Get circularity metric
  const pathLength = calculatePathLength(trajectory);
  const area = width * height;
  const circularity = (4 * Math.PI * area) / (pathLength * pathLength);

  // Circle: high circularity
  if (circularity > 0.7) {
    return 'circle';
  }

  // Square: aspect ratio close to 1 and angular
  if (Math.abs(aspectRatio - 1) < 0.3) {
    return 'square';
  }

  return 'unknown';
}

// Helper function for path length calculation
function calculatePathLength(trajectory: TrajectoryPoint[]): number {
  let total = 0;
  for (let i = 1; i < trajectory.length; i++) {
    total += getDistance(trajectory[i - 1], trajectory[i]);
  }
  return total;
}
