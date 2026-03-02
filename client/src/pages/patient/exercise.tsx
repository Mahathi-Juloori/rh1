import { useState } from "react";
import { useLocation } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { WebcamCanvas } from "@/components/webcam-canvas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function PatientExercise() {
  const [, setLocation] = useLocation();
  const [selectedShape, setSelectedShape] = useState<"circle" | "square" | "line">("circle");
  const [difficulty, setDifficulty] = useState<"easy" | "med" | "hard">("easy");

  const handleComplete = async (stats: {
    stability: number;
    smoothness: number;
    accuracy: number;
    time: number;
    jitter: number;
  }) => {
    try {
      // Get current user
      const userData = localStorage.getItem("user");
      if (!userData) {
        setLocation("/auth");
        return;
      }

      const user = JSON.parse(userData);

      // Get exercise ID
      const exercisesResponse = await fetch("/api/exercises");
      const exercises = await exercisesResponse.json();
      const exercise = exercises.find((ex: any) => ex.name.toLowerCase() === selectedShape);

      if (!exercise) {
        console.error("Exercise not found");
        return;
      }

      // Create session record
      const sessionData = {
        userId: user.id,
        exerciseId: exercise.id,
        completionTime: stats.time,
        stability: stats.stability,
        smoothness: stats.smoothness,
        accuracy: stats.accuracy,
        jitter: stats.jitter,
        pathData: JSON.stringify([]),
      };

      const sessionResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      if (sessionResponse.ok) {
        // Navigate to results with session data
        setLocation(
          `/patient/results?stability=${stats.stability}&smoothness=${stats.smoothness}&accuracy=${stats.accuracy}&jitter=${stats.jitter}&time=${stats.time}`
        );
      } else {
        console.error("Failed to save session");
        // Still navigate to results even if save failed
        setLocation(
          `/patient/results?stability=${stats.stability}&smoothness=${stats.smoothness}&accuracy=${stats.accuracy}&jitter=${stats.jitter}&time=${stats.time}`
        );
      }
    } catch (error) {
      console.error("Error saving session:", error);
      // Still navigate to results
      setLocation("/patient/results");
    }
  };

  return (
    <LayoutShell role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Air Canvas Session</h1>
            <p className="text-muted-foreground">Follow the on-screen guide with your index finger.</p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Camera Active
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <WebcamCanvas shape={selectedShape} difficulty={difficulty} onComplete={handleComplete} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Exercise Shape</Label>
                  <Select 
                    value={selectedShape} 
                    onValueChange={(v: "circle" | "square" | "line") => setSelectedShape(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="line">Line Path</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`text-center p-2 rounded border text-sm font-medium cursor-pointer ${difficulty === "easy" ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground hover:bg-muted"}`}
                      onClick={() => setDifficulty("easy")}
                    >
                      Easy
                    </div>
                    <div
                      className={`text-center p-2 rounded border text-sm font-medium cursor-pointer ${difficulty === "med" ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground hover:bg-muted"}`}
                      onClick={() => setDifficulty("med")}
                    >
                      Med
                    </div>
                    <div
                      className={`text-center p-2 rounded border text-sm font-medium cursor-pointer ${difficulty === "hard" ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground hover:bg-muted"}`}
                      onClick={() => setDifficulty("hard")}
                    >
                      Hard
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                <p>1. Ensure your hand is visible in the camera frame.</p>
                <p>2. Extend your index finger.</p>
                <p>3. Click "Start" and trace the {selectedShape} in the air.</p>
                <p>4. Keep your movement steady.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
