import { AlertTriangle, TrendingUp, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardHeaderProps {
  stats: {
    activeAlerts: number;
    totalThreats: number;
    monitoredRegions: number;
  };
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">{stats.activeAlerts}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Threats</p>
              <p className="text-2xl font-bold">{stats.totalThreats}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Monitored Regions</p>
              <p className="text-2xl font-bold">{stats.monitoredRegions}</p>
            </div>
            <Globe className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}