"""
KrishiSetu - Veterinary Doctor Directory Routes
Owned by Member 2 (Backend & Computer Vision)
"""

from flask import Blueprint, request, jsonify
from db import query_db

vets_bp = Blueprint("vets", __name__, url_prefix="/api")


@vets_bp.route("/vets", methods=["GET"])
def get_vets():
    specialty = request.args.get("specialty", "").strip().lower()
    district = request.args.get("district", "").strip()
    query = request.args.get("q", "").strip().lower()

    sql = "SELECT * FROM vets WHERE 1=1"
    params = []

    if specialty in ("poultry", "dairy", "goat", "general"):
        sql += " AND specialty = ?"
        params.append(specialty)

    if district:
        sql += " AND district = ?"
        params.append(district)

    if query:
        sql += " AND (LOWER(name) LIKE ? OR LOWER(clinic) LIKE ? OR LOWER(notes) LIKE ?)"
        term = f"%{query}%"
        params.extend([term, term, term])

    sql += " ORDER BY district ASC, name ASC"
    rows = query_db(sql, params)
    return jsonify({"ok": True, "vets": rows})


@vets_bp.route("/vets/<int:vet_id>", methods=["GET"])
def get_vet_detail(vet_id):
    vet = query_db("SELECT * FROM vets WHERE id = ?", [vet_id], one=True)
    if not vet:
        return jsonify({"ok": False, "error": "Veterinary doctor not found."}), 404
    return jsonify({"ok": True, "vet": vet})

