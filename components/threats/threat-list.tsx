"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@/lib/supabase/client'
import { ThreatPattern } from '@/lib/supabase/types'
import { ThreatCard } from './threat-card';

export function ThreatList() {
  const [threats, setThreats] = useState<ThreatPattern[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchThreats = async () => {
      const { data } = await supabase
        .from('threat_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setThreats(data);
    };

    fetchThreats();
    
    const channel = supabase
      .channel('threat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threat_patterns' }, fetchThreats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="space-y-4">
      {threats.map((threat) => (
        <ThreatCard key={threat.id} threat={threat} />
      ))}
    </div>
  );
}