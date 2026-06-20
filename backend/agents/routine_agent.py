"""Routine Agent — builds and validates AM/PM skincare routines."""

from .formulation_agent import get_products_db, get_interactions_db, resolve_ingredient

STEP_ORDER = {
    "cleanser": 1,
    "toner": 2,
    "essence": 3,
    "serum": 4,
    "treatment": 5,
    "eye_cream": 6,
    "moisturizer": 7,
    "oil": 8,
    "sunscreen": 9,
    "scrub": 10,
}

AM_REQUIRED = ["cleanser", "moisturizer", "sunscreen"]
PM_REQUIRED = ["cleanser", "moisturizer"]
AM_OPTIONAL = ["toner", "essence", "serum", "eye_cream"]
PM_OPTIONAL = ["toner", "essence", "serum", "treatment", "eye_cream", "oil"]


def build_routine(product_ids: list[str], time_of_day: str = "am"):
    """Build and validate a skincare routine."""
    products = get_products_db()
    product_map = {p["id"]: p for p in products}
    interactions = get_interactions_db()

    routine_products = []
    for pid in product_ids:
        p = product_map.get(pid)
        if p:
            routine_products.append(p)

    routine_products.sort(key=lambda p: STEP_ORDER.get(p.get("category", ""), 99))

    all_ingredient_ids = set()
    for p in routine_products:
        for ing_name in p.get("ingredients", []):
            info = resolve_ingredient(ing_name)
            if info:
                all_ingredient_ids.add(info["id"])

    conflicts = []
    for c in interactions.get("conflicts", []):
        a, b = c["pair"]
        if a in all_ingredient_ids and b in all_ingredient_ids:
            prod_a = []
            prod_b = []
            for p in routine_products:
                p_ings = set()
                for ing_name in p.get("ingredients", []):
                    info = resolve_ingredient(ing_name)
                    if info:
                        p_ings.add(info["id"])
                if a in p_ings:
                    prod_a.append(p["name"])
                if b in p_ings:
                    prod_b.append(p["name"])
            conflicts.append({
                **c,
                "found_in_a": prod_a,
                "found_in_b": prod_b,
            })

    wait_times = []
    for ca in interactions.get("cautions", []):
        a, b = ca["pair"]
        if a in all_ingredient_ids and b in all_ingredient_ids and ca.get("wait_time"):
            wait_times.append(ca)

    required = AM_REQUIRED if time_of_day == "am" else PM_REQUIRED
    categories_present = {p.get("category", "") for p in routine_products}
    missing = [step for step in required if step not in categories_present]

    warnings = []
    for m in missing:
        if m == "sunscreen" and time_of_day == "am":
            warnings.append({"type": "missing_step", "step": m, "message": "⚠️ No sunscreen in your AM routine! SPF is the #1 anti-aging product.", "severity": "high"})
        elif m == "cleanser":
            warnings.append({"type": "missing_step", "step": m, "message": "⚠️ No cleanser — always start with a clean canvas!", "severity": "high"})
        elif m == "moisturizer":
            warnings.append({"type": "missing_step", "step": m, "message": "⚠️ No moisturizer — even oily skin needs hydration to maintain the barrier.", "severity": "medium"})

    for c in conflicts:
        warnings.append({
            "type": "conflict",
            "message": f"⚠️ {c['pair'][0].replace('_',' ').title()} × {c['pair'][1].replace('_',' ').title()}: {c['reason']}",
            "severity": c["severity"],
            "suggestion": c.get("suggestion", ""),
        })

    total = len(routine_products)
    if total == 0:
        score = 0
    else:
        score = 100
        score -= len(conflicts) * 15
        score -= len(missing) * 10
        score = max(0, min(100, score))

    ordered = []
    for p in routine_products:
        step_num = STEP_ORDER.get(p.get("category", ""), 99)
        ordered.append({
            "product": p,
            "step_number": step_num,
            "step_name": p.get("category", "unknown").replace("_", " ").title(),
        })

    return {
        "time_of_day": time_of_day,
        "ordered_steps": ordered,
        "conflicts": conflicts,
        "wait_times": wait_times,
        "warnings": warnings,
        "missing_steps": missing,
        "routine_score": score,
        "total_products": total,
    }
