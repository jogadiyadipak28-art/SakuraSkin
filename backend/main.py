"""SakuraSkin API — Multi-Agent Skincare Recommender System."""

import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from agents.formulation_agent import (
    analyze_ingredients, analyze_product, compare_products,
    find_dupes, get_ingredients_db, get_products_db, resolve_ingredient,
)
from agents.skin_analyzer import (
    analyze_skin, get_seasonal_tips, get_ingredient_of_the_day,
)
from agents.scraper_agent import search_products, get_brands, get_categories
from agents.routine_agent import build_routine

app = FastAPI(title="SakuraSkin API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:4173",
).split(",")
# Allow all origins when the wildcard "*" is explicitly configured, otherwise
# use the explicit list (required when credentials are NOT sent, which is the
# case for this app – no cookies/auth headers are used).
_allow_all = ALLOWED_ORIGINS == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all else ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────
class IngredientsRequest(BaseModel):
    ingredients: list[str]

class SkinAnalysisRequest(BaseModel):
    skin_type: str
    concerns: list[str]
    allergies: list[str] = []
    budget: str = "medium"

class CompareRequest(BaseModel):
    product_ids: list[str]

class RoutineRequest(BaseModel):
    product_ids: list[str]
    time_of_day: str = "am"


# ─── Products ─────────────────────────────────────────────────────
@app.get("/api/products")
def list_products(
    query: str = "",
    brand: str = "",
    category: str = "",
    concern: str = "",
    skin_type: str = "",
    min_price: int = 0,
    max_price: int = 99999,
    sort_by: str = "relevance",
):
    return search_products(query, brand, category, concern, skin_type, min_price, max_price, sort_by)


@app.get("/api/products/brands")
def list_brands():
    return get_brands()


@app.get("/api/products/categories")
def list_categories():
    return get_categories()


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    result = analyze_product(product_id)
    if not result:
        return {"error": "Product not found"}
    return result


@app.get("/api/products/{product_id}/dupes")
def get_dupes(product_id: str):
    return find_dupes(product_id)


@app.post("/api/products/compare")
def post_compare(req: CompareRequest):
    return compare_products(req.product_ids)


# ─── Ingredient Analysis ─────────────────────────────────────────
@app.post("/api/analyze/ingredients")
def post_analyze_ingredients(req: IngredientsRequest):
    return analyze_ingredients(req.ingredients)


@app.get("/api/ingredients")
def list_ingredients(
    category: str = "",
    search: str = "",
):
    db = get_ingredients_db()
    results = list(db.values())
    if category:
        results = [i for i in results if i.get("category", "").lower() == category.lower()]
    if search:
        q = search.lower()
        results = [i for i in results if q in i.get("inci", "").lower()
                   or q in i.get("common", "").lower()
                   or q in i.get("id", "").lower()
                   or q in i.get("function", "").lower()]
    results.sort(key=lambda i: i.get("common", ""))
    return results


@app.get("/api/ingredients/{ingredient_id}")
def get_ingredient(ingredient_id: str):
    info = resolve_ingredient(ingredient_id)
    if not info:
        return {"error": "Ingredient not found"}
    products = get_products_db()
    found_in = []
    for p in products:
        for ing in p.get("key_actives", []):
            if ing == info["id"]:
                found_in.append({"id": p["id"], "name": p["name"], "brand": p["brand"]})
                break
    return {**info, "found_in_products": found_in}


# ─── Skin Analysis ───────────────────────────────────────────────
@app.post("/api/analyze/skin")
def post_analyze_skin(req: SkinAnalysisRequest):
    return analyze_skin(req.skin_type, req.concerns, req.allergies, req.budget)


@app.get("/api/seasonal-tips")
def seasonal_tips():
    return get_seasonal_tips()


@app.get("/api/ingredient-of-the-day")
def ingredient_of_the_day():
    return get_ingredient_of_the_day()


# ─── Routine Builder ─────────────────────────────────────────────
@app.post("/api/routine/build")
def post_build_routine(req: RoutineRequest):
    return build_routine(req.product_ids, req.time_of_day)


# ─── Health ───────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "agents": ["formulation", "scraper", "skin_analyzer", "routine"], "version": "1.0.0"}
