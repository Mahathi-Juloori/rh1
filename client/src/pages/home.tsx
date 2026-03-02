import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-heading font-bold text-2xl text-primary">
          <Activity className="h-8 w-8" />
          <span>Air Canvas</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
          </Link>
          <Link href="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Medically Supportive AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground">
            Rehabilitation <br />
            <span className="text-primary">at your fingertips.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track and analyze hand movement recovery using computer vision. 
            Engaging, measurable, and accessible rehabilitation from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Start Your Recovery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
              View Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 text-left">
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Touchless Tracking</h3>
              <p className="text-muted-foreground">Uses your webcam to track fingertip movements without any special hardware.</p>
            </div>
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground mb-4">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Feedback</h3>
              <p className="text-muted-foreground">Instant analysis of stability, smoothness, and range of motion.</p>
            </div>
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Clinician Connected</h3>
              <p className="text-muted-foreground">Therapists can monitor progress remotely and adjust plans.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 Air Canvas Rehab. Supportive aid only. Not a diagnostic tool.</p>
      </footer>
    </div>
  );
}
