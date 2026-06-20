import json, os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def _load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)

def get_ingredients_db():
    return {i["id"]: i for i in _load("ingredients_db.json")}

def get_interactions_db():
    return _load("interactions_db.json")

def get_products_db():
    return _load("products_db.json")

_INCI_TO_ID = None

def _build_inci_map():
    global _INCI_TO_ID
    if _INCI_TO_ID is None:
        db = get_ingredients_db()
        _INCI_TO_ID = {}
        for iid, info in db.items():
            _INCI_TO_ID[info["inci"].lower()] = iid
            _INCI_TO_ID[info["common"].lower()] = iid
            _INCI_TO_ID[iid.lower()] = iid
    return _INCI_TO_ID

def resolve_ingredient(name: str):
    mapping = _build_inci_map()
    key = name.strip().lower()
    if key in mapping:
        db = get_ingredients_db()
        return db.get(mapping[key])
    for k, v in mapping.items():
        if key in k or k in key:
            db = get_ingredients_db()
            return db.get(v)
    return None

def analyze_ingredients(ingredient_names: list[str]):
    """Formulation Agent: analyze a list of INCI ingredients."""
    db = get_ingredients_db()
    interactions = get_interactions_db()
    resolved = []
    unresolved = []
    for name in ingredient_names:
        info = resolve_ingredient(name)
        if info:
            resolved.append(info)
        else:
            unresolved.append(name)

    resolved_ids = {r["id"] for r in resolved}
    conflicts = []
    for c in interactions.get("conflicts", []):
        a, b = c["pair"]
        if a in resolved_ids and b in resolved_ids:
            conflicts.append(c)

    synergies = []
    for s in interactions.get("synergies", []):
        a, b = s["pair"]
        if a in resolved_ids and b in resolved_ids:
            synergies.append(s)

    cautions = []
    for ca in interactions.get("cautions", []):
        a, b = ca["pair"]
        if a in resolved_ids and b in resolved_ids:
            cautions.append(ca)

    total = len(resolved)
    if total == 0:
        safety_score = 50
    else:
        avg_safety = sum(r["safety_rating"] for r in resolved) / total
        conflict_penalty = len(conflicts) * 10
        synergy_bonus = len(synergies) * 5
        safety_score = max(0, min(100, int(100 - avg_safety * 8 - conflict_penalty + synergy_bonus)))

    return {
        "resolved_ingredients": resolved,
        "unresolved_ingredients": unresolved,
        "conflicts": conflicts,
        "synergies": synergies,
        "cautions": cautions,
        "safety_score": safety_score,
        "total_ingredients": len(ingredient_names),
        "recognized": len(resolved),
    }


def analyze_product(product_id: str):
    """Analyze a specific product by ID."""
    products = get_products_db()
    product = None
    for p in products:
        if p["id"] == product_id:
            product = p
            break
    if not product:
        return None
    analysis = analyze_ingredients(product.get("ingredients", []))
    analysis["product"] = product
    return analysis


def compare_products(product_ids: list[str]):
    """Compare multiple products."""
    products = get_products_db()
    product_map = {p["id"]: p for p in products}
    results = []
    for pid in product_ids:
        p = product_map.get(pid)
        if p:
            analysis = analyze_ingredients(p.get("ingredients", []))
            analysis["product"] = p
            results.append(analysis)

    if len(results) < 2:
        return {"products": results, "shared_ingredients": [], "unique_ingredients": {}}

    all_sets = []
    for r in results:
        ids = {i["id"] for i in r["resolved_ingredients"]}
        all_sets.append(ids)

    shared = all_sets[0]
    for s in all_sets[1:]:
        shared = shared & s

    db = get_ingredients_db()
    shared_info = [db[sid] for sid in shared if sid in db]

    unique = {}
    for i, r in enumerate(results):
        pid = r["product"]["id"]
        ids = {ing["id"] for ing in r["resolved_ingredients"]}
        others = set()
        for j, r2 in enumerate(results):
            if i != j:
                others |= {ing["id"] for ing in r2["resolved_ingredients"]}
        uniq = ids - others
        unique[pid] = [db[uid] for uid in uniq if uid in db]

    return {
        "products": results,
        "shared_ingredients": shared_info,
        "unique_ingredients": unique,
    }


def find_dupes(product_id: str, threshold: float = 0.5):
    """Find products with similar ingredient lists."""
    products = get_products_db()
    target = None
    for p in products:
        if p["id"] == product_id:
            target = p
            break
    if not target:
        return []

    target_ings = set()
    for name in target.get("ingredients", []):
        info = resolve_ingredient(name)
        if info:
            target_ings.add(info["id"])

    if not target_ings:
        return []

    dupes = []
    for p in products:
        if p["id"] == product_id:
            continue
        p_ings = set()
        for name in p.get("ingredients", []):
            info = resolve_ingredient(name)
            if info:
                p_ings.add(info["id"])
        if not p_ings:
            continue
        overlap = target_ings & p_ings
        similarity = len(overlap) / max(len(target_ings), len(p_ings))
        if similarity >= threshold:
            dupes.append({
                "product": p,
                "similarity": round(similarity * 100),
                "shared_ingredients": list(overlap),
                "price_diff": target.get("price", 0) - p.get("price", 0),
            })

    dupes.sort(key=lambda d: d["similarity"], reverse=True)
    return dupes
