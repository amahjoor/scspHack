from typing import List, Dict, Any, Literal
from datetime import datetime, timedelta
from openai import OpenAI
from dataclasses import dataclass
import json
import asyncio
from supabase import create_client, Client
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

# Pydantic models for structured outputs
class SymptomCluster(BaseModel):
    symptoms: List[str]
    frequency: int
    severity: Literal["mild", "moderate", "severe"]
    description: str

class GeographicPattern(BaseModel):
    region: str
    case_count: int
    concentration: float
    description: str

class TemporalPattern(BaseModel):
    timeframe: str
    trend: str
    case_rate: float
    description: str

class FoodItem(BaseModel):
    name: str
    frequency: int
    associated_cases: int
    risk_level: Literal["low", "medium", "high"]

class PatternAnalysis(BaseModel):
    symptom_clusters: List[SymptomCluster]
    geographic_patterns: List[GeographicPattern]
    temporal_patterns: List[TemporalPattern]
    food_items: List[FoodItem]
    summary: str

class RiskArea(BaseModel):
    type: str
    severity: Literal["low", "medium", "high", "critical"]
    justification: str
    affected_establishments: List[int]

class RiskAssessment(BaseModel):
    risk_areas: List[RiskArea]
    overall_risk_level: Literal["low", "medium", "high", "critical"]

class FoodSafetyAlert(BaseModel):
    """Matches the Supabase alerts table schema"""
    establishment_id: int = Field(..., description="References the establishments table")
    alert_type: Literal["outbreak", "inspection", "violation"] = Field(..., description="Type of alert")
    severity: Literal["low", "medium", "high", "critical"] = Field(..., description="Severity level of the alert")
    case_count: int = Field(..., ge=0, description="Number of cases associated with this alert")
    details: str = Field(None, description="Additional details about the alert")

class AlertsResponse(BaseModel):
    """Container for list of alerts"""
    alerts: List[FoodSafetyAlert]

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

@dataclass
class ModelConfig:
    model: str
    temperature: float
    max_tokens: int
    cost_per_1k_tokens: float

class SupabaseConnector:
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
    
    async def fetch_recent_cases(self, days: int = 7) -> List[Dict[str, Any]]:
        """Fetch recent cases with establishment details using direct query"""
        try:
            date_threshold = datetime.now(timezone.utc) - timedelta(days=days)
            
            cases = self.client.table('cases')\
                .select('*')\
                .gte('report_date', date_threshold.isoformat())\
                .execute()
            
            establishment_ids = [case['establishment_id'] for case in cases.data]
            if not establishment_ids:
                return []
                
            establishments = self.client.table('establishments')\
                .select('*')\
                .in_('id', establishment_ids)\
                .execute()
            
            # Store valid establishment IDs
            self.valid_establishment_ids = {e['id'] for e in establishments.data}
            
            establishment_lookup = {e['id']: e for e in establishments.data}
            
            combined_data = []
            for case in cases.data:
                establishment = establishment_lookup.get(case['establishment_id'])
                if establishment:
                    combined_data.append({
                        **case,
                        'establishment_name': establishment['name'],
                        'address': establishment['address'],
                        'city': establishment['city'],
                        'state': establishment['state'],
                        'postal_code': establishment['postal_code'],
                        'latitude': establishment['latitude'],
                        'longitude': establishment['longitude']
                    })
            
            return combined_data
            
        except Exception as e:
            print(f"Error fetching data: {str(e)}")
            raise

    def validate_establishment_ids(self, alerts: List[FoodSafetyAlert]) -> List[FoodSafetyAlert]:
        """Filter alerts to only include valid establishment IDs"""
        valid_alerts = [
            alert for alert in alerts 
            if alert.establishment_id in self.valid_establishment_ids
        ]
        
        invalid_count = len(alerts) - len(valid_alerts)
        if invalid_count > 0:
            print(f"Filtered out {invalid_count} alerts with invalid establishment IDs")
            
        return valid_alerts

    async def insert_alerts(self, alerts: List[FoodSafetyAlert]) -> None:
        """Insert alerts into Supabase with ID validation"""
        try:
            # Validate establishment IDs before insertion
            valid_alerts = self.validate_establishment_ids(alerts)
            
            if not valid_alerts:
                print("No valid alerts to insert")
                return []
                
            formatted_alerts = [alert.model_dump() for alert in valid_alerts]
            result = self.client.table('alerts').insert(formatted_alerts).execute()
            return result.data
            
        except Exception as e:
            print(f"Error inserting alerts: {str(e)}")
            raise

class AIWorker:
    def __init__(self, model_config: ModelConfig, client: OpenAI):
        self.config = model_config
        self.client = client
        self.total_tokens = 0
        
    def chunk_data(self, data: List[Dict], chunk_size: int = 50) -> List[List[Dict]]:
        """Split data into smaller chunks"""
        return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]

    def get_cost(self) -> float:
        """Calculate the total cost based on tokens used"""
        return (self.total_tokens / 1000) * self.config.cost_per_1k_tokens

    async def process_with_schema(self, data: Any, system_prompt: str, response_format: type[BaseModel]) -> Any:
        """Process data with structured output using Pydantic schema"""
        try:
            # First, try using the new structured outputs format
            try:
                completion = self.client.beta.chat.completions.parse(
                    model=self.config.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": json.dumps(data) if isinstance(data, (dict, list)) else str(data)}
                    ],
                    response_format=response_format,
                    temperature=self.config.temperature,
                    max_tokens=self.config.max_tokens
                )
                
                self.total_tokens += completion.usage.total_tokens
                return completion.choices[0].message.parsed

            except Exception as structured_error:
                print(f"Structured output failed, falling back to JSON mode: {str(structured_error)}")
                
                # Modify prompts to explicitly mention JSON for JSON mode
                json_system_prompt = f"""
                {system_prompt}
                
                You must respond with a valid JSON object that exactly matches this schema:
                {json.dumps(response_format.model_json_schema(), indent=2)}
                """
                
                json_user_prompt = f"""
                Analyze the following data and respond with a JSON object matching the specified schema:
                {json.dumps(data) if isinstance(data, (dict, list)) else str(data)}
                """
                
                completion = self.client.chat.completions.create(
                    model=self.config.model,
                    messages=[
                        {"role": "system", "content": json_system_prompt},
                        {"role": "user", "content": json_user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=self.config.temperature,
                    max_tokens=self.config.max_tokens
                )
                
                self.total_tokens += completion.usage.total_tokens
                response_data = json.loads(completion.choices[0].message.content)
                # Validate and parse the response using the Pydantic model
                return response_format.model_validate(response_data)

        except Exception as e:
            print(f"Error in AI processing: {str(e)}")
            raise

class OSINTMonitoringPipeline:
    def __init__(self, supabase_url: str, supabase_key: str, openai_client: OpenAI):
        self.supabase = SupabaseConnector(supabase_url, supabase_key)
        
        base_model = "gpt-4-turbo"
        
        self.source_analyzer = AIWorker(
            ModelConfig(
                model=base_model,
                temperature=0.3,
                max_tokens=4000,
                cost_per_1k_tokens=0.01
            ),
            openai_client
        )
        
        self.threat_analyzer = AIWorker(
            ModelConfig(
                model=base_model,
                temperature=0.2,
                max_tokens=2000,
                cost_per_1k_tokens=0.01
            ),
            openai_client
        )
        
        self.narrative_analyzer = AIWorker(
            ModelConfig(
                model=base_model,
                temperature=0.1,
                max_tokens=3000,
                cost_per_1k_tokens=0.01
            ),
            openai_client
        )

async def main():
    SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not all([SUPABASE_URL, SUPABASE_KEY]):
        raise EnvironmentError("Missing required environment variables")
    
    openai_client = OpenAI()
    pipeline = OSINTMonitoringPipeline(SUPABASE_URL, SUPABASE_KEY, openai_client)
    
    try:
        print("Fetching recent cases...")
        cases_data = await pipeline.supabase.fetch_recent_cases(days=7)
        print(f"Found {len(cases_data)} recent cases")
        
        if not cases_data:
            return {
                "status": "success",
                "message": "No recent cases found",
                "alerts_generated": 0,
                "costs": pipeline.get_cost_report()
            }
        
        print("Analyzing patterns...")
        patterns = await pipeline.analyze_patterns(cases_data)
        
        print("Assessing risks...")
        risks = await pipeline.assess_risk(patterns)
        
        print("Generating alerts...")
        alerts = await pipeline.generate_alerts(risks)
        
        print("Inserting alerts...")
        await pipeline.supabase.insert_alerts(alerts)
        
        costs = pipeline.get_cost_report()
        
        return {
            "status": "success",
            "alerts_generated": len(alerts),
            "costs": costs,
            "sample_data": {
                "cases_found": len(cases_data),
                "first_case": cases_data[0] if cases_data else None
            }
        }
        
    except Exception as e:
        print(f"Error in pipeline: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "costs": pipeline.get_cost_report()
        }

if __name__ == "__main__":
    result = asyncio.run(main())
    print(json.dumps(result, indent=2))