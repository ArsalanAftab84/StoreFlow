import os
import asyncio

import httpx

CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://catalog_service:8000").rstrip("/")


async def get_product_availability(product_id: int) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{CATALOG_SERVICE_URL}/products/{product_id}")
    except httpx.RequestError:
        return None

    if response.status_code == 404:
        return None
    response.raise_for_status()
    product = response.json()
    stock_quantity = int(product["stock_quantity"])
    return {
        "product_id": int(product["id"]),
        "title": product["title"],
        "price": float(product["price"]),
        "stock_quantity": stock_quantity,
        "available": stock_quantity > 0,
    }


async def get_products_availability(product_ids: list[int]) -> list[dict]:
    results = await asyncio.gather(
        *(get_product_availability(product_id) for product_id in dict.fromkeys(product_ids))
    )
    return [product for product in results if product is not None]
