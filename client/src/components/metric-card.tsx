import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  description,
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mt-2">
          <div className="text-3xl font-bold font-heading tracking-tight text-foreground">
            {value}
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" ? "bg-green-100 text-green-700" : 
              trend === "down" ? "bg-red-100 text-red-700" : 
              "bg-gray-100 text-gray-700"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"} {trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
