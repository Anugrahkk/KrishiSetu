# KrishiSetu (കൃഷിസേതു) 🌾

> **TinkerHub Hackathon 6-Hour Prototype**  
> **Domain**: Agriculture & Food • **Core Tech**: Computer Vision (OpenCV) + Python (Flask)  
> **Team**: 
> - **Member 1 (Anugrah)**: Frontend, Design System, Templates, Pitch & Content
> - **Member 2**: Backend, Computer Vision Pipeline, SQLite Database, API Routes

---

## 📖 Overview
Smallholder farmers in Kerala frequently lose profits to intermediate middlemen, struggle to identify sudden crop diseases, and overpay for agricultural inputs.

**KrishiSetu** bridges these gaps in a single, lightweight web application:
1. **Subsidized Inputs**: Compare seeds, bio-manure (vermicompost), and fertilizers from nearby Krishibhavans and agricultural cooperatives.
2. **Crop Doctor (OpenCV)**: Instant leaf disease diagnosis using rule-based HSV segmentation, necrotic contour extraction, and practical agricultural checklists.
3. **Direct Harvest Sales**: Farmers list crops, fruits, milk, and eggs with a verified **FAIR PRICE** indicator for consumers.
4. **Veterinary Directory**: Direct tap-to-call directory for dairy, poultry, and goat health support.

---

## 🚀 Quick Start Guide

### 1. Prerequisites & Virtual Environment
Ensure Python 3.9+ is installed on your system.

```bash
# Clone the repository
git clone https://github.com/your-username/krishisetu.git
cd KrishiSetu

# Create and activate virtual environment
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### 2. Initialize the Database
Run the database setup script to generate `krishisetu.db` and load sample Kerala agricultural data:

```bash
python db.py
```
*(Applies `schema.sql` and loads `seed.sql` with sellers, subsidized inputs, demo accounts, and disease advice).*

### 3. Launch the Server
```bash
python app.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your web browser.

---

## 👥 Demo Accounts (Pre-seeded)

Use these credentials to test both sides of the platform:

| Role | Mobile Phone | Password | Name & Location |
|---|---|---|---|
| **🌾 Farmer** | `9876543210` | `farmer123` | Rajan Pillai (Aluva, Ernakulam) |
| **🛒 Buyer** | `9876543211` | `buyer123` | Suresh Kumar (Kakkanad, Ernakulam) |

*(Note: The login page also features 1-click **"Farmer Demo"** and **"Buyer Demo"** quick-fill buttons).*

---

## 🩺 Crop Doctor Architecture (OpenCV Engine)

The Crop Doctor (`cv/disease_detector.py`) executes a 15-step deterministic computer vision pipeline:
1. **Image Validation**: Checks minimum dimensions (100x100 px) and file limits (< 5 MB).
2. **Standardization**: Resizes longest side to 640 px for fast processing.
3. **Quality & Blur Filtering**: Evaluates mean grayscale luminosity (rejects dark < 40 or overexposed > 238) and Laplacian variance (flags blurry < 25).
4. **Denoising**: 5x5 Gaussian filtering.
5. **Color Space Conversion**: BGR to HSV segmentation.
6. **Mask Extraction**: Segment green foliage, yellow chlorosis, brown necrotic lesions, and white powdery mildew.
7. **Contour Geometry**: Outlines lesions (`cv2.findContours`) and quantifies spot count and area.
8. **Rule Engine**: Computes leaf damage percentage, severity category (Mild, Moderate, Severe), and returns annotated contour overlays.
9. **Zero-Crash Design**: Entire pipeline is wrapped in safe exception handling returning friendly retake tips instead of HTTP 500 error pages.

---

## 🗂️ Project Structure

```
KrishiSetu/
├── app.py                  # Main Flask entrypoint & page routing
├── config.py               # Paths, limits, and fair-price reference rules
├── db.py                   # SQLite connection and database helpers
├── schema.sql              # Database schema tables and indexes
├── seed.sql                # Kerala agricultural demo seed data
├── requirements.txt        # Pinned Python package dependencies
├── .gitignore              # Ignored virtualenv, database, and uploads
├── cv/
│   ├── disease_detector.py # Rule-based OpenCV leaf disease engine
│   ├── advice.py           # Condition codes & actionable remedies
│   └── samples/            # Bundled test leaf images (sample1, 2, 3)
├── routes/
│   ├── auth.py             # User registration, login, session
│   ├── inputs.py           # Subsidized seeds, manure, fertilizers
│   ├── produce.py          # Direct farmer produce listings & fair price
│   ├── orders.py           # Cart checkout & inventory decrement
│   ├── vets.py             # Veterinary doctor directory & filtering
│   └── scan.py             # Crop Doctor endpoint & sample loader
├── static/
│   ├── css/styles.css      # Custom cream/green info-card stylesheet
│   ├── js/                 # scan.js, cart.js, farmer.js, buyer.js, common.js
│   └── img/                # Local SVGs & sample illustrations
├── templates/
│   ├── index.html          # Dual-entry landing page
│   ├── login.html          # Login portal
│   ├── register.html       # Role-based registration
│   ├── farmer/             # Dashboard, inputs, doctor, sell, vets, cart, orders
│   └── buyer/              # Home, produce browse, product detail, cart, orders
├── docs/                   # Full documentation, pitch outline, and demo script
└── artifacts/              # Original hackathon specifications
```

---

## 🧪 Testing the API

Verify server health and OpenCV readiness:
```bash
curl http://127.0.0.1:5000/api/health
# Response: {"ok": true, "db": true, "cv_ready": true, "service": "KrishiSetu Web Server"}
```

Test sample leaf scanning:
```bash
curl http://127.0.0.1:5000/api/scan/sample/2
# Returns OpenCV analysis for Sample 2 (Spotted leaf) with annotated base64 contours
```
