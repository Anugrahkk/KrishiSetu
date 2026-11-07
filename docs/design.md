# Design: KrishiSetu

## 1. Design goals
Very user friendly, attractive, well arranged. Built for farmers on phones: big tap targets, few words, clear icons, high contrast. Mobile-first, then scale up to desktop.

## 2. Style direction (taken from the hackathon event card)
The event card uses **soft cream rounded info-cards with a tiny uppercase label above a bold monospaced value**. We reuse that look across the site:

```
┌──────────────────────┐
│ DOMAIN               │   <- tiny uppercase mono label (grey)
│ Computer Vision      │   <- bold mono value (dark)
└──────────────────────┘
```
Use this "info card" for stats, categories and key facts (price, stock, distance, severity). Combine it with a **fresh green farm palette** so the app feels agricultural.

Landing hero shows four info cards: `DOMAIN Agriculture & Food`, `TECH Computer Vision`, `BUILT WITH Python / JavaScript`, `GOAL 6-Hour Prototype`. (Hackathon badges; hide later if desired.)

## 3. Colour palette
| Role | Hex |
|---|---|
| Background (cream) | `#F4F1E8` |
| Card surface | `#FBFAF5` |
| Card border | `#D9D5C7` |
| Primary green | `#2E7D32` |
| Dark green (headings, buttons hover) | `#1B5E20` |
| Soil brown (accent) | `#8D5B2E` |
| Sun yellow (highlight, badges) | `#F2B01E` |
| Alert red (disease, errors) | `#C62828` |
| Text dark | `#1D1D1B` |
| Text muted | `#6B6A63` |

Contrast: dark text on cream and white text on primary green both pass accessibility contrast.

## 4. Typography
- Labels and values on info cards: **JetBrains Mono** (fallback `ui-monospace, monospace`).
- Headings and body: **Poppins** or **Inter** (fallback `system-ui, sans-serif`).
- Base size 16-18 px; buttons 18 px; line height 1.5.

## 5. Components
- **Info card**: radius 14 px, 1 px border, soft shadow, padding 16 px.
- **Primary button**: green, white text, radius 12 px, min height 48 px, icon + text.
- **Secondary button**: outline green.
- **Product card**: photo, name, seller badge (Krishibhavan / Society / Private / Farmer), price big (₹ and unit), stock, "Add" button.
- **Badges**: `GOVT` (green), `CO-OP` (yellow), `PRIVATE` (grey), `FAIR PRICE` (green outline).
- **Bottom navigation (mobile)**: 5 icons with labels. **Top navigation (desktop)**.
- **Toasts** for "Added to cart", "Order placed", errors.
- **Skeleton loaders** and friendly empty states ("No products found, try another district").

## 6. Page layouts

### 6.1 Landing (`/`)
1. Top bar: logo + language toggle (EN | മലയാളം stretch).
2. Hero: headline "Better prices. Healthier crops. Direct to you." + two large cards: **🌾 I am a Farmer** and **🛒 I am a Buyer**.
3. Row of 4 hackathon info cards (see section 2).
4. "How it works" 3 steps.
5. Footer.

### 6.2 Farmer side
Bottom nav: **Home · Buy Inputs · Crop Doctor · Sell · Vets**

- **Dashboard**: greeting, 4 big tiles (Buy Inputs, Crop Doctor, Sell Produce, Find a Vet), small stats cards (orders, active listings, last scan), tips of the day.
- **Buy Inputs**: filter chips (Seeds · Manure · Fertilizer), seller type dropdown, district dropdown, sort by price; grid of product cards; cart icon with counter.
- **Crop Doctor** (hero feature, most polished page):
  1. Big dashed upload box with camera icon: "Tap to take or upload a photo of the affected leaf".
  2. Tips strip: daylight, one leaf, plain background, close up.
  3. "Try a sample image" row (3 thumbnails).
  4. Analyse button -> animated scanning state.
  5. **Result card**: annotated photo (affected parts outlined), condition name, severity meter (green/yellow/red bar), confidence badge, three info cards (AFFECTED %, SPOTS, SEVERITY), advice checklist, disclaimer, buttons "Find treatment products" and "Talk to an expert".
  6. Retry state: friendly message + retake tips, never an error page.
- **Sell Produce**: "My listings" cards with edit/delete, floating "+ Add product" button, form (category, name, price, unit, quantity, district, photo).
- **Vets**: filter chips (Poultry · Dairy · Goat · General), search by district; vet cards with name, clinic, specialty badges, timings, and a big **📞 Call** button (`tel:` link).
- **Orders**: list with status chips.

### 6.3 Buyer side
Top/bottom nav: **Home · Fresh Produce · Cart · Orders**
- **Home**: search bar, category tiles (Vegetables · Fruits · Eggs · Milk · Grains), "Fresh near you" product row, "Why buy direct" info cards.
- **Browse**: filters (category, district, price sort), product grid.
- **Product page**: large photo, price, farmer name and place, stock, quantity stepper, Add to cart, FAIR PRICE badge.
- **Cart and checkout**: item list, total, name/phone/address form, "Place order (pay on delivery)".
- **Orders**: list and status.

## 7. UX rules
- Max 2 taps from dashboard to any main task.
- Icon + text on every button (no icon-only).
- Prices always show unit (₹40 / kg, ₹6 / egg, ₹55 / litre).
- Always show loading and success feedback.
- Forms: large inputs, inline error text, correct mobile keyboard types (`type="tel"`, `inputmode="numeric"`).
- Works on a 360 px wide screen without horizontal scroll.
- Accessible: alt text on images, labels on inputs, focus outlines.

## 8. Imagery and icons
Use free emoji/SVG icons (🌱 🧪 🌾 🥚 🥛 🩺 📞) or Lucide icons via CDN. Product photos: use free placeholder or Unsplash-style images stored locally in `static/img/`.

## 9. Frontend build hint for Antigravity (Stitch or agent)
Generate the pages as plain HTML + CSS (CSS variables for the palette above) + vanilla JS `fetch()` calls to the endpoints in api.md. Keep one shared `styles.css` and `common.js` (navbar, toast, cart helpers).
