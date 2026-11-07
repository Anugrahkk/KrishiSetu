# API: KrishiSetu

Base URL (local): `http://127.0.0.1:5000`
All endpoints return JSON. Logged-in state uses a session cookie.

**Standard error shape**
```json
{ "ok": false, "error": "Friendly message here" }
```
**Success shape:** `{ "ok": true, ... }`

Roles: 🌾 farmer only, 🛒 buyer only, 🔓 public, 🔒 any logged-in user.

## 1. Health
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/health` | 🔓 | `{ "ok": true, "db": true, "cv_ready": true }` (cv_ready comes from the OpenCV self-test) |

## 2. Auth
| Method | Path | Access | Body / Notes |
|---|---|---|---|
| POST | `/api/auth/register` | 🔓 | `{name, phone, password, role, district, village}` |
| POST | `/api/auth/login` | 🔓 | `{phone, password}` -> `{ok, user:{id,name,role}}` |
| POST | `/api/auth/logout` | 🔒 | clears session |
| GET | `/api/auth/me` | 🔒 | current user |

## 3. Inputs (seeds, manure, fertilizer) 🌾
| Method | Path | Query / Body |
|---|---|---|
| GET | `/api/inputs` | `category=seed|manure|fertilizer`, `seller_type=krishibhavan|society|private`, `district=`, `q=`, `sort=price_asc|price_desc` |
| GET | `/api/inputs/<id>` | details with seller info |
| GET | `/api/sellers` | list with `seller_type`, `district` filters |

Example item:
```json
{ "id": 3, "name": "Vermicompost", "category": "manure", "price": 18, "unit": "kg",
  "stock": 120, "seller": {"id": 2, "name": "Sample Krishibhavan", "seller_type": "krishibhavan", "district": "Ernakulam"} }
```

## 4. Crop Doctor (OpenCV) 🌾
### `POST /api/scan`
- Content-Type: `multipart/form-data`, field **`image`** (JPG/PNG, up to 5 MB).
- **Always responds HTTP 200 with JSON for analysis outcomes.**

Success:
```json
{
  "ok": true, "status": "ok",
  "condition": "Leaf spot / blight-like", "condition_code": "leaf_spot",
  "confidence": "Medium", "severity": "Moderate",
  "affected_percent": 18.4, "spots_found": 9,
  "ratios": {"green": 71.2, "yellow": 6.1, "brown": 18.4, "white": 0.2},
  "advice": ["Remove affected leaves", "Avoid watering the leaves", "Show a sample to your Krishibhavan"],
  "annotated_image": "data:image/png;base64,....",
  "disclaimer": "Preliminary screening. Confirm with your Krishibhavan.",
  "scan_id": 14
}
```
Needs retake (not an error page):
```json
{ "ok": true, "status": "retry",
  "message": "The photo is too dark. Take it in daylight, one leaf, plain background." }
```
Only a missing file returns HTTP 400: `{ "ok": false, "error": "Please choose a photo first." }`

### `GET /api/scan/sample/<n>` (n = 1, 2, 3)
Runs the pipeline on a bundled sample image; same response as `/api/scan`. Used by the "Try a sample image" buttons and by the demo fallback.

### `GET /api/scans/mine`
Scan history for the logged-in farmer (condition, severity, date).

### `GET /api/diseases`
Lookup list of conditions and advice (used for the "Learn more" section).

## 5. Sell produce 🌾 (farmer listings)
| Method | Path | Body / Notes |
|---|---|---|
| POST | `/api/produce` | `multipart/form-data`: `category, name, price, unit, quantity, district, description, image(optional)` |
| GET | `/api/produce/mine` | farmer's own listings |
| PUT | `/api/produce/<id>` | update price, quantity, active flag (owner only) |
| DELETE | `/api/produce/<id>` | owner only (soft delete via `is_active=0`) |

## 6. Browse produce 🛒 (also readable by 🌾)
| Method | Path | Query |
|---|---|---|
| GET | `/api/produce` | `category=crop|vegetable|fruit|egg|milk|other`, `district=`, `q=`, `sort=price_asc|price_desc|newest` |
| GET | `/api/produce/<id>` | detail with farmer name, village, district |

Optional field `fair_price: true|false` (computed against a small reference price table in code).

## 7. Orders 🔒
| Method | Path | Body / Notes |
|---|---|---|
| POST | `/api/orders` | `{order_type:"input"|"produce", items:[{item_id, quantity}], contact_name, contact_phone, address}`. Farmers can place `input` orders; buyers can place `produce` orders. The server recomputes totals from DB prices and checks stock. |
| GET | `/api/orders/mine` | order history with items |
| GET | `/api/orders/<id>` | one order (owner only) |
| PATCH | `/api/orders/<id>/cancel` | owner, only if status is `placed` |

Order response: `{ "ok": true, "order_id": 7, "total": 245.0, "status": "placed" }`

## 8. Vets 🌾
| Method | Path | Query |
|---|---|---|
| GET | `/api/vets` | `specialty=poultry|dairy|goat|general`, `district=`, `q=` |
| GET | `/api/vets/<id>` | full details (phone, clinic, timings) |

## 9. Page routes (served by Flask)
| URL | Page |
|---|---|
| `/` | Landing (choose Farmer / Buyer) |
| `/login`, `/register` | Auth |
| `/farmer`, `/farmer/inputs`, `/farmer/doctor`, `/farmer/sell`, `/farmer/vets`, `/farmer/orders` | Farmer side |
| `/buyer`, `/buyer/produce`, `/buyer/product/<id>`, `/buyer/cart`, `/buyer/orders` | Buyer side |

## 10. Status codes used
`200` success or retry, `201` created, `400` bad input, `401` not logged in, `403` wrong role, `404` not found, `409` out of stock, `500` should never be shown (global handler returns a friendly JSON/message).

## 11. Frontend call example
```js
async function scanLeaf(file) {
  const form = new FormData();
  form.append("image", file);
  try {
    const res = await fetch("/api/scan", { method: "POST", body: form });
    const data = await res.json();
    if (data.status === "ok") showResult(data);
    else showRetry(data.message || "Please try another photo.");
  } catch (e) {
    showRetry("Connection problem. Please try again or use a sample image.");
  }
}
```
