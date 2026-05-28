import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, className }) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <div className={cn("flex items-center mt-2 text-xs font-semibold", trend.isUp ? "text-green-600" : "text-red-600")}>
                <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
                <span className="text-muted-foreground ml-1 font-normal">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};