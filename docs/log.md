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
