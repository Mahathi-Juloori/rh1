import { Link, useSearch } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

export default function PatientResults() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const stability = params.get("stability") || "82";
  const smoothness = params.get("smoothness") || "76";
  const time = params.get("time") || "45";

  return (
    <LayoutShell role="patient">
      <div className="max-w-2xl mx-auto py-10 space-y-8 text-center">
        
        <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-700 rounded-full mb-4 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12" />
        </div>

        <h1 className="text-4xl font-bold font-heading">Session Complete!</h1>
        <p className="text-xl text-muted-foreground">
          Great job! You've shown improvement in stability today.
        </p>

        <div className="grid grid-cols-3 gap-4 pt-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Stability</p>
              <p className="text-3xl font-bold text-primary">{stability}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Smoothness</p>
              <p className="text-3xl font-bold">{smoothness}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Time</p>
              <p className="text-3xl font-bold">{time}s</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <Link href="/patient/exercise">
            <Button variant="outline" size="lg" className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Again
            </Button>
          </Link>
          <Link href="/patient/dashboard">
            <Button size="lg" className="rounded-full px-8">
              Back to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </LayoutShell>
  );
}
