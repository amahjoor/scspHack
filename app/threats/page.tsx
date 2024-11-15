"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ThreatList } from '@/components/threats/threat-list';
import { ThreatFilters } from '@/components/threats/threat-filters';

export default function ThreatsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Threat Analysis</h1>
        <ThreatFilters />
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Active Threats</h2>
        </CardHeader>
        <CardContent>
          <ThreatList />
        </CardContent>
      </Card>
    </div>
  );
}