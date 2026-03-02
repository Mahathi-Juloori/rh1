import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import PatientDashboard from "@/pages/patient/dashboard";
import PatientExercise from "@/pages/patient/exercise";
import PatientResults from "@/pages/patient/results";
import PatientProgress from "@/pages/patient/progress";
import PatientProfile from "@/pages/patient/profile";
import TherapistDashboard from "@/pages/therapist/dashboard";
import PatientDetails from "@/pages/therapist/patient-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Patient Routes */}
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/exercise" component={PatientExercise} />
      <Route path="/patient/results" component={PatientResults} />
      <Route path="/patient/progress" component={PatientProgress} />
      <Route path="/patient/profile" component={PatientProfile} />
      
      {/* Therapist Routes */}
      <Route path="/therapist/dashboard" component={TherapistDashboard} />
      <Route path="/therapist/patient/:id" component={PatientDetails} />
      <Route path="/therapist/profile" component={() => <div>Therapist Profile Placeholder</div>} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
