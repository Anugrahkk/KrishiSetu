# PRD: KrishiSetu (Product Requirements Document)

> Working name: **KrishiSetu** ("bridge for farmers"). Rename freely.
> Hackathon: Tinkerhub. Domain: Agriculture & Food. Team: 2 members.

## 1. Hackathon constraints (from the event card)
| Item | Value |
|---|---|
| Core tech domain | **Computer Vision** |
| Languages | **Python / JavaScript** |
| Difficulty | **Beginner friendly** |
| Goal | **6-hour prototype** |
| Build tool | Google Antigravity |
| Version control | GitHub (shared repo) |

Because of the 6-hour limit and beginner level, every decision below favours **simple, reliable and demo-able** over complete.

## 2. Problem
Small farmers in Kerala:
1. Pay high prices for seeds, manure and fertilizer, and do not know that nearby Krishibhavans and cooperative societies sell them cheaper.
2. Cannot quickly tell what is wrong with a sick crop.
3. Sell produce (vegetables, eggs, milk) through middlemen at low prices.
4. Struggle to find a veterinary doctor for poultry or dairy animals.

## 3. Goal
One web app with **two separate sides**: a **Farmer side** and a **Buyer side**. Farmers buy inputs cheaply, check crop disease from a photo, sell produce directly and find vets. Buyers purchase fresh produce at fair prices straight from farmers.

## 4. Users
- **Farmer** (small or marginal; may use a phone and prefer simple screens, Malayalam optional).
- **Buyer** (household, hotel, shop, or anyone buying fresh farm produce).
- (Out of scope for the prototype: admin panel; Krishibhavan and society sellers are pre-loaded as seed data.)

## 5. Features

### 5.1 Common
- Landing page with two big entry cards: "I am a Farmer" and "I am a Buyer".
- Register / login with role (farmer or buyer). Simple session login.
- English UI. Malayalam language toggle is a stretch goal.

### 5.2 Farmer side (MUST)
| ID | Feature | Priority |
|---|---|---|
| F1 | **Buy Inputs**: browse seeds, manure and fertilizer from nearby Krishibhavans and private/cooperative societies; filter by category, seller type, district; sort by price; add to cart; place order (pay at pickup/cash on delivery) | Must |
| F2 | **Crop Doctor**: upload a photo of a diseased crop leaf and get a result (condition, severity, advice, what to do next) using **OpenCV** | Must |
| F3 | **Sell Produce**: add, edit and remove own listings (crop, egg, milk, vegetable) with price, quantity, unit and photo | Must |
| F4 | **Vet Directory**: vets with phone number, specialty (poultry, dairy, goat, general), district, clinic, timings; filter and tap-to-call | Must |
| F5 | My Orders and My Scans history | Should |
| F6 | Scan result links to nearby Krishibhavan sellers for the suggested treatment | Could |

### 5.3 Buyer side (MUST)
| ID | Feature | Priority |
|---|---|---|
| B1 | **Browse Produce**: crops, vegetables, eggs, milk; filter by category and district; search; sort by price | Must |
| B2 | Product detail with farmer name, location, price, stock | Must |
| B3 | Cart and place order (pay on pickup/delivery; no real payments) | Must |
| B4 | My Orders | Should |
| B5 | "Fair price" badge when the listing price is within the reference range | Could |

### 5.4 Crop Doctor (core CV feature) requirements
- Input: JPG/PNG up to 5 MB, taken from a phone camera or gallery.
- Processing: OpenCV pipeline (see architecture.md).
- Output: **condition**, **confidence level (High/Medium/Low)**, **affected area %**, **annotated image** with the affected parts outlined, **advice**, **disclaimer**.
- **Must never crash or show a blank page.** Every failure path returns a friendly message with retake tips (see "Reliability" below).
- Result is labelled as *preliminary screening*, not a final diagnosis; the farmer is told to confirm with the Krishibhavan / agricultural officer for serious cases.

## 6. Reliability requirement: "OpenCV feature must not fail"
1. The CV code is **rule-based colour and spot analysis** (HSV segmentation, no model downloads, no internet, no GPU), so it works offline on any laptop.
2. All CV code is wrapped so that any error returns `status: "retry"` with a helpful message and HTTP 200, never a 500 page.
3. Input validation before processing (type, size, decodable, not too dark/blurry).
4. A `/api/health` endpoint and a **self-test** that runs the pipeline on bundled sample images at server start.
5. Three bundled **sample leaf images** with a "Try a sample" button, so the demo works even if the camera or upload fails.
6. A **pre-demo checklist** in todo.md.

## 7. Non-functional
- Mobile-first, responsive, large buttons and readable text.
- Pages load fast; images resized on upload.
- Beginner-maintainable code: one repo, plain HTML/CSS/JS + Flask.

## 8. Success criteria (for the demo)
- Both sides reachable from the landing page.
- A farmer can: browse inputs, add to cart, place an order, scan a leaf and get a result, list a product, find a vet.
- A buyer can: browse produce, add to cart, place an order.
- Crop Doctor works live on a sample image **and** on a freshly uploaded photo.
- Code lives on GitHub with commits from both members.

## 9. Out of scope (prototype)
Real payments, live GPS maps, admin dashboard, SMS/OTP login, trained deep-learning model, delivery tracking. (Listed as "future work" in the pitch.)

## 10. Future work (for the pitch)
Train a CNN on the PlantVillage dataset to replace or support the rule-based analysis, Malayalam voice help, real nearby search with GPS, payment gateway, Krishibhavan admin panel, price-trend alerts.

## 11. Data disclaimer
All sellers, vets, farmers and prices in the prototype are **sample/dummy data** and must be labelled as such in the demo.
