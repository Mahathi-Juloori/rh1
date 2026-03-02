import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { ProgressCharts } from "@/components/progress-charts";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionData {
  id: string;
  timestamp: number;
  stability: number;
  smoothness: number;
  accuracy: number;
  jitter: number;
  exerciseName: string;
  completionTime: number;
}

interface ProgressData {
  date: string;
  timestamp: number;
  stability: number;
  smoothness: number;
  accuracy: number;
  jitter: number;
}

export default function PatientProgress() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    'stability' | 'smoothness' | 'accuracy' | 'jitter'
  >('stability');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch(`/api/users/${user.id}/sessions`);
      const data = await response.json();

      // Transform sessions to progress data
      const transformed = data.map((session: any) => ({
        date: new Date(session.createdAt).toLocaleDateString(),
        timestamp: new Date(session.createdAt).getTime(),
        stability: parseFloat(session.stability),
        smoothness: parseFloat(session.smoothness),
        accuracy: parseFloat(session.accuracy),
        jitter: session.jitter ? parseFloat(session.jitter) : 0,
      }));

      setProgressData(transformed);
      setSessions(
        data.map((session: any) => ({
          id: session.id,
          timestamp: new Date(session.createdAt).getTime(),
          stability: parseFloat(session.stability),
          smoothness: parseFloat(session.smoothness),
          accuracy: parseFloat(session.accuracy),
          jitter: session.jitter ? parseFloat(session.jitter) : 0,
          exerciseName: session.exerciseName || 'Exercise',
          completionTime: parseFloat(session.completionTime),
        }))
      );
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutShell role="patient">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell role="patient">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Your Progress</h1>
            <p className="text-muted-foreground">Track your recovery journey over time.</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Main Charts */}
        <ProgressCharts
          data={progressData}
          selectedMetric={selectedMetric}
          onMetricSelect={setSelectedMetric}
        />

        {/* Session History */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Your recent exercise sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.sort((a, b) => b.timestamp - a.timestamp).map(session => (
                  <div key={session.id} className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-muted/50 transition">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.exerciseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.timestamp).toLocaleDateString()} • {new Date(session.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Stability</div>
                        <div className="font-bold">{session.stability}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Smoothness</div>
                        <div className="font-bold">{session.smoothness}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Accuracy</div>
                        <div className="font-bold">{session.accuracy}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">Time</div>
                        <div className="font-bold">{Math.ceil(session.completionTime)}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutShell>
  );
}
