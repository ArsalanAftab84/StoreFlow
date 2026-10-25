import os
import httpx
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import init_db, get_db
from models import Product, Category
from schemas import ProductCreate, ProductUpdate, ProductOut, CategoryCreate, CategoryOut

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai_service:8000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="E-Commerce Catalog Service", lifespan=lifespan)

# Helper function to trigger AI Service embedding generation in background
async def sync_with_ai_service(product_id: int, name: str, description: str):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            payload = {
                "product_id": product_id,
                "name": name,
                "description": description
            }
            response = await client.post(f"{AI_SERVICE_URL}/products", json=payload)
            response.raise_for_status()
        except Exception as e:
            # In a production setup, log to Sentry or push to a Dead-Letter Queue (DLQ)
            print(f"[ERROR] Failed to sync product {product_id} with AI Service: {e}")

# --- Category Endpoints ---
@app.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_cat = Category(name=category.name, slug=category.slug)
    db.add(db_cat)
    await db.commit()
    await db.refresh(db_cat)
    return db_cat

@app.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()

# --- Product Endpoints ---
@app.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    db_product = Product(
        title=product.title,
        description=product.description,
        price=product.price,
        stock_quantity=product.stock_quantity,
        category_id=product.category_id
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Trigger background sync to the AI Service without blocking the API response
    background_tasks.add_task(
        sync_with_ai_service,
        product_id=db_product.id,
        name=db_product.title,
        description=db_product.description
    )

    return db_product

@app.get("/products", response_model=list[ProductOut])
async def list_products(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(Product).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product