from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    title: str
    description: str
    price: float = Field(gt=0, description="Price must be greater than zero")
    stock_quantity: int = Field(ge=0, description="Stock cannot be negative")
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True