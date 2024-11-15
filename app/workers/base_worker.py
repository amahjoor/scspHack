from typing import Any, Dict
from openai import OpenAI
from pydantic import BaseModel

class ModelConfig:
    def __init__(self, model: str, temperature: float, max_tokens: int, cost_per_1k_tokens: float):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.cost_per_1k_tokens = cost_per_1k_tokens

class AIWorker:
    def __init__(self, config: ModelConfig, client: OpenAI):
        self.config = config
        self.client = client
        self._total_tokens = 0
        
    async def process_with_schema(self, data: Dict[str, Any], system_prompt: str, schema: type[BaseModel]) -> Any:
        response = await self.client.chat.completions.create(
            model=self.config.model,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": str(data)}
            ]
        )
        
        self._total_tokens += response.usage.total_tokens
        return schema.model_validate_json(response.choices[0].message.content)
    
    def get_cost(self) -> float:
        return (self._total_tokens / 1000) * self.config.cost_per_1k_tokens