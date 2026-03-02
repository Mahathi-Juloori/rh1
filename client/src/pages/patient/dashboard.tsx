import { Link } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Zap, ArrowRight, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/users/:userId/analytics", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user.id}/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Fetch recent sessions with exercise names
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/users/:userId/sessions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [sessionsRes, exercisesRes] = await Promise.all([
        fetch(`/api/users/${user.id}/sessions`),
        fetch("/api/exercises"),
      ]);
      const sessionsData = await sessionsRes.json();
      const exercisesData = await exercisesRes.json();
      
      // Map exercise IDs to names
      return sessionsData.slice(0, 3).map((session: any) => ({
        ...session,
        exerciseName: exercisesData.find((ex: any) => ex.id === session.exerciseId)?.name || "Exercise",
      }));
    },
  });

  // Fetch therapist notes
  const { data: notes } = useQuery({
    queryKey: ["/api/patients/:patientId/notes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/patients/${user.id}/notes`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch therapist info if assigned
  const { data: therapist } = useQuery({
    queryKey: ["/api/users/:userId/therapist", user?.therapistId],
    enabled: !!user?.therapistId,
    queryFn: async () => {
      const res = await fetch(`/api/users/${user.therapistId}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return "Today, " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return "Yesterday, " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getTrend = (trendStr: string): "up" | "down" | "neutral" => {
    if (trendStr === "improving") return "up";
    if (trendStr === "declining") return "down";
    return "neutral";
  };

  return (
    <LayoutShell role="patient">
      <div className="space-y-8">{/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">
              Hello, {user?.fullName?.split(' ')[0] || user?.username || "Patient"} 👋
            </h1>
            <p className="text-muted-foreground">
              Ready for your daily session? You're doing great!
            </p>
          </div>
          <Link href="/patient/exercise">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
              <Play className="mr-2 h-5 w-5 fill-current" />
              Start New Session
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <MetricCard 
                title="Stability Score" 
                value={`${analytics?.avgStability || 0}%`}
                trend={getTrend(analytics?.trend || "stable")}
                trendValue="" 
                icon={Activity} 
                description="Average steadiness of hand movement"
              />
              <MetricCard 
                title="Smoothness" 
                value={`${analytics?.avgSmoothness || 0}%`}
                trend={getTrend(analytics?.trend || "stable")}
                trendValue="" 
                icon={Zap} 
                description="Consistency of motion path"
              />
              <MetricCard 
                title="Total Sessions" 
                value={`${analytics?.totalSessions || 0}`}
                trend="neutral" 
                trendValue="" 
                icon={Clock} 
                description="Total practice sessions completed"
              />
            </>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your last 3 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session: any, i: number) => {
                    const avgScore = Math.round(
                      ((parseFloat(session.stability) || 0) + 
                       (parseFloat(session.smoothness) || 0) + 
                       (parseFloat(session.accuracy) || 0)) / 3
                    );
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                            {avgScore}
                          </div>
                          <div>
                            <p className="font-medium">{session.exerciseName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDuration(parseFloat(session.completionTime) || 0)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No sessions yet. Start your first exercise!</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <CardHeader>
              <CardTitle className="text-primary-foreground">Therapist Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {notes && notes.length > 0 ? (
                <>
                  <blockquote className="text-lg font-medium italic opacity-90">
                    "{notes[0].note}"
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="font-bold">{therapist?.fullName?.substring(0, 2).toUpperCase() || "Dr"}</span>
                    </div>
                    <div>
                      <p className="font-bold">{therapist?.fullName || "Your Therapist"}</p>
                      <p className="text-xs opacity-70">Physical Therapist</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="opacity-90">No therapist notes yet. Keep up the good work!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
