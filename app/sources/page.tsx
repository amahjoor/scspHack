"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/supabase/types';
import { OSINTSource } from '@/lib/types';

export default function SourcesPage() {
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchSources = async () => {
      const { data } = await supabase
        .from('osint_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setSources(data);
    };

    fetchSources();
  }, [supabase]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Intelligence Sources</h1>
      <div className="grid gap-6">
        {sources.map((source) => (
          <Card key={source.content}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{source.source_type}</CardTitle>
                <Badge>{source.credibility}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{source.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}