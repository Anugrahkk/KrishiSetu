"""
KrishiSetu - Agricultural Inputs Routes (Seeds, Manure, Fertilizer)
Owned by Member 2 (Backend & Computer Vision)
"""

from flask import Blueprint, request, jsonify
from db import query_db

inputs_bp = Blueprint("inputs", __name__, url_prefix="/api")


@inputs_bp.route("/inputs", methods=["GET"])
def get_inputs():
    category = request.args.get("category", "").strip().lower()
    seller_type = request.args.get("seller_type", "").strip().lower()
    district = request.args.get("district", "").strip()
    query = request.args.get("q", "").strip().lower()
    sort = request.args.get("sort", "").strip().lower()

    sql = """
        SELECT i.id, i.seller_id, i.category, i.name, i.description, i.price, i.unit, i.stock, i.image,
               s.name AS seller_name, s.seller_type, s.district AS seller_district, s.phone AS seller_phone
        FROM inputs i
        JOIN sellers s ON i.seller_id = s.id
        WHERE 1=1
    """
    params = []

    if category in ("seed", "manure", "fertilizer"):
        sql += " AND i.category = ?"
        params.append(category)

    if seller_type in ("krishibhavan", "society", "private"):
        sql += " AND s.seller_type = ?"
        params.append(seller_type)

    if district:
        sql += " AND s.district = ?"
        params.append(district)

    if query:
        sql += " AND (LOWER(i.name) LIKE ? OR LOWER(i.description) LIKE ?)"
        term = f"%{query}%"
        params.extend([term, term])

    if sort == "price_asc":
        sql += " ORDER BY i.price ASC"
    elif sort == "price_desc":
        sql += " ORDER BY i.price DESC"
    else:
        sql += " ORDER BY i.id ASC"

    rows = query_db(sql, params)

    inputs = []
    for r in rows:
        inputs.append({
            "id": r["id"],
            "name": r["name"],
            "category": r["category"],
            "description": r["description"],
            "price": float(r["price"]),
            "unit": r["unit"],
            "stock": r["stock"],
            "image": r["image"] or "/static/img/placeholder.svg",
            "seller": {
                "id": r["seller_id"],
                "name": r["seller_name"],
                "seller_type": r["seller_type"],
                "district": r["seller_district"],
                "phone": r["seller_phone"]
            }
        })

    return jsonify({"ok": True, "inputs": inputs})


@inputs_bp.route("/inputs/<int:input_id>", methods=["GET"])
def get_input_detail(input_id):
    sql = """
        SELECT i.id, i.seller_id, i.category, i.name, i.description, i.price, i.unit, i.stock, i.image,
               s.name AS seller_name, s.seller_type, s.district AS seller_district, s.address AS seller_address, s.phone AS seller_phone
        FROM inputs i
        JOIN sellers s ON i.seller_id = s.id
        WHERE i.id = ?
    """
    row = query_db(sql, [input_id], one=True)
    if not row:
        return jsonify({"ok": False, "error": "Input item not found."}), 404

    return jsonify({
        "ok": True,
        "input": {
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "description": row["description"],
            "price": float(row["price"]),
            "unit": row["unit"],
            "stock": row["stock"],
            "image": row["image"] or "/static/img/placeholder.svg",
            "seller": {
                "id": row["seller_id"],
                "name": row["seller_name"],
                "seller_type": row["seller_type"],
                "district": row["seller_district"],
                "address": row["seller_address"],
                "phone": row["seller_phone"]
            }
        }
    })


@inputs_bp.route("/sellers", methods=["GET"])
def get_sellers():
    seller_type = request.args.get("seller_type", "").strip().lower()
    district = request.args.get("district", "").strip()

    sql = "SELECT * FROM sellers WHERE 1=1"
    params = []
    if seller_type:
        sql += " AND seller_type = ?"
        params.append(seller_type)
    if district:
        sql += " AND district = ?"
        params.append(district)

    sql += " ORDER BY name ASC"
    sellers = query_db(sql, params)
    return jsonify({"ok": True, "sellers": sellers})

