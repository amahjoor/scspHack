export type Database = {
  public: {
    Tables: {
      threat_patterns: {
        Row: {
          id: string;
          threat_type: 'disinformation' | 'cyber' | 'physical' | 'economic';
          confidence: number;
          severity: 'low' | 'medium' | 'high' | 'critical';
          analysis: string;
          affected_regions: string[];
          created_at: string;
        };
      };
      osint_sources: {
        Row: {
          id: string;
          source_type: 'social_media' | 'news' | 'government' | 'technical';
          credibility: 'low' | 'medium' | 'high';
          content: string;
          language: string;
          metadata: Record<string, any>;
          threat_pattern_id: string;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          alert_type: 'emerging' | 'active' | 'resolved';
          severity: 'low' | 'medium' | 'high' | 'critical';
          details: string;
          affected_regions: string[];
          recommendations: string;
          created_at: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type ThreatPattern = Tables<'threat_patterns'>;
export type OSINTSource = Tables<'osint_sources'>;
export type Alert = Tables<'alerts'>;