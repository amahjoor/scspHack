"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database } from '@/lib/supabase/types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { createClient } from '@/lib/supabase/client'

export default function ThreatTrends() {
  const [data, setData] = useState<{ date: string; threats: number; }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchThreats = async () => {
      const endDate = new Date();
      const startDate = subMonths(endDate, 6);

      const { data: threats } = await supabase
        .from('threat_patterns')
        .select('created_at')
        .gte('created_at', startOfMonth(startDate).toISOString())
        .lte('created_at', endOfMonth(endDate).toISOString());

      if (threats) {
        const monthlyData = threats.reduce((acc, curr) => {
          const month = format(new Date(curr.created_at), 'yyyy-MM');
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const formattedData = Object.entries(monthlyData).map(([date, threats]) => ({
          date,
          threats,
        }));

        setData(formattedData);
      }
    };

    fetchThreats();

    const channel = supabase
      .channel('threat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threat_patterns' }, () => {
        fetchThreats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threat Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}