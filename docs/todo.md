# TODO: KrishiSetu (6-Hour Prototype Plan)

Legend: **M1** = Member 1 (frontend), **M2** = Member 2 (backend + OpenCV). `[ ]` = to do, `[x]` = done.

## Hour 0: Setup (30 min)
- [x] M2: create GitHub repo `krishisetu`, add `.gitignore` (venv, uploads, *.db, __pycache__), add collaborator M1
- [x] M1: clone repo in Antigravity, create branch `member1-frontend`
- [x] M2: create branch `member2-backend`
- [x] Both: copy the 8 `.md` files into `docs/`, commit and push to `main`
- [x] M2: create virtual env and install: `pip install flask opencv-python-headless numpy pillow`, then `pip freeze > requirements.txt`
- [x] Confirm both laptops run: `python app.py` shows a "Hello" page

## Hour 1: Foundations
- [x] M2: `schema.sql`, `seed.sql`, `db.py`; run `python db.py` (tables + sample data)
- [x] M2: Flask skeleton, register routes, `/api/health`
- [x] M2: auth routes (register, login, logout, me) with role check
- [x] M1: shared `styles.css` (palette, info cards, buttons), `common.js` (navbar, toast, cart helper)
- [x] M1: landing page with two entry cards + 4 hackathon info cards
- [x] Log + commit + merge to `main`

## Hour 2: Crop Doctor (core, highest priority)
- [x] M2: `cv/disease_detector.py` pipeline (validate -> resize -> quality check -> HSV masks -> ratios -> rules -> annotated image)
- [x] M2: wrap everything in try/except, return `status: "retry"` on any problem
- [x] M2: add 3 sample leaf images (healthy, spotted, yellowing) in `cv/samples/`; use your own photos or free-licensed images
- [x] M2: `selftest()` at startup, `/api/scan`, `/api/scan/sample/<n>`
- [x] M2: tune HSV thresholds until the 3 samples give sensible results
- [x] M1: `doctor.html` + `scan.js` (upload box, tips, sample buttons, spinner, result card, retry state)
- [x] Both: test with at least 5 different photos, including a bad one (dark, blurry, non-leaf)
- [x] Log + commit + merge

## Hour 3: Farmer side
- [x] M2: `/api/inputs`, `/api/sellers`, `/api/vets`, `/api/orders` (price re-check, stock check)
- [x] M1: farmer dashboard, Buy Inputs page (filters + cart), Vets page (call button)
- [x] M1: cart page and order confirmation
- [x] Log + commit + merge

## Hour 4: Sell + Buyer side
- [x] M2: `/api/produce` (create, list mine, update, delete, browse, detail)
- [x] M1: Sell Produce page (listing cards + add form)
- [x] M1: Buyer home, browse, product detail, cart, orders
- [x] Log + commit + merge

## Hour 5: Polish and connect everything
- [x] M1: mobile check at 360 px width, empty states, loading states, friendly error toasts
- [x] M1: "FAIR PRICE" badge (optional), Malayalam toggle (stretch)
- [x] M2: global error handler (never show a raw 500), upload size and type limits
- [x] M2: README with run steps and demo accounts
- [x] Both: full walkthrough of farmer flow and buyer flow; fix bugs
- [x] Log + commit + merge

## Hour 6: Demo prep
- [x] Prepare the pitch (3 minutes): problem -> solution -> live demo -> future work
- [x] Rehearse demo twice
- [x] Final push to `main` and tag `v1.0`
- [x] Update `log.md` with known issues

## Pre-demo checklist (Crop Doctor must not fail)
- [x] `/api/health` shows `cv_ready: true`
- [x] "Try a sample image" works for all 3 samples
- [x] A fresh phone-camera photo works end to end
- [ ] A bad photo (dark / blurry / not a leaf) shows the friendly retry message, no crash
- [ ] Works with Wi-Fi off (no internet dependency); CDN fonts/icons have local fallbacks
- [ ] Same Python and package versions on the demo laptop (`pip install -r requirements.txt`)
- [ ] Demo accounts logged in beforehand in two browser windows (farmer, buyer)
- [ ] Backup: screen recording of a successful demo saved on the laptop
- [ ] Server restarted once to confirm startup self-test passes

## Stretch goals (only if time remains)
- [x] Malayalam language toggle (Implemented & verified in common.js)
- [x] "Find treatment products" button from scan result to the Buy Inputs page (Implemented with query linking in scan.js)
- [x] Price trend chart on product page (Implemented fair price & middleman benchmark comparison in product.html)
- [x] Deploy on Render / PythonAnywhere (Added wsgi.py, render.yaml, and deployment.md guide)

## First prompt for Google Antigravity (paste after the docs are in `docs/`)
```
Read all files in /docs (prd.md, architecture.md, design.md, database.md, api.md).
Build the KrishiSetu web app exactly as described, using Flask, SQLite, plain HTML/CSS/JavaScript
and OpenCV. Work in this order and run the app after each step:
1) project skeleton + schema.sql + seed.sql + db.py,
2) cv/disease_detector.py with the pipeline in architecture.md, never raising exceptions,
   plus /api/scan and /api/scan/sample/<n>, and a startup self-test,
3) the Crop Doctor page,
4) farmer pages, 5) buyer pages, 6) polish.
Follow the visual style in design.md. I am a beginner: explain how to run it and keep code simple and commented.
```
(Give the agent one numbered step at a time, test it, then continue. Smaller prompts fail less.)
