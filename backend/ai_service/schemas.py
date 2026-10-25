from pydantic import BaseModel, Field
from typing import List, Optional

# Schema for incoming product data (usually sent from the Catalog Service)
class ProductCreate(BaseModel):
    product_id: int
    name: str
    description: str

# Schema for AI recommendation queries
class SearchQuery(BaseModel):
    query: str
    limit: int = 5

# Schema for returning the recommended products
class ProductResponse(BaseModel):
    product_id: int
    name: str
    similarity_score: Optional[float] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    user_message: str
    conversation_history: List[dict] = Field(default_factory=list)
    session_id: Optional[str] = None
    channel: str = "web"
    external_user_id: Optional[str] = None
    
class ChatResponse(BaseModel):
    answer: str
    referenced_product_ids: List[int]
    session_id: str


class AvailabilityResponse(BaseModel):
    product_id: int
    title: str
    price: float
    stock_quantity: int
    available: bool