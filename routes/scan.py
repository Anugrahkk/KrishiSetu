"""
KrishiSetu - Crop Doctor OpenCV Scan Routes
Owned by Member 2 (Backend & Computer Vision)
Strictly adheres to artifacts/api.md Section 4 and architecture.md.
"""

import os
import uuid
from flask import Blueprint, request, jsonify, session
from cv.disease_detector import analyze_leaf
from db import query_db, execute_db
import config

scan_bp = Blueprint("scan", __name__, url_prefix="/api")

SAMPLES_DIR = os.path.join(config.BASE_DIR, "cv", "samples")


@scan_bp.route("/scan", methods=["POST"])
def scan_crop_leaf():
    file = request.files.get("image")
    if not file or file.filename == "":
        return jsonify({"ok": False, "error": "Please choose a photo first."}), 400

    image_bytes = file.read()
    if not image_bytes or len(image_bytes) == 0:
        return jsonify({"ok": False, "error": "The uploaded photo is empty."}), 400

    if len(image_bytes) > config.MAX_CONTENT_LENGTH:
        return jsonify({
            "ok": True,
            "status": "retry",
            "message": "The photo file exceeds 5 MB. Please capture at standard resolution."
        })

    # Execute OpenCV analysis (guaranteed never to raise unhandled exceptions)
    result = analyze_leaf(image_bytes)

    # Save to scans database if logged in as farmer
    scan_id = None
    user_id = session.get("user_id")
    if user_id and result.get("status") == "ok":
        try:
            # Optionally save upload file for history
            ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
            saved_name = f"scan_{uuid.uuid4().hex[:10]}.{ext}"
            os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
            save_path = os.path.join(config.UPLOAD_FOLDER, saved_name)
            with open(save_path, "wb") as f:
                f.write(image_bytes)

            scan_id, _ = execute_db(
                """
                INSERT INTO scans (user_id, image_path, condition_code, confidence, severity, affected_pct)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    user_id,
                    f"/uploads/{saved_name}",
                    result.get("condition_code"),
                    result.get("confidence"),
                    result.get("severity"),
                    result.get("affected_percent")
                ]
            )
        except Exception as e:
            # Non-blocking log
            print(f"[Scan DB Warning] Could not record scan: {e}")

    result["scan_id"] = scan_id
    return jsonify(result)


@scan_bp.route("/scan/sample/<int:sample_num>", methods=["GET"])
def scan_sample_leaf(sample_num):
    """
    Runs the OpenCV pipeline on bundled test sample images.
    Used for 1-click testing, judges live demo, and offline reliability.
    """
    if sample_num not in (1, 2, 3):
        return jsonify({"ok": False, "error": "Sample number must be 1, 2, or 3."}), 404

    sample_path = os.path.join(SAMPLES_DIR, f"sample{sample_num}.png")

    if not os.path.exists(sample_path):
        # Fallback to static SVG / placeholder if PNG not on disk
        svg_map = {1: "sample-healthy.svg", 2: "sample-spotted.svg", 3: "sample-yellowing.svg"}
        sample_path = os.path.join(config.BASE_DIR, "static", "img", svg_map.get(sample_num, "sample-healthy.svg"))

    try:
        with open(sample_path, "rb") as f:
            image_bytes = f.read()
    except Exception as e:
        return jsonify({
            "ok": True,
            "status": "retry",
            "message": f"Sample image file could not be read: {e}"
        })

    result = analyze_leaf(image_bytes)
    return jsonify(result)


@scan_bp.route("/scans/mine", methods=["GET"])
def get_my_scans():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"ok": True, "scans": []})

    scans = query_db(
        "SELECT id, image_path, condition_code, confidence, severity, affected_pct, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [user_id]
    )
    return jsonify({"ok": True, "scans": scans})


@scan_bp.route("/diseases", methods=["GET"])
def get_diseases_lookup():
    diseases = query_db("SELECT code, title, description, advice FROM diseases ORDER BY id ASC")
    return jsonify({"ok": True, "diseases": diseases})

