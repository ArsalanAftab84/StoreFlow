import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from models import Base

# Fetch the URL from the environment (injected via Docker Compose)
# Replace 'postgresql://' with 'postgresql+asyncpg://' for async support
DATABASE_URL = os.getenv("DATABASE_URL", "").replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        # Crucial: Enable the pgvector extension in Postgres
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # Create all tables defined in models.py
        await conn.run_sync(Base.metadata.create_all)

# Dependency to inject the database session into FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session