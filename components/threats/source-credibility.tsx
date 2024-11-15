import { OSINTSource } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function SourceCredibilityChart({ sources }: { sources: OSINTSource[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Credibility Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sources}>
            <XAxis dataKey="source_type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="credibility_score" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}