export interface OSINTSource {
    source_type: 'social_media' | 'news' | 'government' | 'technical';
    credibility: 'low' | 'medium' | 'high';
    language: string;
    content: string;
    metadata: Record<string, any>;
  }
  
  export interface ThreatPattern {
    id: string;
    threat_type: "disinformation" | "cyber" | "physical" | "economic";
    details: string;
    analysis: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    affected_regions: string[];
    latitude?: number;
    longitude?: number;
  }
  
  export interface ThreatAlert {
    id: string;
    alert_type: 'emerging' | 'active' | 'resolved';
    severity: 'low' | 'medium' | 'high' | 'critical';
    threat_patterns: ThreatPattern[];
    affected_regions: string[];
    recommendations: string;
    created_at: string;
  }