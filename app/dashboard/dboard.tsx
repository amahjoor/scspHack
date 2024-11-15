import DashboardHeader from '@/components/dashboard/header';
import AlertsOverview from '@/components/dashboard/alerts-overview';
import ThreatTrends from '@/components/dashboard/threat-trends';
import RegionalMap from '@/components/dashboard/regional-map';
import RecentThreats from '@/components/dashboard/recent-threats';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getStats() {
  const supabase = createClient();
  
  const [alertsCount, threatCount, regionsCount] = await Promise.all([
    supabase.from('alerts')
      .select('*', { count: 'exact' })
      .eq('status', 'active'),
    supabase.from('threat_patterns')
      .select('*', { count: 'exact' }),
    supabase.from('osint_sources')
      .select('affected_regions', { count: 'exact' }),
  ]);

  return {
    activeAlerts: alertsCount.count || 0,
    totalThreats: threatCount.count || 0,
    monitoredRegions: regionsCount.count || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AlertsOverview />
          <ThreatTrends />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RegionalMap />
          </div>
          <RecentThreats />
        </div>
      </div>
    </main>
  );
}