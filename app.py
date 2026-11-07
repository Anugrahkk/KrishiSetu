"""
KrishiSetu - Main Application Server
Owned by Member 2 (Backend & Computer Vision)
Serves Flask API routes and Member 1 HTML templates.
"""

import os
import sqlite3
from flask import Flask, render_template, send_from_directory, jsonify, g
import config
from db import close_db, init_db
from cv.disease_detector import selftest

# Initialize Flask application
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)
app.config.from_object("config")

# Register database connection teardown
app.teardown_appcontext(close_db)

# ---------------------------------------------------------------------------
# Blueprints Registration
# ---------------------------------------------------------------------------
from routes.auth import auth_bp
from routes.inputs import inputs_bp
from routes.produce import produce_bp
from routes.orders import orders_bp
from routes.vets import vets_bp
from routes.scan import scan_bp

app.register_blueprint(auth_bp)
app.register_blueprint(inputs_bp)
app.register_blueprint(produce_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(vets_bp)
app.register_blueprint(scan_bp)

# Startup CV Self-Test
cv_status = selftest()


# ---------------------------------------------------------------------------
# Static Uploads Serving
# ---------------------------------------------------------------------------
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(config.UPLOAD_FOLDER, filename)


# ---------------------------------------------------------------------------
# Health Check Endpoint (/api/health)
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    db_ok = False
    try:
        conn = sqlite3.connect(config.DATABASE)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        db_ok = True
    except Exception:
        db_ok = False

    return jsonify({
        "ok": True,
        "db": db_ok,
        "cv_ready": cv_status,
        "service": "KrishiSetu Web Server",
        "version": "1.0.0"
    })


# ---------------------------------------------------------------------------
# Page Routes (Serves Member 1 Frontend Templates)
# ---------------------------------------------------------------------------
@app.route("/")
def index_page():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

# Farmer Pages
@app.route("/farmer")
def farmer_dashboard():
    return render_template("farmer/dashboard.html")

@app.route("/farmer/inputs")
def farmer_inputs():
    return render_template("farmer/inputs.html")

@app.route("/farmer/doctor")
def farmer_doctor():
    return render_template("farmer/doctor.html")

@app.route("/farmer/sell")
def farmer_sell():
    return render_template("farmer/sell.html")

@app.route("/farmer/vets")
def farmer_vets():
    return render_template("farmer/vets.html")

@app.route("/farmer/cart")
def farmer_cart():
    return render_template("farmer/cart.html")

@app.route("/farmer/orders")
def farmer_orders():
    return render_template("farmer/orders.html")

# Buyer Pages
@app.route("/buyer")
def buyer_home():
    return render_template("buyer/home.html")

@app.route("/buyer/produce")
def buyer_produce():
    return render_template("buyer/produce.html")

@app.route("/buyer/product/<int:product_id>")
def buyer_product(product_id):
    return render_template("buyer/product.html")

@app.route("/buyer/cart")
def buyer_cart():
    return render_template("buyer/cart.html")

@app.route("/buyer/orders")
def buyer_orders():
    return render_template("buyer/orders.html")


# ---------------------------------------------------------------------------
# Global Error Handlers (Reliability Requirement: Never show raw 500)
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"ok": False, "error": "Requested resource or page not found."}), 404

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"ok": False, "error": "Uploaded file is too large. Max limit is 5 MB."}), 413

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"ok": False, "error": "An internal server problem occurred. Please try again or use a sample."}), 500


# ---------------------------------------------------------------------------
# Application Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Ensure database is seeded if not present
    if not os.path.exists(config.DATABASE):
        print("[App] Database not found. Initializing schema and seed data...")
        init_db()

    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    print("==================================================================")
    print(" 🌾 KrishiSetu (കൃഷിസേതു) - TinkerHub Hackathon Web App")
    print(f" Database: {config.DATABASE}")
    print(f" Computer Vision Status: {'READY' if cv_status else 'FALLBACK'}")
    print(" Running at: http://127.0.0.1:5000")
    print("==================================================================")
    app.run(host="0.0.0.0", port=5000, debug=True)

