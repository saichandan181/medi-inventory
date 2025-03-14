
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className 
}: DashboardCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-xl shadow-soft p-5 transition-apple hover:shadow-md",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span 
                className={cn(
                  "text-xs font-medium mr-1",
                  trend.isPositive ? "text-green-500" : "text-accent-500"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30">
          {icon}
        </div>
      </div>
    </div>
  );
};
