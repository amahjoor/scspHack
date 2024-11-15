from supabase import create_client, Client
from typing import List, Dict, Any

class SupabaseConnector:
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
    
    async def fetch_recent_cases(self, days: int = 7) -> List[Dict[str, Any]]:
        response = await self.client.rpc(
            'get_recent_cases',
            {'days_ago': days}
        ).execute()
        return response.data
    
    async def insert_alerts(self, alerts: List[Dict[str, Any]]) -> None:
        await self.client.table('alerts').insert(alerts).execute()