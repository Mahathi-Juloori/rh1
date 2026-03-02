import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// MediaPipe imports
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// Analytics imports
import {
  TrajectoryPoint,
  calculateHandMetrics,
  smoothTrajectory,
  normalizeTrajectory,
} from "@/lib/hand-analytics";
import {
  generateCircleTemplate,
  generateSquareTemplate,
  generateLineTemplate,
  calculateShapeAccuracy,
} from "@/lib/shape-recognition";

interface WebcamCanvasProps {
  onComplete?: (stats: {
    stability: number;
    smoothness: number;
    accuracy: number;
    time: number;
    jitter: number;
  }) => void;
  shape: "circle" | "square" | "line";
  difficulty?: "easy" | "med" | "hard";
}

interface DrawingPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function WebcamCanvas({ onComplete, shape, difficulty = "easy" }: WebcamCanvasProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [handPositions, setHandPositions] = useState<DrawingPoint[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    stability: 0,
    smoothness: 0,
    jitter: 0,
  });
  const [detectionStatus, setDetectionStatus] = useState<'waiting' | 'detected' | 'lost'>('waiting');
  const [handDetectionConfidence, setHandDetectionConfidence] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  // Use ref for hand positions to avoid stale state in the drawing loop
  const handPositionsRef = useRef<DrawingPoint[]>([]);

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initializeHands = async () => {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      handsRef.current = hands;
      setIsInitialized(true);
    };

    initializeHands();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  // Handle MediaPipe results
  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure the internal drawing buffer matches the element's CSS size.
    // Without this, drawing happens into a 640x480 buffer while the element may be much larger/smaller,
    // so overlays can look like "nothing is drawn" (1-2px tiny) or appear misaligned.
    const displayW = Math.floor(canvas.clientWidth || 0);
    const displayH = Math.floor(canvas.clientHeight || 0);
    if (displayW > 0 && displayH > 0 && (canvas.width !== displayW || canvas.height !== displayH)) {
      canvas.width = displayW;
      canvas.height = displayH;
    }

    // Clear canvas
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror the canvas for natural camera feel (video only)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform for overlays
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw shape guide (non-mirrored overlay)
    drawShapeGuide(ctx, canvas.width, canvas.height);

    // Update detection status
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setDetectionStatus('detected');
      setHandDetectionConfidence(
        results.multiHandedness?.[0]?.score || 0.8
      );

      const landmarks = results.multiHandLandmarks[0];

      // Mirror landmarks for drawing (flip x-coordinates)
      const mirroredLandmarks = landmarks.map((lm: any) => ({
        x: 1 - lm.x,
        y: lm.y,
        z: lm.z
      }));

      // Draw hand landmarks and connections using MediaPipe's HAND_CONNECTIONS
      drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, { 
        color: '#00FF00', 
        lineWidth: 3 
      });

      drawLandmarks(ctx, mirroredLandmarks, { 
        color: '#FF0000', 
        lineWidth: 2, 
        radius: 5,
        fillColor: '#FF0000'
      });

      // Track index finger tip (landmark 8) for drawing
      const indexFingerTip = mirroredLandmarks[8];
      const x = indexFingerTip.x * canvas.width;
      const y = indexFingerTip.y * canvas.height;

      if (isRecording) {
        const newPosition: DrawingPoint = {
          x,
          y,
          timestamp: Date.now()
        };

        // Update the ref immediately for drawing
        handPositionsRef.current = [...handPositionsRef.current, newPosition].slice(-500);
        
        // Update state for metrics (async)
        setHandPositions(prev => {
          const updated = [...prev, newPosition];
          
          // Update real-time metrics every 10 frames
          if (updated.length % 10 === 0) {
            const trajectoryPoints: TrajectoryPoint[] = updated.map(p => ({
              x: p.x,
              y: p.y,
              timestamp: p.timestamp,
            }));
            
            const metrics = calculateHandMetrics(trajectoryPoints);
            setRealTimeMetrics({
              stability: metrics.stability,
              smoothness: metrics.smoothness,
              jitter: metrics.jitter,
            });
          }

          return updated.slice(-500); // Keep last 500 points
        });

        // Draw trail FIRST (behind the current position) - use ref for latest points
        const trailPoints = handPositionsRef.current.slice(-100);
        if (trailPoints.length > 1) {
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(6, 182, 212, 0.5)";
          
          for (let i = 0; i < trailPoints.length - 1; i++) {
            const progress = i / trailPoints.length;
            const alpha = 0.3 + (progress * 0.7); // 0.3 to 1.0
            const width = 3 + (progress * 7); // 3px to 10px
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(trailPoints[i].x, trailPoints[i].y);
            ctx.lineTo(trailPoints[i + 1].x, trailPoints[i + 1].y);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
        
        // Draw current position with bright glow on top
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#06b6d4";
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright inner circle
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // When not recording but hand is detected, show the fingertip indicator
        // This provides visual feedback that hand tracking is working
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#06b6d4";
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw fingertip indicators for all visible fingers (more visible)
      const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
      for (const tip of fingerTips) {
        const finger = mirroredLandmarks[tip];
        const fingerX = finger.x * canvas.width;
        const fingerY = finger.y * canvas.height;
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(fingerX, fingerY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fill();
        
        // Main circle
        ctx.beginPath();
        ctx.arc(fingerX, fingerY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else {
      setDetectionStatus('lost');
      setHandDetectionConfidence(0);
    }

    ctx.restore();
  }, [isRecording, shape, difficulty]);

  useEffect(() => {
    if (handsRef.current) {
      handsRef.current.onResults(onResults);
    }
  }, [onResults]);

  // Draw shape guide
  const drawShapeGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const difficultyScale = difficulty === "hard" ? 0.18 : difficulty === "med" ? 0.22 : 0.25;
    const radius = Math.min(width, height) * difficultyScale;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    if (shape === "circle") {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else if (shape === "square") {
      ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    } else if (shape === "line") {
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
    }

    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Start webcam
  const startWebcam = async () => {
    if (!videoRef.current || !handsRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      videoRef.current.srcObject = stream;

      cameraRef.current = new MediaPipeCamera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoRef.current! });
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current.start();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      startTimeRef.current = Date.now();
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Calculate comprehensive metrics
  const calculateMetrics = (): {
    stability: number;
    smoothness: number;
    accuracy: number;
    jitter: number;
  } => {
    if (handPositions.length < 10) {
      return { stability: 0, smoothness: 0, accuracy: 0, jitter: 0 };
    }

    // Convert drawing points to trajectory points
    const trajectoryPoints: TrajectoryPoint[] = handPositions.map(p => ({
      x: p.x,
      y: p.y,
      timestamp: p.timestamp,
    }));

    // Normalize to canvas size
    const normalized = normalizeTrajectory(trajectoryPoints);
    
    // Smooth the trajectory to reduce noise
    const smoothed = smoothTrajectory(normalized, 3);

    // Calculate metrics
    const metrics = calculateHandMetrics(smoothed);

    // Get shape template
    let template: TrajectoryPoint[];
    if (shape === "circle") {
      template = generateCircleTemplate();
    } else if (shape === "square") {
      template = generateSquareTemplate();
    } else {
      template = generateLineTemplate();
    }

    // Normalize template to same scale
    template = normalizeTrajectory(template);

    // Calculate shape accuracy
    const shapeAccuracy = calculateShapeAccuracy(smoothed, template);

    return {
      stability: metrics.stability,
      smoothness: metrics.smoothness,
      accuracy: shapeAccuracy.matchScore,
      jitter: metrics.jitter,
    };
  };

  const handleStart = async () => {
    if (!isInitialized) return;

    // Reset both state and ref for hand positions
    setHandPositions([]);
    handPositionsRef.current = [];
    
    await startWebcam();
    setIsRecording(true);
    setTimer(0);
  };

  const handleStop = () => {
    setIsRecording(false);
    if (cameraRef.current) {
      cameraRef.current.stop();
    }

    const metrics = calculateMetrics();
    if (onComplete) {
      onComplete({
        stability: metrics.stability,
        smoothness: metrics.smoothness,
        accuracy: metrics.accuracy,
        jitter: metrics.jitter,
        time: timer,
      });
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-muted">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay Canvas for Drawing */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full z-10"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white font-mono text-sm border border-white/10">
        {shape.toUpperCase()} MODE
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-red-500/80 backdrop-blur px-3 py-1 rounded-full text-white font-mono text-sm animate-pulse">
          {isRecording ? `REC ${timer}s` : "READY"}
        </div>
        
        {/* Detection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono backdrop-blur ${
          detectionStatus === 'detected' 
            ? 'bg-green-500/80 text-white' 
            : 'bg-yellow-500/80 text-black'
        }`}>
          {detectionStatus === 'detected' ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {detectionStatus === 'detected' ? 'Hand Detected' : 'No Hand'}
        </div>

        {/* Confidence */}
        <div className="bg-blue-500/80 backdrop-blur px-3 py-1 rounded-full text-white font-mono text-xs">
          Conf: {Math.round(handDetectionConfidence * 100)}%
        </div>
      </div>

      {/* Real-time metrics display */}
      {isRecording && (
        <div className="absolute bottom-24 right-4 z-20 bg-black/60 backdrop-blur rounded-lg p-3 text-white font-mono text-xs space-y-1 border border-white/20">
          <div>Stability: {realTimeMetrics.stability}</div>
          <div>Smoothness: {realTimeMetrics.smoothness}</div>
          <div>Jitter: {realTimeMetrics.jitter}</div>
          <div>Points: {handPositions.length}</div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-4">
        {!isRecording ? (
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-lg bg-green-500 hover:bg-green-600 border-4 border-black/20"
            onClick={handleStart}
          >
            <Play className="h-8 w-8 ml-1 fill-current" />
          </Button>
        ) : (
          <Button 
            size="lg" 
            variant="destructive"
            className="rounded-full w-16 h-16 shadow-lg border-4 border-black/20"
            onClick={handleStop}
          >
            <Square className="h-8 w-8 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
}
