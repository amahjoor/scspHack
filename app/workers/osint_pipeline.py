from typing import List, Dict, Any
from openai import OpenAI
from pydantic import BaseModel
from .base_worker import AIWorker
from .models import OSINTSource, ThreatPattern, ThreatAlert

class OSINTAnalysisPipeline:
    def __init__(self, supabase_url: str, supabase_key: str, openai_client: OpenAI):
        self.supabase = SupabaseConnector(supabase_url, supabase_key)
        self.source_analyzer = AIWorker(
            ModelConfig(
                model="gpt-4-turbo",
                temperature=0.3,
                max_tokens=4000,
                cost_per_1k_tokens=0.01
            ),
            openai_client
        )
        
        self.threat_analyzer = AIWorker(
            ModelConfig(
                model="gpt-4-turbo",
                temperature=0.2,
                max_tokens=2000,
                cost_per_1k_tokens=0.01
            ),
            openai_client
        )

    async def analyze_sources(self, sources: List[OSINTSource]) -> List[ThreatPattern]:
        system_prompt = """
        Analyze OSINT sources for potential threats and patterns.
        Focus on credibility assessment, narrative analysis, and threat identification.
        """
        
        return await self.source_analyzer.process_with_schema(
            sources,
            system_prompt,
            List[ThreatPattern]
        )