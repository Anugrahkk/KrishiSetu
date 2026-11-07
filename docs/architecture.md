# Architecture: KrishiSetu

## 1. Principle
Keep it small enough to finish in 6 hours: **one Python (Flask) server that also serves the website**. No separate frontend build, no Node, no cloud database.

## 2. Tech stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | HTML + CSS + vanilla JavaScript | No build tools; beginner friendly |
| Backend | Python 3 + **Flask** | Tiny, easy to learn |
| Computer vision | **OpenCV** (`opencv-python-headless`) + NumPy | Core hackathon domain |
| Database | **SQLite** (single file `krishisetu.db`) | Zero setup |
| Image handling | Pillow (optional) + OpenCV | Resize and validate |
| Auth | Flask sessions + hashed passwords (`werkzeug.security`) | Built in |
| Version control | Git + GitHub | Team collaboration |
| IDE / agent | Google Antigravity | As planned |

## 3. High-level diagram
```
 Browser (HTML/CSS/JS)
   |  fetch() JSON / multipart upload
   v
 Flask app (app.py)
   |-- routes/auth.py      -> users
   |-- routes/inputs.py    -> seeds, manure, fertilizer
   |-- routes/produce.py   -> farmer listings
   |-- routes/orders.py    -> cart checkout, order history
   |-- routes/vets.py      -> vet directory
   |-- routes/scan.py  --> cv/disease_detector.py (OpenCV)
   v
 SQLite (krishisetu.db)    uploads/ (user photos)   static/ (site files)
```

## 4. Folder structure
```
krishisetu/
├── app.py                  # Flask entry point, registers routes
├── config.py               # paths, secret key, limits
├── requirements.txt
├── db.py                   # connect, init schema, load seed data
├── schema.sql              # tables (see database.md)
├── seed.sql                # sample data
├── routes/
│   ├── auth.py  inputs.py  produce.py  orders.py  vets.py  scan.py
├── cv/
│   ├── disease_detector.py # the OpenCV pipeline
│   ├── advice.py           # condition -> advice text
│   └── samples/            # 3 bundled test leaf images
├── static/
│   ├── css/styles.css
│   ├── js/ (common.js, farmer.js, buyer.js, scan.js, cart.js)
│   └── img/
├── templates/ (or plain .html in static/)
│   ├── index.html          # landing: choose Farmer / Buyer
│   ├── login.html  register.html
│   ├── farmer/ dashboard.html  inputs.html  doctor.html  sell.html  vets.html  orders.html
│   └── buyer/  home.html  product.html  cart.html  orders.html
├── uploads/                # saved scan photos (git-ignored)
├── docs/                   # prd.md log.md architecture.md todo.md members.md design.md database.md api.md
└── README.md
```

## 5. Two separate sides
- Role is stored in `users.role` (`farmer` or `buyer`).
- A small decorator `@role_required("farmer")` protects farmer API routes and pages; buyers cannot open farmer pages and vice versa.
- Landing page sends users to `/farmer/...` or `/buyer/...` after login.

## 6. Core OpenCV pipeline (`cv/disease_detector.py`)
Function: `analyze_leaf(image_bytes) -> dict` (never raises).

1. **Validate**: `cv2.imdecode`; reject if it cannot decode, side < 100 px, or file > 5 MB.
2. **Resize**: longest side to 640 px.
3. **Quality check**: mean brightness (too dark < 40, too bright > 235) and blur via variance of Laplacian (< 30 means blurry). If poor, return `status: "retry"` with tips.
4. **Denoise**: Gaussian blur (5x5).
5. **Convert BGR -> HSV**.
6. **Colour masks** with `cv2.inRange` (starting values, tune with samples):
   - healthy green: H 35-85, S >= 40, V >= 40
   - yellowing: H 20-34, S >= 60, V >= 90
   - brown/necrotic spots: H 5-20, S >= 50, V 30-170 (plus dark-brown)
   - white/grey powdery: S <= 40, V >= 170 (only inside the leaf area)
7. **Leaf area** = green + yellow + brown pixels (+ white pixels enclosed by the leaf via morphological closing). Ignores plain background.
8. **Clean masks**: morphological open/close (3x3 kernel) to remove noise.
9. **Spot analysis**: `cv2.findContours` on the brown mask; count spots with area > 30 px; compute average spot size.
10. **Ratios** (each as % of leaf area): green, yellow, brown, white.
11. **Rule engine** (ordered):
    | Rule | Condition |
    |---|---|
    | Healthy | green >= 85% and brown+yellow+white < 8% |
    | Powdery mildew-like | white >= 12% |
    | Leaf spot / blight-like | brown >= 8% **or** spot count >= 5 |
    | Yellowing (nutrient deficiency / virus-like) | yellow >= 20% |
    | Mixed stress | two of the above present |
    | Unclear | none of the above or leaf area < 15% of image |
12. **Severity**: affected % = brown+yellow+white. Mild < 10, Moderate 10-30, Severe > 30.
13. **Confidence**: High / Medium / Low from how far the winning ratio is above its threshold and image quality. Always shown.
14. **Annotated image**: draw outlines of affected regions (`cv2.drawContours`), encode as base64 PNG.
15. **Return**:
```json
{
  "status": "ok | retry",
  "condition": "Leaf spot / blight-like",
  "confidence": "Medium",
  "severity": "Moderate",
  "affected_percent": 18.4,
  "spots_found": 9,
  "ratios": {"green": 71.2, "yellow": 6.1, "brown": 18.4, "white": 0.2},
  "advice": ["..."],
  "annotated_image": "data:image/png;base64,...",
  "disclaimer": "Preliminary screening, confirm with your Krishibhavan.",
  "message": "only when status is retry"
}
```

### Reliability design ("no fail")
- Whole function wrapped in `try/except`; any exception -> `status: "retry"`, message "We could not read this photo clearly. Take it in daylight, one leaf, plain background."
- Route `/api/scan` always returns JSON with HTTP 200 for analysis problems; only a truly missing file returns 400 with a friendly message.
- `selftest()` runs on the 3 sample images when the server starts and logs PASS/FAIL; `/api/health` reports `cv_ready: true/false`.
- Frontend: loading spinner, 20-second timeout with "Try again" button, and a "Try a sample image" button hitting `/api/scan/sample/<n>`.
- Pinned versions in `requirements.txt` so both laptops behave the same.

### Honest limitation
This is a colour and spot heuristic, not a trained model. It gives a **preliminary indication** for common patterns, and the UI says so. Upgrade path: train a CNN on PlantVillage.

## 7. Request flow examples
**Crop Doctor:** user picks photo -> `scan.js` resizes in browser (max 1024 px) -> `POST /api/scan` (multipart) -> `analyze_leaf()` -> result saved in `disease_scans` -> JSON -> result card with annotated image and advice.

**Place order:** cart kept in `localStorage` -> `POST /api/orders` with items -> server re-reads prices from DB (never trusts the browser) -> stores order -> returns order id.

## 8. Security basics
- Hash passwords; never store plain text.
- Validate and limit uploads; rename files with random names.
- Re-check price and stock on the server.
- Escape all user text when rendering (use `textContent`, not `innerHTML`).
- `uploads/`, `.env`, `*.db` in `.gitignore`.

## 9. Setup commands (beginners)
```
python -m venv venv
venv\Scripts\activate        # Windows   (Mac/Linux: source venv/bin/activate)
pip install flask opencv-python-headless numpy pillow
pip freeze > requirements.txt
python db.py                 # creates tables and loads sample data
python app.py                # open http://127.0.0.1:5000
```

## 10. Deployment
Demo locally on a laptop. Optional: deploy to Render or PythonAnywhere if time remains. Local demo is the safe default.
