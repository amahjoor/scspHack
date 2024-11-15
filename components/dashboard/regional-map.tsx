"use client";

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from '@/lib/supabase/types';
import 'mapbox-gl/dist/mapbox-gl.css';

type ThreatLocation = {
  id: string;
  latitude: number;
  longitude: number;
  threat_type: string;
  severity: string;
  details: string;
  created_at: string;
  affected_regions: string[];
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RegionalMap() {
  const [threats, setThreats] = useState<ThreatLocation[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLocation | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchThreats = async () => {
      const { data } = await supabase
        .from('threat_patterns')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

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

  const filteredThreats = useMemo(() => {
    return threats.filter(threat => {
      if (searchQuery && !threat.affected_regions.some(region => 
        region.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return false;
      }

      if (severityFilter !== 'all' && threat.severity !== severityFilter) {
        return false;
      }

      return true;
    });
  }, [threats, searchQuery, severityFilter]);

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Threat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p>Mapbox token not configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <CardTitle>Global Threat Distribution</CardTitle>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select
            value={severityFilter}
            onValueChange={setSeverityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4">
            {['critical', 'high', 'medium', 'low'].map((severity) => (
              <div key={severity} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${getMarkerColor(severity)} rounded-full`} />
                <span className="text-sm capitalize">{severity}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[400px] rounded-md overflow-hidden">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />

            {filteredThreats.map((threat) => (
              <Marker
                key={threat.id}
                latitude={threat.latitude}
                longitude={threat.longitude}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedThreat(threat);
                }}
              >
                <div className={`w-6 h-6 ${getMarkerColor(threat.severity)} rounded-full flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110`}>
                  <div className={`w-4 h-4 ${getMarkerColor(threat.severity)} rounded-full animate-ping absolute opacity-75`} />
                </div>
              </Marker>
            ))}

            {selectedThreat && (
              <Popup
                latitude={selectedThreat.latitude}
                longitude={selectedThreat.longitude}
                onClose={() => setSelectedThreat(null)}
                closeButton={true}
                closeOnClick={false}
                className="min-w-[300px]"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{selectedThreat.threat_type}</h3>
                  <p className="text-sm text-muted-foreground">{selectedThreat.details}</p>
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Severity</p>
                        <p className="font-medium capitalize">{selectedThreat.severity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Detected</p>
                        <p className="font-medium">
                          {new Date(selectedThreat.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Affected Regions</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedThreat.affected_regions.map((region) => (
                          <span key={region} className="text-xs bg-secondary px-2 py-1 rounded">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}