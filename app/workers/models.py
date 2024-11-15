from typing import List, Dict, Any, Literal
from pydantic import BaseModel, Field

class OSINTSource(BaseModel):
    source_type: Literal["social_media", "news", "government", "technical"]
    credibility: Literal["low", "medium", "high"]
    language: str
    content: str
    metadata: Dict[str, Any]

class ThreatPattern(BaseModel):
    threat_type: Literal["disinformation", "cyber", "physical", "economic"]
    confidence: float
    severity: Literal["low", "medium", "high", "critical"]
    sources: List[OSINTSource]
    analysis: str

class ThreatAlert(BaseModel):
    alert_type: Literal["emerging", "active", "resolved"]
    severity: Literal["low", "medium", "high", "critical"]
    threat_patterns: List[ThreatPattern]
    affected_regions: List[str]
    recommendations: str