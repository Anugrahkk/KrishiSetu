"""
KrishiSetu - Produce Marketplace & Farmer Listings Routes
Owned by Member 2 (Backend & Computer Vision)
"""

import os
import uuid
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
from db import query_db, execute_db
from routes.auth import login_required, role_required
import config

produce_bp = Blueprint("produce", __name__, url_prefix="/api")


def is_fair_price(category: str, price: float) -> bool:
    """Computes if price falls within ethical fair-market benchmark range."""
    rng = config.FAIR_PRICE_RANGES.get(category.lower(), (10.0, 100.0))
    return rng[0] <= price <= rng[1]


# ---------------------------------------------------------------------------
# Farmer Side (Sell Produce)
# ---------------------------------------------------------------------------

@produce_bp.route("/produce", methods=["POST"])
@role_required("farmer")
def create_produce():
    user_id = session.get("user_id")

    category = (request.form.get("category") or "").strip().lower()
    name = (request.form.get("name") or "").strip()
    price_val = request.form.get("price")
    unit = (request.form.get("unit") or "kg").strip()
    quantity_val = request.form.get("quantity")
    district = (request.form.get("district") or "").strip()
    description = (request.form.get("description") or "").strip()

    if not category or not name or price_val is None:
        return jsonify({"ok": False, "error": "Category, name, and price are required."}), 400

    try:
        price = float(price_val)
        quantity = float(quantity_val or 0)
    except ValueError:
        return jsonify({"ok": False, "error": "Price and quantity must be valid numbers."}), 400

    if price < 0:
        return jsonify({"ok": False, "error": "Price cannot be negative."}), 400

    image_path = "/static/img/placeholder.svg"
    file = request.files.get("image")
    if file and file.filename != "":
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext in config.ALLOWED_EXTENSIONS:
            safe_name = f"produce_{uuid.uuid4().hex[:10]}.{ext}"
            os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
            save_dest = os.path.join(config.UPLOAD_FOLDER, safe_name)
            file.save(save_dest)
            image_path = f"/uploads/{safe_name}"

    produce_id, _ = execute_db(
        """
        INSERT INTO produce (farmer_id, category, name, price, unit, quantity, district, description, image, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """,
        [user_id, category, name, price, unit, quantity, district, description, image_path]
    )

    return jsonify({
        "ok": True,
        "produce_id": produce_id,
        "message": "Harvest listing created successfully."
    }), 201


@produce_bp.route("/produce/mine", methods=["GET"])
@role_required("farmer")
def get_my_produce():
    user_id = session.get("user_id")
    sql = "SELECT * FROM produce WHERE farmer_id = ? AND is_active = 1 ORDER BY created_at DESC"
    rows = query_db(sql, [user_id])
    return jsonify({"ok": True, "produce": rows})


@produce_bp.route("/produce/<int:produce_id>", methods=["PUT"])
@role_required("farmer")
def update_produce(produce_id):
    user_id = session.get("user_id")
    existing = query_db("SELECT id, farmer_id FROM produce WHERE id = ?", [produce_id], one=True)
    if not existing:
        return jsonify({"ok": False, "error": "Listing not found."}), 404
    if existing["farmer_id"] != user_id:
        return jsonify({"ok": False, "error": "Unauthorized. You do not own this listing."}), 403

    data = request.get_json(silent=True) or request.form.to_dict()
    updates = []
    params = []

    if "price" in data:
        try:
            updates.append("price = ?")
            params.append(float(data["price"]))
        except ValueError:
            return jsonify({"ok": False, "error": "Invalid price format."}), 400

    if "quantity" in data:
        try:
            updates.append("quantity = ?")
            params.append(float(data["quantity"]))
        except ValueError:
            return jsonify({"ok": False, "error": "Invalid quantity format."}), 400

    if "is_active" in data:
        updates.append("is_active = ?")
        params.append(1 if data["is_active"] in (1, True, "1", "true") else 0)

    if not updates:
        return jsonify({"ok": False, "error": "No update fields provided."}), 400

    params.append(produce_id)
    execute_db(f"UPDATE produce SET {', '.join(updates)} WHERE id = ?", params)
    return jsonify({"ok": True, "message": "Listing updated successfully."})


@produce_bp.route("/produce/<int:produce_id>", methods=["DELETE"])
@role_required("farmer")
def delete_produce(produce_id):
    user_id = session.get("user_id")
    existing = query_db("SELECT id, farmer_id FROM produce WHERE id = ?", [produce_id], one=True)
    if not existing:
        return jsonify({"ok": False, "error": "Listing not found."}), 404
    if existing["farmer_id"] != user_id:
        return jsonify({"ok": False, "error": "Unauthorized. You do not own this listing."}), 403

    # Soft delete via is_active = 0
    execute_db("UPDATE produce SET is_active = 0 WHERE id = ?", [produce_id])
    return jsonify({"ok": True, "message": "Listing deactivated successfully."})


# ---------------------------------------------------------------------------
# Buyer & Public Side (Browse Fresh Produce)
# ---------------------------------------------------------------------------

@produce_bp.route("/produce", methods=["GET"])
def browse_produce():
    category = request.args.get("category", "").strip().lower()
    district = request.args.get("district", "").strip()
    query = request.args.get("q", "").strip().lower()
    sort = request.args.get("sort", "").strip().lower()

    sql = """
        SELECT p.id, p.farmer_id, p.category, p.name, p.price, p.unit, p.quantity, p.district,
               p.description, p.image, p.created_at,
               u.name AS farmer_name, u.village AS farmer_village, u.phone AS farmer_phone
        FROM produce p
        JOIN users u ON p.farmer_id = u.id
        WHERE p.is_active = 1
    """
    params = []

    if category in ("crop", "vegetable", "fruit", "egg", "milk", "other"):
        sql += " AND p.category = ?"
        params.append(category)

    if district:
        sql += " AND p.district = ?"
        params.append(district)

    if query:
        sql += " AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)"
        term = f"%{query}%"
        params.extend([term, term])

    if sort == "price_asc":
        sql += " ORDER BY p.price ASC"
    elif sort == "price_desc":
        sql += " ORDER BY p.price DESC"
    else:
        sql += " ORDER BY p.created_at DESC"

    rows = query_db(sql, params)

    produce_list = []
    for r in rows:
        price = float(r["price"])
        produce_list.append({
            "id": r["id"],
            "name": r["name"],
            "category": r["category"],
            "price": price,
            "unit": r["unit"],
            "quantity": float(r["quantity"]),
            "district": r["district"],
            "village": r["farmer_village"],
            "description": r["description"],
            "image": r["image"] or "/static/img/placeholder.svg",
            "fair_price": is_fair_price(r["category"], price),
            "farmer_name": r["farmer_name"],
            "farmer": {
                "id": r["farmer_id"],
                "name": r["farmer_name"],
                "village": r["farmer_village"],
                "district": r["district"]
            }
        })

    return jsonify({"ok": True, "produce": produce_list})


@produce_bp.route("/produce/<int:produce_id>", methods=["GET"])
def get_produce_detail(produce_id):
    sql = """
        SELECT p.id, p.farmer_id, p.category, p.name, p.price, p.unit, p.quantity, p.district,
               p.description, p.image, p.created_at,
               u.name AS farmer_name, u.village AS farmer_village, u.district AS farmer_district, u.phone AS farmer_phone
        FROM produce p
        JOIN users u ON p.farmer_id = u.id
        WHERE p.id = ? AND p.is_active = 1
    """
    row = query_db(sql, [produce_id], one=True)
    if not row:
        return jsonify({"ok": False, "error": "Produce listing not found."}), 404

    price = float(row["price"])
    return jsonify({
        "ok": True,
        "produce": {
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "price": price,
            "unit": row["unit"],
            "quantity": float(row["quantity"]),
            "district": row["district"],
            "village": row["farmer_village"],
            "description": row["description"],
            "image": row["image"] or "/static/img/placeholder.svg",
            "fair_price": is_fair_price(row["category"], price),
            "farmer_name": row["farmer_name"],
            "farmer": {
                "id": row["farmer_id"],
                "name": row["farmer_name"],
                "village": row["farmer_village"],
                "district": row["farmer_district"],
                "phone": row["farmer_phone"]
            }
        }
    })

