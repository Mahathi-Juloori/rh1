import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = (role: "patient" | "therapist") => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${role}.`,
      });
      setLocation(role === "patient" ? "/patient/dashboard" : "/therapist/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2 font-heading font-bold text-3xl text-primary">
        <Activity className="h-10 w-10" />
        <span>Air Canvas</span>
      </div>

      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>
            Choose your portal to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="patient" className="h-10 text-md">
                <User className="w-4 h-4 mr-2" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="therapist" className="h-10 text-md">
                <Stethoscope className="w-4 h-4 mr-2" />
                Therapist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" type="email" placeholder="patient@example.com" defaultValue="patient@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-password">Password</Label>
                  <Input id="p-password" type="password" defaultValue="password" />
                </div>
                <Button 
                  className="w-full h-11 text-base" 
                  onClick={() => handleLogin("patient")}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Enter Patient Portal"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="therapist">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="t-email">Email</Label>
                  <Input id="t-email" type="email" placeholder="doctor@clinic.com" defaultValue="doctor@clinic.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-password">Password</Label>
                  <Input id="t-password" type="password" defaultValue="password" />
                </div>
                <Button 
                  className="w-full h-11 text-base" 
                  onClick={() => handleLogin("therapist")}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Enter Therapist Portal"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link href="#" className="text-primary hover:underline font-medium">Register here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
