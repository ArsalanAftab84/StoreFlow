from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from groq import AsyncGroq

from database import init_db, get_db
from models import ProductEmbedding
from schemas import (
    AvailabilityResponse,
    ChatRequest,
    ChatResponse,
    ProductCreate,
    ProductResponse,
    SearchQuery,
)
from ml_service import ml_service
from catalog_client import get_products_availability
from conversation_service import get_or_create_session, load_recent_messages, save_message

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Events
    await init_db()
    ml_service.load_model()
    yield
    # Shutdown Events (e.g., closing connections) can go here

app = FastAPI(title="AI Recommendation Service", lifespan=lifespan)

@app.post("/products", response_model=dict)
async def sync_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    """
    Called by the Catalog Service via message broker or direct API when a new product is added.
    """
    # Combine the name and description to give the AI maximum semantic context
    context_text = f"{product.name}. {product.description}"
    embedding = ml_service.get_embedding(context_text)

    db_product = ProductEmbedding(
        product_id=product.product_id,
        name=product.name,
        description=product.description,
        embedding=embedding
    )
    
    db.add(db_product)
    await db.commit()
    
    return {"status": "success", "product_id": product.product_id}

@app.post("/search", response_model=list[ProductResponse])
async def search_similar(query: SearchQuery, db: AsyncSession = Depends(get_db)):
    """
    Takes a natural language query or product description and returns the most mathematically similar products.
    """
    # 1. Convert the user's search intent into a vector
    query_embedding = ml_service.get_embedding(query.query)

    # 2. Perform a similarity search in PostgreSQL using pgvector's cosine distance operator
    # The smaller the cosine distance, the higher the similarity
    stmt = (
        select(ProductEmbedding)
        .order_by(ProductEmbedding.embedding.cosine_distance(query_embedding))
        .limit(query.limit)
    )

    result = await db.execute(stmt)
    products = result.scalars().all()

    if not products:
        raise HTTPException(status_code=404, detail="No similar products found.")

    return [
        ProductResponse(product_id=p.product_id, name=p.name)
        for p in products
    ]

groq_client = AsyncGroq()


@app.get("/availability/{product_id}", response_model=AvailabilityResponse)
async def product_availability(product_id: int):
    availability = await get_products_availability([product_id])
    if not availability:
        raise HTTPException(status_code=404, detail="Product unavailable")
    return availability[0]

@app.post("/chat", response_model=ChatResponse)
async def shopping_assistant_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    RAG endpoint: Retrieves relevant products via pgvector and uses Groq to generate a helpful response.
    """
    session = await get_or_create_session(
        db, request.session_id, request.channel, request.external_user_id
    )
    stored_history = await load_recent_messages(db, session.id)
    await save_message(db, session.id, "user", request.user_message)

    # 1. RETRIEVAL: Understand user intent and fetch context
    query_embedding = ml_service.get_embedding(request.user_message)

    # Fetch the top 3 most relevant products from the vector database
    stmt = (
        select(ProductEmbedding)
        .order_by(ProductEmbedding.embedding.cosine_distance(query_embedding))
        .limit(3)
    )
    result = await db.execute(stmt)
    relevant_products = result.scalars().all()
    
    # 2. AUGMENTATION: Format the database results into readable context
    availability = await get_products_availability([p.product_id for p in relevant_products])
    availability_by_id = {product["product_id"]: product for product in availability}
    if not relevant_products:
        context_block = "No specific products found in the catalog matching the user's request."
        product_ids = []
    else:
        context_lines = []
        product_ids = []
        for p in relevant_products:
            live_product = availability_by_id.get(p.product_id)
            if live_product:
                availability_text = (
                    f"Price: ${live_product['price']:.2f}; "
                    f"Stock: {live_product['stock_quantity']}; "
                    f"Available: {live_product['available']}"
                )
            else:
                availability_text = "Live catalog availability is currently unavailable."
            context_lines.append(
                f"- {p.name}: {p.description} (ID: {p.product_id}; {availability_text})"
            )
            product_ids.append(p.product_id)
            
        context_block = "Here are the most relevant products from our catalog:\n" + "\n".join(context_lines)

    # 3. GENERATION: Build the system prompt and send to Groq
    system_prompt = f"""
    You are an expert e-commerce shopping assistant. 
    Use ONLY the product information provided below to answer the user's question. 
    If the provided products do not answer the question, politely inform the user.
    Do not invent product features or prices. Be concise and conversational.
    
    CATALOG CONTEXT:
    {context_block}
    """

    messages = [{"role": "system", "content": system_prompt}]
    
    # Append any previous chat history (optional, sent from React)
    messages.extend(stored_history)
    if not stored_history:
        messages.extend(request.conversation_history)
    
    # Add the current user question
    messages.append({"role": "user", "content": request.user_message})

    try:
        # Using Llama 3 8B via Groq for high-speed, accurate RAG processing
        chat_completion = await groq_client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            temperature=0.3, # Low temperature to prevent hallucinating product specs
            max_tokens=256,
        )
        
        answer = chat_completion.choices[0].message.content

        await save_message(db, session.id, "assistant", answer, {"product_ids": product_ids})
        await db.commit()
        return ChatResponse(
            answer=answer,
            referenced_product_ids=product_ids,
            session_id=session.id,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")