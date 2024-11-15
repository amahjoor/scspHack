import DashboardHeader from '@/components/dashboard/header';
import AlertsOverview from '@/components/dashboard/alerts-overview';
import ThreatTrends from '@/components/dashboard/threat-trends';
import RegionalMap from '@/components/dashboard/regional-map';
import RecentThreats from '@/components/dashboard/recent-threats';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getStats() {
  const supabase = createClient();
  
  try {
    const { count: alertsCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .single();

    const { count: threatCount } = await supabase
      .from('threat_patterns')
      .select('*', { count: 'exact', head: true })
      .single();

    const { count: regionsCount } = await supabase
      .from('osint_sources')
      .select('*', { count: 'exact', head: true })
      .single();

    return {
      activeAlerts: alertsCount ?? 0,
      totalThreats: threatCount ?? 0,
      monitoredRegions: regionsCount ?? 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      activeAlerts: 0,
      totalThreats: 0,
      monitoredRegions: 0
    };
  }
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