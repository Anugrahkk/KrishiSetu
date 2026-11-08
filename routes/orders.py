"""
KrishiSetu - Orders & Checkout Routes
Owned by Member 2 (Backend & Computer Vision)
Enforces backend price re-verification and stock management.
"""

from flask import Blueprint, request, jsonify, session
from db import get_db, query_db, execute_db
from routes.auth import login_required

orders_bp = Blueprint("orders", __name__, url_prefix="/api")


@orders_bp.route("/orders", methods=["POST"])
def place_order():
    data = request.get_json(silent=True) or request.form.to_dict()
    order_type = (data.get("order_type") or "").strip().lower()
    items_data = data.get("items") or []
    contact_name = (data.get("contact_name") or "").strip()
    contact_phone = (data.get("contact_phone") or "").strip()
    address = (data.get("address") or "").strip()

    if order_type not in ("input", "produce"):
        return jsonify({"ok": False, "error": "Order type must be 'input' or 'produce'."}), 400

    if not items_data or len(items_data) == 0:
        return jsonify({"ok": False, "error": "Order items cannot be empty."}), 400

    if not contact_name or not contact_phone or not address:
        return jsonify({"ok": False, "error": "Contact name, phone, and delivery address are required."}), 400

    db = get_db()
    user_id = session.get("user_id")
    user_role = session.get("role")

    # If no session user, associate with user by phone or create demo user
    if not user_id:
        phone_clean = contact_phone.strip()
        user_row = db.execute("SELECT id, role FROM users WHERE phone = ?", [phone_clean]).fetchone()
        if user_row:
            user_id = user_row["id"]
            user_role = user_row["role"]
        else:
            default_role = "farmer" if order_type == "input" else "buyer"
            cur = db.execute(
                "INSERT INTO users (name, phone, role, district, village) VALUES (?, ?, ?, ?, ?)",
                [contact_name or "Kerala Karshakan", phone_clean, default_role, "Ernakulam", "Kochi"]
            )
            db.commit()
            user_id = cur.lastrowid
            user_role = default_role
        session["user_id"] = user_id
        session["role"] = user_role

    total_amount = 0.0
    verified_items = []

    try:
        # Re-read prices and check stock within a transaction
        for item in items_data:
            item_id = item.get("item_id")
            try:
                qty = float(item.get("quantity", 1))
            except ValueError:
                return jsonify({"ok": False, "error": "Item quantity must be a valid number."}), 400

            if qty <= 0:
                continue

            if order_type == "input":
                cur = db.execute("SELECT id, name, price, stock FROM inputs WHERE id = ?", [item_id])
                row = cur.fetchone()
                if not row:
                    return jsonify({"ok": False, "error": f"Input item #{item_id} does not exist."}), 404
                if row["stock"] < qty:
                    return jsonify({
                        "ok": False,
                        "error": f"Insufficient stock for '{row['name']}'. Available: {row['stock']}."
                    }), 409

                unit_price = float(row["price"])
                total_amount += unit_price * qty
                verified_items.append({
                    "item_id": row["id"],
                    "item_name": row["name"],
                    "unit_price": unit_price,
                    "quantity": qty,
                    "table": "inputs"
                })

            else:  # produce
                cur = db.execute("SELECT id, name, price, quantity, is_active FROM produce WHERE id = ?", [item_id])
                row = cur.fetchone()
                if not row or not row["is_active"]:
                    return jsonify({"ok": False, "error": f"Produce item #{item_id} is no longer available."}), 404
                if row["quantity"] < qty:
                    return jsonify({
                        "ok": False,
                        "error": f"Only {row['quantity']} units available for '{row['name']}'."
                    }), 409

                unit_price = float(row["price"])
                total_amount += unit_price * qty
                verified_items.append({
                    "item_id": row["id"],
                    "item_name": row["name"],
                    "unit_price": unit_price,
                    "quantity": qty,
                    "table": "produce"
                })

        if not verified_items:
            return jsonify({"ok": False, "error": "No valid order items processed."}), 400

        # Insert master order
        cur = db.execute(
            """
            INSERT INTO orders (user_id, order_type, total, status, contact_name, contact_phone, address)
            VALUES (?, ?, ?, 'placed', ?, ?, ?)
            """,
            [user_id, order_type, total_amount, contact_name, contact_phone, address]
        )
        order_id = cur.lastrowid

        # Insert line items & decrement stock
        for v in verified_items:
            db.execute(
                """
                INSERT INTO order_items (order_id, item_type, item_id, item_name, unit_price, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [order_id, order_type, v["item_id"], v["item_name"], v["unit_price"], v["quantity"]]
            )

            if v["table"] == "inputs":
                db.execute("UPDATE inputs SET stock = stock - ? WHERE id = ?", [v["quantity"], v["item_id"]])
            else:
                db.execute("UPDATE produce SET quantity = quantity - ? WHERE id = ?", [v["quantity"], v["item_id"]])

        db.commit()

        return jsonify({
            "ok": True,
            "order_id": order_id,
            "total": round(total_amount, 2),
            "status": "placed",
            "message": "Order placed successfully (Pay on Delivery)."
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({"ok": False, "error": f"Failed to place order: {str(e)}"}), 500


@orders_bp.route("/orders/mine", methods=["GET"])
def get_my_orders():
    user_id = session.get("user_id")
    db = get_db()

    if user_id:
        orders_cur = db.execute(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        )
    else:
        orders_cur = db.execute(
            "SELECT * FROM orders ORDER BY created_at DESC LIMIT 15"
        )
    orders = [dict(r) for r in orders_cur.fetchall()]

    for o in orders:
        items_cur = db.execute(
            "SELECT item_id, item_name, unit_price, quantity FROM order_items WHERE order_id = ?",
            [o["id"]]
        )
        o["items"] = [dict(i) for i in items_cur.fetchall()]

    return jsonify({"ok": True, "orders": orders})


@orders_bp.route("/orders/<int:order_id>", methods=["GET"])
@login_required
def get_order_detail(order_id):
    user_id = session.get("user_id")
    order = query_db("SELECT * FROM orders WHERE id = ?", [order_id], one=True)
    if not order:
        return jsonify({"ok": False, "error": "Order not found."}), 404
    if order["user_id"] != user_id:
        return jsonify({"ok": False, "error": "Unauthorized to view this order."}), 403

    items = query_db(
        "SELECT item_id, item_name, unit_price, quantity FROM order_items WHERE order_id = ?",
        [order_id]
    )
    order["items"] = items
    return jsonify({"ok": True, "order": order})


@orders_bp.route("/orders/<int:order_id>/cancel", methods=["PATCH"])
@login_required
def cancel_order(order_id):
    user_id = session.get("user_id")
    db = get_db()

    order = db.execute("SELECT * FROM orders WHERE id = ?", [order_id]).fetchone()
    if not order:
        return jsonify({"ok": False, "error": "Order not found."}), 404
    if order["user_id"] != user_id:
        return jsonify({"ok": False, "error": "Unauthorized to cancel this order."}), 403
    if order["status"] != "placed":
        return jsonify({"ok": False, "error": f"Cannot cancel order in '{order['status']}' state."}), 400

    try:
        # Restore stock for each item
        items_cur = db.execute("SELECT item_type, item_id, quantity FROM order_items WHERE order_id = ?", [order_id])
        for it in items_cur.fetchall():
            if it["item_type"] == "input":
                db.execute("UPDATE inputs SET stock = stock + ? WHERE id = ?", [it["quantity"], it["item_id"]])
            else:
                db.execute("UPDATE produce SET quantity = quantity + ? WHERE id = ?", [it["quantity"], it["item_id"]])

        db.execute("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order_id])
        db.commit()

        return jsonify({"ok": True, "message": "Order cancelled and inventory restored."})
    except Exception as e:
        db.rollback()
        return jsonify({"ok": False, "error": f"Failed to cancel order: {str(e)}"}), 500

