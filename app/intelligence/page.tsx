"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database } from '@/lib/supabase/types';

export default function IntelligencePage() {
  const [data, setData] = useState<any[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchIntelligence = async () => {
      const { data } = await supabase
        .from('osint_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setData(data);
    };

    fetchIntelligence();
  }, [supabase]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Intelligence Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Similar to CasesTrend component */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="created_at" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}