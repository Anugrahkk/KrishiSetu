# KrishiSetu - 3-Minute Pitch Presentation

> **Hackathon**: TinkerHub Hackathon  
> **Domain**: Agriculture & Food  
> **Core Tech**: Computer Vision (OpenCV) + Web (Flask, JavaScript)  
> **Team**: Member 1 (Frontend & Pitch - Anugrah), Member 2 (Backend & OpenCV)

---

## Slide 1: Title & Hook (0:00 - 0:30)
- **Title**: KrishiSetu (കൃഷിസേതു) - The Direct Digital Bridge for Kerala Farmers
- **Tagline**: Better prices. Healthier crops. Direct to you.
- **The Hook**:
  > *"Every harvest season in Kerala, smallholder farmers lose up to 40% of their profits to middlemen, while paying double for fertilizers because they don't know nearby Krishibhavans sell subsidized inputs. When pest strikes, they travel miles to find an agricultural officer. Today, we bridge this gap with KrishiSetu."*

---

## Slide 2: The Four Core Problems & Our Solution (0:30 - 1:15)
| The Challenge in Kerala Agriculture | KrishiSetu Solution |
|-------------------------------------|----------------------|
| **Expensive Agri-Inputs**: Farmers overpay private shops for seeds & manure | **Subsidized Inputs Directory**: Compare seeds/fertilizers from Krishibhavan & Co-operatives |
| **Sudden Crop Disease**: Farmers misidentify leaf blight or mildew | **OpenCV Crop Doctor**: Instant, offline-capable leaf disease screening |
| **Middlemen exploitation**: Selling produce at distress prices | **Direct Buyer Marketplace**: Direct farm-to-table with Fair Price indicator |
| **Livestock Emergencies**: Struggle finding nearby veterinary care | **One-Tap Vet Directory**: Direct phone connectivity with local vets |

---

## Slide 3: Live Demonstration Flow (1:15 - 2:15)
1. **Landing Page**:
   - Clean, dual-role interface built for mobile accessibility (`🌾 I am a Farmer` vs `🛒 I am a Buyer`).
   - Hackathon Info Cards: Agriculture domain, Computer Vision tech, 6-Hour Prototype goal.
2. **Crop Doctor in Action**:
   - Upload leaf photo or choose a sample (Healthy, Spot Blight, Yellowing).
   - Fast OpenCV analysis showing annotated leaf contours, affected %, severity meter, and actionable agricultural advice.
   - Built with fail-safe retry guidance (never crashes on bad photos).
3. **Farmer Workflow**:
   - Browse subsidized vermicompost and seeds with filter by Krishibhavan / Society.
   - Sell produce with one-click listing.
   - Tap-to-call veterinary support.
4. **Buyer Workflow**:
   - Browse fresh local crops, see "FAIR PRICE" badge, add to cart, and checkout with pay-on-delivery.

---

## Slide 4: Tech Architecture & Reliability (2:15 - 2:40)
- **Frontend**: Responsive, mobile-first vanilla HTML/CSS/JS with Malayalam support option, soft-cream info-card UI system.
- **Backend & CV**: Lightweight Flask API, SQLite database, offline-first rule-based OpenCV color and spot heuristic (no GPU/cloud dependency, runs anywhere).
- **Zero-fail Design**: Startup self-tests, graceful retry screens, and local sample fallbacks.

---

## Slide 5: Future Roadmap & Vision (2:40 - 3:00)
- **AI Upgrade**: Train lightweight MobileNet / CNN on Kerala crop leaf datasets (PlantVillage).
- **Voice & Vernacular**: Speech-to-text in Malayalam for voice-guided disease queries.
- **Govt Integration**: Direct sync with Kerala Karshika information system & automated SMS alerts.
- **Closing**: *"KrishiSetu puts power back into the farmer's hands—making agriculture profitable, sustainable, and connected."*

