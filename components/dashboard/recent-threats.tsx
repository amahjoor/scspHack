"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database } from '@/lib/supabase/types';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client'

type ThreatPattern = Database['public']['Tables']['threat_patterns']['Row'];

export default function RecentThreats() {
  const [threats, setThreats] = useState<ThreatPattern[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchThreats = async () => {
      const { data } = await supabase
        .from('threat_patterns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setThreats(data);
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
        <CardTitle>Recent Threats</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="flex flex-col space-y-2 p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{threat.threat_type}</h3>
                  <Badge
                    variant={
                      threat.severity === 'critical'
                        ? "destructive"
                        : threat.severity === 'high'
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {threat.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(threat.created_at), 'PPP')}
                </p>
                <div className="flex gap-2">
                  {threat.affected_regions?.map((region) => (
                    <Badge key={region} variant="outline">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}