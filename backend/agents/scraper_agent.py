"""Scraper Agent — fetches product data from web or returns from local DB."""

from .formulation_agent import get_products_db

async def scrape_product(url: str):
    """
    Scrape product INCI data from a URL.
    In demo mode, returns a curated response. In production, this would use
    httpx + BeautifulSoup4 to parse real product pages.
    """
    return {
        "status": "demo_mode",
        "message": "Live scraping is available in production mode. Using curated database.",
        "url": url,
        "suggestion": "Try browsing our curated collection of 45+ products from popular brands!",
    }


def search_products(query: str = "", brand: str = "", category: str = "",
                    concern: str = "", skin_type: str = "",
                    min_price: int = 0, max_price: int = 99999,
                    sort_by: str = "relevance"):
    """Search and filter products from the database."""
    products = get_products_db()
    results = []

    for p in products:
        if brand and p.get("brand", "").lower() != brand.lower():
            continue
        if category and p.get("category", "").lower() != category.lower():
            continue
        if concern and concern not in p.get("concerns", []):
            continue
        if skin_type and skin_type not in p.get("skin_types", []):
            continue
        price = p.get("price", 0)
        if price < min_price or price > max_price:
            continue
        if query:
            q = query.lower()
            searchable = f"{p.get('name','')} {p.get('brand','')} {' '.join(p.get('key_actives',[]))}".lower()
            if q not in searchable:
                continue
        results.append(p)

    if sort_by == "price_low":
        results.sort(key=lambda p: p.get("price", 0))
    elif sort_by == "price_high":
        results.sort(key=lambda p: p.get("price", 0), reverse=True)
    elif sort_by == "rating":
        results.sort(key=lambda p: p.get("rating", 0), reverse=True)
    elif sort_by == "name":
        results.sort(key=lambda p: p.get("name", ""))

    return results


def get_brands():
    """Return list of unique brands."""
    products = get_products_db()
    return sorted(set(p.get("brand", "") for p in products))


def get_categories():
    """Return list of unique categories."""
    products = get_products_db()
    return sorted(set(p.get("category", "") for p in products))
