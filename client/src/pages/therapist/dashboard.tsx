import { Link } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertCircle, Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function TherapistDashboard() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch therapist's patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/therapists/:therapistId/patients", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/therapists/${user.id}/patients`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  // Fetch analytics for each patient
  const { data: patientsWithAnalytics } = useQuery({
    queryKey: ["/api/therapists/patients/analytics", patients],
    enabled: !!patients && patients.length > 0,
    queryFn: async () => {
      const analyticsPromises = patients.map(async (patient: any) => {
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch(`/api/users/${patient.id}/analytics`),
          fetch(`/api/users/${patient.id}/sessions`),
        ]);
        const analytics = await analyticsRes.json();
        const sessions = await sessionsRes.json();
        
        const lastSession = sessions[0];
        const daysSinceLastSession = lastSession 
          ? Math.floor((Date.now() - new Date(lastSession.createdAt).getTime()) / 86400000)
          : 999;

        return {
          ...patient,
          analytics,
          lastSession,
          daysSinceLastSession,
        };
      });
      return Promise.all(analyticsPromises);
    },
  });

  const formatLastSession = (daysSince: number) => {
    if (daysSince === 0) return "Today";
    if (daysSince === 1) return "Yesterday";
    if (daysSince < 7) return `${daysSince} days ago`;
    if (daysSince < 30) return `${Math.floor(daysSince / 7)} weeks ago`;
    if (daysSince === 999) return "Never";
    return `${Math.floor(daysSince / 30)} months ago`;
  };

  const getStatus = (analytics: any, daysSince: number) => {
    if (daysSince > 7) return "Attention Needed";
    if (analytics?.trend === "improving") return "Improving";
    if (analytics?.trend === "declining") return "Declining";
    return "Stable";
  };

  const getRisk = (analytics: any, daysSince: number) => {
    if (daysSince > 7 || analytics?.avgStability < 60) return "High";
    if (analytics?.avgStability < 75) return "Medium";
    return "Low";
  };

  const filteredPatients = patientsWithAnalytics?.filter((patient: any) => 
    patient.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const criticalAlerts = patientsWithAnalytics?.filter((p: any) => getRisk(p.analytics, p.daysSinceLastSession) === "High").length || 0;

  return (
    <LayoutShell role="therapist">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-heading">Therapist Dashboard</h1>
            <p className="text-muted-foreground">Overview of your patient roster.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <MetricCard 
                title="Total Patients" 
                value={`${patients?.length || 0}`}
                trend="neutral" 
                trendValue="" 
                icon={Users} 
              />
              <MetricCard 
                title="Critical Alerts" 
                value={`${criticalAlerts}`}
                trend="neutral" 
                trendValue="" 
                icon={AlertCircle} 
                className="border-red-100 bg-red-50/50"
              />
              <MetricCard 
                title="Active Patients" 
                value={`${patientsWithAnalytics?.filter((p: any) => p.daysSinceLastSession < 7).length || 0}`}
                trend="neutral" 
                trendValue="" 
                icon={FileText} 
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>Recent activity and status.</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || !patientsWithAnalytics ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? "No patients match your search." : "No patients assigned yet."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Session</TableHead>
                    <TableHead>Stability Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient: any) => {
                    const status = getStatus(patient.analytics, patient.daysSinceLastSession);
                    const risk = getRisk(patient.analytics, patient.daysSinceLastSession);
                    const stability = patient.analytics?.avgStability || 0;

                    return (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.fullName || patient.username}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={risk === "High" ? "destructive" : risk === "Medium" ? "secondary" : "outline"} 
                            className={risk === "Low" ? "bg-green-100 text-green-700 border-green-200" : ""}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLastSession(patient.daysSinceLastSession)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${stability > 70 ? "bg-green-500" : stability > 50 ? "bg-yellow-500" : "bg-red-500"}`} 
                                style={{ width: `${stability}%` }}
                              />
                            </div>
                            <span className="text-sm">{stability}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/therapist/patient/${patient.id}`}>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}
