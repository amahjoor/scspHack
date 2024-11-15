import { ThreatPattern } from '@/lib/supabase/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface ThreatCardProps {
  threat: ThreatPattern;
}

export function ThreatCard({ threat }: ThreatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <h3 className="font-semibold">{threat.threat_type}</h3>
        </div>
        <Badge variant={threat.severity === 'critical' ? 'destructive' : 'default'}>
          {threat.severity}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{threat.analysis}</p>
        <div className="mt-4">
          <p className="text-sm font-medium">Confidence: {threat.confidence}%</p>
        </div>
      </CardContent>
    </Card>
  );
}