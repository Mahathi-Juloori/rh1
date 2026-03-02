import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  User, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutShellProps {
  children: React.ReactNode;
  role: "patient" | "therapist";
}

export function LayoutShell({ children, role }: LayoutShellProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setLocation("/auth");
    }
  };

  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/exercise", label: "Air Canvas", icon: Activity },
    { href: "/patient/progress", label: "Progress", icon: FileText },
    { href: "/patient/profile", label: "Profile", icon: User },
  ];

  const therapistLinks = [
    { href: "/therapist/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/therapist/profile", label: "Profile", icon: User },
  ];

  const links = role === "patient" ? patientLinks : therapistLinks;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card z-20 sticky top-0">
        <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <Activity className="h-6 w-6" />
          <span>Air Canvas</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-64 bg-card border-r shadow-sm transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-2 font-heading font-bold text-2xl text-primary">
            <Activity className="h-8 w-8" />
            <span>Air Canvas</span>
          </div>

          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {role === "patient" ? "Patient Portal" : "Therapist Portal"}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
