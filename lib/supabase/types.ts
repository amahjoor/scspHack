export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      threat_patterns: {
        Row: {
          id: string;
          threat_type: 'disinformation' | 'cyber' | 'physical' | 'economic';
          confidence: number;
          severity: 'low' | 'medium' | 'high' | 'critical';
          details: string;
          analysis: string;
          affected_regions: string[];
          latitude?: number;
          longitude?: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['threat_patterns']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['threat_patterns']['Insert']>;
      };
      osint_sources: {
        Row: {
          id: string;
          source_type: 'social_media' | 'news' | 'government' | 'technical';
          credibility: 'low' | 'medium' | 'high';
          content: string;
          language: string;
          metadata: Json;
          threat_pattern_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['osint_sources']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['osint_sources']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          alert_type: 'emerging' | 'active' | 'resolved';
          severity: 'low' | 'medium' | 'high' | 'critical';
          details: string;
          status: 'active' | 'resolved';
          affected_regions: string[];
          recommendations: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type ThreatPattern = Tables<'threat_patterns'>;
export type OSINTSource = Tables<'osint_sources'>;
export type Alert = Tables<'alerts'>;