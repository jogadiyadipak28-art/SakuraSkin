"""Skin Analyzer Agent — maps user concerns to product recommendations."""

from .formulation_agent import get_products_db, get_ingredients_db, analyze_ingredients

CONCERN_TO_ACTIVES = {
    "acne": ["salicylic_acid", "niacinamide", "benzoyl_peroxide", "tea_tree", "azelaic_acid", "zinc"],
    "blackheads": ["salicylic_acid", "glycolic_acid", "niacinamide"],
    "oiliness": ["niacinamide", "zinc", "salicylic_acid", "green_tea", "witch_hazel"],
    "dryness": ["hyaluronic_acid", "ceramides", "squalane", "glycerin", "panthenol", "shea_butter"],
    "dehydration": ["hyaluronic_acid", "glycerin", "snail_mucin", "aloe_vera"],
    "hyperpigmentation": ["vitamin_c", "alpha_arbutin", "niacinamide", "kojic_acid", "tranexamic_acid", "azelaic_acid", "licorice_root"],
    "dark_spots": ["alpha_arbutin", "vitamin_c", "kojic_acid", "tranexamic_acid", "licorice_root"],
    "melasma": ["tranexamic_acid", "azelaic_acid", "kojic_acid", "alpha_arbutin", "licorice_root"],
    "dullness": ["vitamin_c", "glycolic_acid", "lactic_acid", "niacinamide", "rice_extract", "turmeric"],
    "aging": ["retinol", "peptides", "vitamin_c", "hyaluronic_acid", "bakuchiol", "rosehip_oil"],
    "wrinkles": ["retinol", "peptides", "vitamin_c", "bakuchiol"],
    "fine_lines": ["retinol", "hyaluronic_acid", "peptides", "bakuchiol"],
    "sensitivity": ["centella", "panthenol", "ceramides", "aloe_vera", "colloidal_oatmeal", "madecassoside", "allantoin", "mugwort"],
    "redness": ["centella", "azelaic_acid", "panthenol", "mugwort", "licorice_root", "aloe_vera"],
    "enlarged_pores": ["niacinamide", "salicylic_acid", "zinc"],
    "texture": ["glycolic_acid", "lactic_acid", "mandelic_acid", "salicylic_acid"],
    "acne_scars": ["vitamin_c", "centella", "niacinamide", "glycolic_acid", "snail_mucin", "mandelic_acid"],
    "sun_damage": ["vitamin_c", "ferulic_acid", "green_tea", "spf"],
    "barrier_damage": ["ceramides", "panthenol", "centella", "squalane", "colloidal_oatmeal"],
    "eczema": ["ceramides", "colloidal_oatmeal", "panthenol", "shea_butter"],
    "uneven_tone": ["vitamin_c", "alpha_arbutin", "niacinamide", "kojic_acid", "rice_extract"],
    "inflammation": ["centella", "green_tea", "aloe_vera", "mugwort", "propolis", "azelaic_acid"],
    "sagging": ["peptides", "retinol", "bakuchiol"],
    "post_acne_marks": ["tranexamic_acid", "niacinamide", "alpha_arbutin", "vitamin_c"],
    "fungal_acne": ["tea_tree", "salicylic_acid"],
}

SKIN_TYPE_WARNINGS = {
    "sensitive": ["benzoyl_peroxide", "glycolic_acid", "retinol", "witch_hazel", "kojic_acid"],
    "dry": ["salicylic_acid", "benzoyl_peroxide", "witch_hazel"],
    "oily": ["shea_butter", "rosehip_oil"],
}


def analyze_skin(skin_type: str, concerns: list[str], allergies: list[str] = None, budget: str = "medium"):
    """Analyze skin concerns and recommend products."""
    if allergies is None:
        allergies = []

    ingredients_db = get_ingredients_db()
    products = get_products_db()

    recommended_actives = set()
    avoid_actives = set()
    for concern in concerns:
        actives = CONCERN_TO_ACTIVES.get(concern, [])
        recommended_actives.update(actives)

    warnings_for_type = SKIN_TYPE_WARNINGS.get(skin_type, [])
    for w in warnings_for_type:
        if w in recommended_actives:
            avoid_actives.add(w)

    for allergy in allergies:
        avoid_actives.add(allergy)

    seek = []
    for aid in recommended_actives:
        if aid not in avoid_actives and aid in ingredients_db:
            seek.append(ingredients_db[aid])

    avoid = []
    for aid in avoid_actives:
        if aid in ingredients_db:
            info = dict(ingredients_db[aid])
            info["reason"] = f"May not be suitable for {skin_type} skin" if aid in warnings_for_type else "Listed as allergy/sensitivity"
            avoid.append(info)

    budget_max = {"low": 600, "medium": 1200, "high": 5000}.get(budget, 1200)

    scored = []
    for p in products:
        if skin_type not in p.get("skin_types", []):
            continue
        if p.get("price", 0) > budget_max:
            continue

        score = 0
        matched_concerns = []
        for concern in concerns:
            if concern in p.get("concerns", []):
                score += 20
                matched_concerns.append(concern)

        for active in p.get("key_actives", []):
            if active in recommended_actives:
                score += 15
            if active in avoid_actives:
                score -= 30

        analysis = analyze_ingredients(p.get("ingredients", []))
        score -= len(analysis["conflicts"]) * 10
        score += len(analysis["synergies"]) * 5

        if score > 0:
            scored.append({
                "product": p,
                "match_score": min(score, 100),
                "matched_concerns": matched_concerns,
                "analysis": analysis,
            })

    scored.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "skin_type": skin_type,
        "concerns": concerns,
        "recommended_actives": seek,
        "avoid_actives": avoid,
        "recommended_products": scored[:10],
        "total_matches": len(scored),
    }


def get_seasonal_tips():
    """Return seasonal skincare tips."""
    import datetime
    month = datetime.datetime.now().month
    if month in (3, 4, 5):
        season = "spring"
        tips = [
            {"title": "Transition Your Routine", "tip": "Switch from heavy winter creams to lighter gel moisturizers as humidity rises.", "icon": "🌸"},
            {"title": "Layer SPF", "tip": "UV rays are getting stronger! Make sure you're applying SPF 30+ daily.", "icon": "☀️"},
            {"title": "Gentle Exfoliation", "tip": "Shed winter's dead skin buildup with a weekly AHA treatment.", "icon": "✨"},
        ]
    elif month in (6, 7, 8):
        season = "summer"
        tips = [
            {"title": "Double Down on SPF", "tip": "Reapply sunscreen every 2 hours. Use water-resistant formulas if you sweat.", "icon": "🧴"},
            {"title": "Lightweight Hydration", "tip": "Swap cream moisturizers for water-based gels with hyaluronic acid.", "icon": "💧"},
            {"title": "Antioxidant Shield", "tip": "Use a Vitamin C serum in the morning to fight free radical damage from UV.", "icon": "🍊"},
            {"title": "Monsoon Alert", "tip": "Humidity breeds bacteria — keep niacinamide and salicylic acid handy for breakouts.", "icon": "🌧️"},
        ]
    elif month in (9, 10, 11):
        season = "autumn"
        tips = [
            {"title": "Repair Summer Damage", "tip": "Incorporate Vitamin C and retinol to reverse sun damage and dark spots.", "icon": "🍂"},
            {"title": "Barrier Repair", "tip": "Add ceramides and peptides to strengthen your skin before winter.", "icon": "🛡️"},
            {"title": "Introduce Retinol", "tip": "Fall is the perfect time to start retinol — less UV exposure means less sensitivity risk.", "icon": "🌙"},
        ]
    else:
        season = "winter"
        tips = [
            {"title": "Rich Moisturizers", "tip": "Switch to cream-based moisturizers with ceramides and squalane to combat dryness.", "icon": "❄️"},
            {"title": "Gentle Cleansing", "tip": "Use cream or milk cleansers instead of foaming ones to preserve skin oils.", "icon": "🧖"},
            {"title": "Humectant Layering", "tip": "Layer hyaluronic acid under moisturizer to draw moisture into skin.", "icon": "💦"},
            {"title": "Don't Skip SPF", "tip": "UVA rays penetrate clouds and windows. SPF is a year-round essential!", "icon": "☀️"},
        ]
    return {"season": season, "tips": tips}


def get_ingredient_of_the_day():
    """Return a rotating ingredient of the day."""
    import datetime
    db = get_ingredients_db()
    ids = sorted(db.keys())
    day = datetime.datetime.now().timetuple().tm_yday
    idx = day % len(ids)
    return db[ids[idx]]
