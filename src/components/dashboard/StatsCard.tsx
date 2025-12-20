import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down';
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  trend
}: StatsCardProps) {
  return (
    <div className="enterprise-card p-6 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-destructive" />
              ) : null}
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? "text-success" : trend === 'down' ? "text-destructive" : "text-muted-foreground"
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
          "bg-primary/10"
        )}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
