# KrishiSetu - Live Demo Script (Step-by-Step)

This demo script ensures a flawless 3-minute presentation without unexpected glitches or delays.

---

### Pre-Demo Verification Checklist (10 minutes before presentation)
- [ ] Laptop browser window 1: Open `http://127.0.0.1:5000/` (Landing)
- [ ] Laptop browser window 2: Logged in as Farmer (`phone: 9876543210`)
- [ ] Laptop browser window 3 (or private window): Logged in as Buyer (`phone: 9876543211`)
- [ ] Network: Verify offline functionality works (fonts, icons, styles render locally without external CDN delays)
- [ ] Audio/Mic: Ready for pitch

---

### Step 1: Landing Page & Hackathon Context (0:00 - 0:35)
1. **Screen**: Open Landing Page (`/`).
2. **Speaker (Anugrah - M1)**:
   > *"Good evening judges. Welcome to KrishiSetu. We designed KrishiSetu specifically for smallholder farmers and direct consumers in Kerala. As you can see, our UI features the clean cream and green info-card aesthetic, showing our hackathon focus: Agriculture & Food domain, powered by Computer Vision, built in a 6-hour sprint."*
3. **Action**: Click on the Malayalam / English toggle to demonstrate local language accessibility.
4. **Action**: Click on **"🌾 I am a Farmer"** to enter the Farmer Dashboard.

---

### Step 2: The Core Innovation - OpenCV Crop Doctor (0:35 - 1:25)
1. **Screen**: Click on **Crop Doctor** in bottom/top navigation.
2. **Speaker (M1)**:
   > *"Crop diagnosis is our marquee feature. When a farmer sees discolored leaves, they don't have to wait days for a field expert. Let's run Crop Doctor."*
3. **Action**: Click **"Try Sample 2 (Spotted Leaf)"** or upload a sample photo.
4. **Action**: Watch the scanner animation for 1-2 seconds.
5. **Show Results**:
   - Point out the **Annotated leaf image** with outlined spots.
   - Highlight the **Three Info Cards**: `AFFECTED: 18.4%`, `SPOTS FOUND: 9`, `SEVERITY: MODERATE`.
   - Point out the **Actionable Agricultural Advice**: "Remove infected leaves; avoid sprinkler irrigation."
   - Point out the **Disclaimer**: "Preliminary screening; consult local Krishibhavan."
6. **Speaker (M1)**:
   > *"Notice how the system outlines lesions with OpenCV contouring and computes exact spot density. And if a farmer accidentally uploads an unfocused or dark image, KrishiSetu never crashes—it gracefully shows helpful photography tips to retake."*

---

### Step 3: Farmer Workflow - Inputs & Vets (1:25 - 2:05)
1. **Action**: Click **"Buy Inputs"** in the navigation.
2. **Speaker (M1)**:
   > *"From diagnosis, the farmer can directly view subsidized inputs. Here they can filter between Krishibhavan, Co-operative societies, and private dealers. Krishibhavan vermicompost is available at just ₹18/kg."*
3. **Action**: Click **"Add to Cart"** on an item.
4. **Action**: Click **"Find a Vet"** in navigation.
5. **Speaker (M1)**:
   > *"For poultry or cattle diseases, the Vet Directory provides verified local doctors with a one-tap direct call button."*

---

### Step 4: Buyer Workflow - Fresh Produce Direct (2:05 - 2:40)
1. **Screen**: Switch to Buyer window (`/buyer/produce`).
2. **Speaker (M1)**:
   > *"On the buyer's side, consumers and restaurants purchase directly from farmers with zero middleman margin."*
3. **Action**: Show the **"FAIR PRICE"** green badge.
4. **Action**: Add fresh farm bananas or organic vegetables to cart.
5. **Action**: Go to Cart -> Enter name and address -> Click **"Place Order (Pay on Delivery)"**.
6. **Action**: Show instant Order Confirmation card with order ID.

---

### Step 5: Summary & Wrap-up (2:40 - 3:00)
1. **Speaker (M1)**:
   > *"KrishiSetu is lightweight, works completely offline, and connects the entire agricultural cycle—from soil to market. Thank you, and we'd love to take your questions!"*

