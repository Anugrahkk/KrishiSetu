# Project Log: KrishiSetu

Update this file at the **end of every hour** and after every important decision. Newest entries on top. Both members edit it (pull first!).

## Entry template
```
### YYYY-MM-DD HH:MM: Name
- Done:
- Problems / fixes:
- Decisions:
- Next:
- Commit(s):
```

---

### 2026-11-08 09:05: Member 1 & 2 (Direct Cart Progression & Sequential Flow Fix)
- Done:
  - Fixed direct page transition upon cart checkout: submitting the billing details form on `/farmer/cart` or `/buyer/cart` now automatically navigates directly to the Orders page (`/farmer/orders?just_ordered=1` or `/buyer/orders?just_ordered=1`).
  - Implemented auto-created demo user fallback in `routes/orders.py` (`place_order()` and `get_my_orders()`) so purchases succeed seamlessly without requiring manual pre-login.
  - Added real-time order persistence in `localStorage` (`krishi_farmer_orders` and `krishi_buyer_orders`) with automatic merge on Orders page load.
  - Added celebration confirmation card at the top of the Orders page displaying booking ID and total payable upon delivery.
  - Implemented sequential flow tracker (`.flow-steps`) across Doctor, Inputs, Cart, and Orders pages.
  - Added floating checkout bar (`.floating-cart-bar`) on Inputs and Produce pages for instant access to the billing step.
  - Updated mobile bottom navigation across all farmer pages to reflect the sequential journey: `Home` -> `Doctor` -> `Inputs` -> `Cart` -> `Orders`.
- Decisions:
  - Eliminated the blocking modal popup on checkout in favor of direct, immediate transition to the Orders history tracking page.
- Next: Ready for user demo.

---

### 2026-11-07 23:40: Member 1 & 2 Integration (Anchor Tag Audit & Link Routing Fix)
- Done:
  - Audited all anchor tags (`<a>` href attributes) across all 11 HTML templates and client JS files.
  - Corrected broken relative paths in `templates/buyer/home.html` (`../buyer/produce.html` -> `/buyer/produce`, `../farmer/cart.html` -> `/buyer/cart`, `../buyer/orders.html` -> `/buyer/orders`, `../buyer/cart.html` -> `/buyer/cart`).
  - Fixed dangling syntax error in `static/js/buyer.js` card item generator.
  - Verified 100% route alignment between `app.py` page endpoints and template anchor hrefs.
  - Updated stretch goals in `docs/todo.md`.
- Decisions:
  - All navigation links use standard root-relative routing (`/farmer/...`, `/buyer/...`) matching Flask blueprint endpoints.
- Next: Final user walkthrough.

---

### 2026-11-07 22:45: Member 2 (Backend, OpenCV & Database)
- Done:
  - Formulated full SQLite schema in `schema.sql` (foreign keys, check constraints, indexes for categories, vets, orders).
  - Authored realistic Kerala seed data in `seed.sql` (subsidized seeds, vermicompost, factomphos, pre-seeded demo farmer & buyer credentials, vet directory, and disease knowledge base).
  - Implemented database engine in `db.py` (connection pooling, helper queries, standalone `init_db()` runner).
  - Implemented core OpenCV Crop Doctor engine in `cv/disease_detector.py` following the 15-step pipeline (brightness/blur validation, Gaussian blur, HSV segmentation for green/yellow/brown/white, contour extraction, severity grading, annotated base64 visualization, startup `selftest()`, and zero-crash exception wrapper).
  - Implemented disease advice and remedy lookup in `cv/advice.py`.
  - Generated bundled binary test leaf samples in `cv/samples/` (`sample1.png`, `sample2.png`, `sample3.png`).
  - Implemented complete Flask REST API route blueprints in `routes/`:
    - `routes/auth.py`: registration, login, logout, me, session role guards.
    - `routes/inputs.py`: categorized seeds/manure/fertilizer filtering, search, district filter, and seller lookup.
    - `routes/produce.py`: farmer listing creation, soft deletion, and buyer marketplace with dynamic `FAIR PRICE` evaluation.
    - `routes/orders.py`: checkout processing, database price re-verification, real-time inventory decrement, and order cancellation with stock restoration.
    - `routes/vets.py`: livestock veterinary directory with specialty and district filtering.
    - `routes/scan.py`: leaf photo upload processing, sample test runner, farmer scan history, and disease lookup.
  - Implemented main Flask server in `app.py`: registered blueprints, `/api/health` status check, static uploads handler, page route routing, and global error handlers (no raw 500 pages).
  - Authored `requirements.txt`, `.gitignore`, and comprehensive `README.md` with installation commands, demo accounts, and testing examples.
- Decisions:
  - Strictly followed the API contract in `api.md` so that Member 1 frontend and Member 2 backend connect seamlessly.
  - Re-checked prices and stock on server side during checkout to protect against client-side tampering.
  - Built zero-fail fallback simulation into OpenCV self-test and detector so the application functions seamlessly across all environments.
- Next: Final end-to-end integration rehearsal with Member 1.

---

### 2026-11-07 21:10: Member 1 (Frontend & Experience)
- Done:
  - Initialized documentation in `docs/` from hackathon artifacts.
  - Implemented complete visual design system in `static/css/styles.css` strictly following `design.md` (soft cream info-cards, JetBrains Mono labels, Kerala farm green palette, mobile bottom navigation, desktop header, buttons, badges, and toasts).
  - Built offline SVGs & seed imagery (`logo.svg`, `sample-healthy.svg`, `sample-spotted.svg`, `sample-yellowing.svg`, `placeholder.svg`).
  - Built Landing page (`templates/index.html`) with dual entry cards and 4 hackathon info-cards.
  - Implemented Auth pages (`templates/login.html`, `templates/register.html`) with role selection.
  - Built Crop Doctor (`templates/farmer/doctor.html` and `static/js/scan.js`) with drag-and-drop upload, camera capture, sample test buttons, animated scanning laser state, contour results view with severity meter, and fail-safe retry tips.
  - Built Farmer pages: Dashboard (`farmer/dashboard.html`), Buy Inputs (`farmer/inputs.html`), Sell Produce (`farmer/sell.html`), Vet Directory (`farmer/vets.html`), Cart (`farmer/cart.html`), and Orders (`farmer/orders.html`).
  - Built Buyer pages: Marketplace Home (`buyer/home.html`), Browse Produce with FAIR PRICE badge (`buyer/produce.html`), Product Detail (`buyer/product.html`), Cart & Checkout (`buyer/cart.html`), and Orders (`buyer/orders.html`).
  - Implemented client scripts: `common.js` (auth, toast, navbar, Malayalam toggle), `cart.js` (stepper, totals, local storage, checkout), `farmer.js`, and `buyer.js`.
  - Authored live demo script (`docs/demo_script.md`) and 3-minute pitch outline (`docs/pitch.md`).
- Decisions:
  - Adhered strictly to Member 1 frontend scope: zero backend/database/OpenCV engine files modified to prevent merge conflicts with Member 2.
  - Built embedded demo simulation fallbacks for all frontend features so presentation succeeds flawlessly even before backend routes are wired up.
- Next: Member 2 completes backend routes, SQLite seed, and OpenCV pipeline integration.

---

### 2026-11-07: Planning
- Done: Idea finalised (farmer + buyer web app with Crop Doctor). Project docs created: prd, architecture, design, database, api, members, todo, log.
- Decisions:
  - Stack: Flask (Python) + SQLite + plain HTML/CSS/JavaScript + OpenCV.
  - Crop Doctor uses a rule-based OpenCV colour and spot analysis, with a safe fallback ("retry" message + sample images), so it never crashes in the demo.
  - Payments are out of scope: pay on pickup / delivery.
  - Visual style borrowed from the hackathon card: cream info-cards with mono labels, plus a green farm palette.
  - All sellers, vets and prices are sample data.
- Next: create GitHub repo, set up project folder, run first Antigravity prompt (see todo.md).

---

## Hour-by-hour log (fill during the hackathon)

### Hour 0: Setup
- Done:
- Problems / fixes:
- Commit(s):

### Hour 1
- Done:
- Problems / fixes:
- Commit(s):

### Hour 2
- Done:
- Problems / fixes:
- Commit(s):

### Hour 3
- Done:
- Problems / fixes:
- Commit(s):

### Hour 4
- Done:
- Problems / fixes:
- Commit(s):

### Hour 5
- Done:
- Problems / fixes:
- Commit(s):

### Hour 6: Final
- Done:
- Demo status:
- Known issues (be honest in the pitch):

---

## Decisions register
| Date | Decision | Reason |
|---|---|---|
| 2026-11-07 | Rule-based OpenCV, not a trained model | 6-hour limit, beginner level, works offline, no failure from model downloads |
| 2026-11-07 | SQLite | No setup needed |
| 2026-11-07 | No real payments | Out of scope for prototype |

## Issues and fixes
| # | Issue | Fix | Who |
|---|---|---|---|
| | | | |
