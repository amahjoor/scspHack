"use client";

import { Card } from '@/components/ui/card';
import RegionalMap from '@/components/dashboard/regional-map';

export default function MapPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Global Threat Map</h1>
      <Card className="h-[600px]">
        <RegionalMap />
      </Card>
    </div>
  );
}