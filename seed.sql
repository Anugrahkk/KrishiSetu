-- Seed Data for KrishiSetu (Kerala Agricultural Network)
-- All prices, sellers, and contacts are realistic sample data for prototype demonstration.

-- 1. Demo Users (Passwords hashed for 'farmer123' and 'buyer123' via werkzeug scrypt)
-- Hash for 'farmer123': scrypt:32768:8:1$vC8bS4xYd6Qp$5c192d27806fca67b366be9bb3cb6e174a7424ad5fef60731faec9e01dfdb6d66e74b786fa0d14b09bb86996696b998cfb64703ef35035f83ceab55a6d36e788
-- Hash for 'buyer123': scrypt:32768:8:1$7tJ2q8f1H6kP$25777085c8f85f5e9ceeeec5507be18d3637e1a3bc327bc641687c2bf773347b30a57497ec06912328baecad3d6a4c28f64987f2ff5339f4d7f57a3e74ffc20d

INSERT OR IGNORE INTO users (id, name, phone, password_hash, role, district, village) VALUES
(1, 'Rajan Pillai', '9876543210', 'scrypt:32768:8:1$vC8bS4xYd6Qp$5c192d27806fca67b366be9bb3cb6e174a7424ad5fef60731faec9e01dfdb6d66e74b786fa0d14b09bb86996696b998cfb64703ef35035f83ceab55a6d36e788', 'farmer', 'Ernakulam', 'Aluva'),
(2, 'Suresh Kumar', '9876543211', 'scrypt:32768:8:1$7tJ2q8f1H6kP$25777085c8f85f5e9ceeeec5507be18d3637e1a3bc327bc641687c2bf773347b30a57497ec06912328baecad3d6a4c28f64987f2ff5339f4d7f57a3e74ffc20d', 'buyer', 'Ernakulam', 'Kakkanad'),
(3, 'Mariamma Joseph', '9876543212', 'scrypt:32768:8:1$vC8bS4xYd6Qp$5c192d27806fca67b366be9bb3cb6e174a7424ad5fef60731faec9e01dfdb6d66e74b786fa0d14b09bb86996696b998cfb64703ef35035f83ceab55a6d36e788', 'farmer', 'Thrissur', 'Ollur'),
(4, 'Biju Varghese', '9876543213', 'scrypt:32768:8:1$vC8bS4xYd6Qp$5c192d27806fca67b366be9bb3cb6e174a7424ad5fef60731faec9e01dfdb6d66e74b786fa0d14b09bb86996696b998cfb64703ef35035f83ceab55a6d36e788', 'farmer', 'Idukki', 'Thodupuzha');

-- 2. Sellers (Krishibhavans, Co-operative Societies, Private Dealers)
INSERT OR IGNORE INTO sellers (id, name, seller_type, district, address, phone) VALUES
(1, 'Krishibhavan Aluva (Govt)', 'krishibhavan', 'Ernakulam', 'Civil Station Road, Aluva', '+914842624101'),
(2, 'Krishibhavan Nedumbassery (Govt)', 'krishibhavan', 'Ernakulam', 'Nedumbassery Junction', '+914842610230'),
(3, 'Karshika Sahakarana Sangham Ollur', 'society', 'Thrissur', 'Main Road, Ollur, Thrissur', '+914872351240'),
(4, 'Kisan Agro Co-operative Society', 'society', 'Kottayam', 'TB Road, Kottayam', '+914812567890'),
(5, 'Krishibhavan Palakkad Central', 'krishibhavan', 'Palakkad', 'Fort Maidan, Palakkad', '+914912534567'),
(6, 'Green Kerala Agro Chemicals & Seeds', 'private', 'Idukki', 'Gandhi Square, Thodupuzha', '+914862223344');

-- 3. Subsidized Agri-Inputs
INSERT OR IGNORE INTO inputs (id, seller_id, category, name, description, price, unit, stock, image) VALUES
(1, 1, 'manure', 'Enriched Vermicompost (ശുദ്ധമായ മണ്ണിരവളം)', 'Pure organic compost enriched with beneficial microbes for vegetable beds and fruit trees.', 18.00, 'kg', 350, '/static/img/placeholder.svg'),
(2, 2, 'seed', 'High-Yield Cowpea Seeds (അനശ്വര പയർ വിത്ത്)', 'Kerala Agricultural University certified drought-tolerant bush cowpea seeds.', 45.00, 'packet', 90, '/static/img/placeholder.svg'),
(3, 3, 'manure', 'De-oiled Neem Cake Powder (വേപ്പിൻപിണ്ണാക്ക്)', 'Natural organic bio-fungicide and soil pest repellent, ideal for banana & pepper.', 35.00, 'kg', 160, '/static/img/placeholder.svg'),
(4, 4, 'fertilizer', 'Factomphos (20:20:0:13)', 'Ammonium phosphate sulphate complex fertilizer for root vigour and lush foliage.', 28.00, 'kg', 450, '/static/img/placeholder.svg'),
(5, 5, 'seed', 'Paddy Seeds (ഉമ / Uma MO-16 Certified)', 'High-tillering, blast-resistant certified paddy seed popular across Kerala wetlands.', 40.00, 'kg', 600, '/static/img/placeholder.svg'),
(6, 6, 'fertilizer', 'Muriate of Potash (MOP 60% K2O)', 'Standard potash fertilizer essential for banana bunch filling and tuber bulking.', 32.00, 'kg', 200, '/static/img/placeholder.svg'),
(7, 1, 'seed', 'Okra / Ladyfinger Seeds (കിരൺ വെണ്ട)', 'YVMV virus-tolerant hybrid okra seed with dark green tender pods.', 30.00, 'packet', 120, '/static/img/placeholder.svg'),
(8, 2, 'manure', 'Sterilized Bone Meal Powder (എല്ലുപൊടി)', 'Rich natural organic phosphorus and calcium source for perennial crops.', 42.00, 'kg', 180, '/static/img/placeholder.svg'),
(9, 3, 'fertilizer', 'Urea Fertilizer (N 46%)', 'Govt subsidized nitrogenous fertilizer for rapid vegetative growth.', 12.00, 'kg', 800, '/static/img/placeholder.svg'),
(10, 4, 'manure', 'Poultry Compost Manure', 'Dry cured organic poultry manure with high nitrogen and potassium.', 22.00, 'kg', 240, '/static/img/placeholder.svg'),
(11, 5, 'seed', 'Hybrid Chilli Seeds (ജ്വാലാമുഖി)', 'High pungency, bacterial wilt-resistant hot chilli seeds.', 50.00, 'packet', 75, '/static/img/placeholder.svg'),
(12, 6, 'fertilizer', 'Pseudomonas Fluorescens Bio-control', 'Bio-fungicide culture against fungal wilt, damping off and foot rot.', 65.00, 'kg', 90, '/static/img/placeholder.svg');

-- 4. Farmer Produce Listings
INSERT OR IGNORE INTO produce (id, farmer_id, category, name, price, unit, quantity, district, description, image, is_active) VALUES
(1, 1, 'fruit', 'Organic Nendran Bananas (ഏത്തപ്പഴം)', 52.00, 'kg', 120, 'Ernakulam', 'Naturally ripened, no calcium carbide or chemical dip. Sweet and firm.', '/static/img/placeholder.svg', 1),
(2, 3, 'egg', 'Fresh Free-Range Country Hen Eggs (നാടൻ കോഴിമുട്ട)', 8.00, 'piece', 150, 'Thrissur', 'Free-range backyard country eggs gathered daily. High protein content.', '/static/img/placeholder.svg', 1),
(3, 1, 'milk', 'Pure Morning Cow Milk (പശുവിൻ പാൽ)', 54.00, 'litre', 35, 'Ernakulam', 'Raw unadulterated cow milk fresh from morning milking at Aluva farm.', '/static/img/placeholder.svg', 1),
(4, 4, 'vegetable', 'Green Chillies (നാടൻ പച്ചമുളക്)', 45.00, 'kg', 40, 'Idukki', 'Fresh handpicked spicy green chillies grown without synthetic pesticides.', '/static/img/placeholder.svg', 1),
(5, 1, 'crop', 'Freshly Dug Tapioca / Cassava (കപ്പ)', 25.00, 'kg', 200, 'Ernakulam', 'Soft buttery cooking cassava dug on the day of delivery.', '/static/img/placeholder.svg', 1),
(6, 4, 'other', 'Grade 1 Malabar Black Pepper (കുരുമുളക്)', 550.00, 'kg', 30, 'Idukki', 'Sun-dried high-piperine Tellicherry bold black pepper garbled.', '/static/img/placeholder.svg', 1),
(7, 3, 'vegetable', 'Bitter Gourd / Pavakka (പാവയ്ക്ക)', 42.00, 'kg', 50, 'Thrissur', 'Crisp dark green organic bitter gourds rich in nutrients.', '/static/img/placeholder.svg', 1),
(8, 4, 'fruit', 'Farm Fresh Robusta Bananas (റോബസ്റ്റ പഴം)', 38.00, 'kg', 90, 'Idukki', 'Sweet highland robusta bananas naturally matured on the tree.', '/static/img/placeholder.svg', 1);

-- 5. Veterinary Doctors Directory
INSERT OR IGNORE INTO vets (id, name, clinic, specialty, phone, district, address, timings, notes) VALUES
(1, 'Dr. K. R. Suresh Kumar', 'Govt Veterinary Hospital Aluva', 'dairy', '+919400000001', 'Ernakulam', 'Near Mini Civil Station, Aluva', '9:00 AM - 3:00 PM', 'Expertise in crossbred dairy cattle, artificial insemination, and mastitis management.'),
(2, 'Dr. Deepa Nair', 'Poultry Disease Diagnostic Lab', 'poultry', '+919400000002', 'Ernakulam', 'Vyttila Hub Road, Kochi', '8:30 AM - 2:00 PM', 'Specialized in broiler and layer flock vaccination, biosecurity, and feed analysis.'),
(3, 'Dr. Thomas Mathew', 'Kottayam District Veterinary Centre', 'general', '+919400000003', 'Kottayam', 'Nagampadam, Kottayam', '9:00 AM - 4:00 PM', 'Complete livestock surgery, ultrasound diagnostics, and routine consultations.'),
(4, 'Dr. Fathima Beevi', 'Veterinary Dispensary Munnar', 'goat', '+919400000004', 'Idukki', 'Devikulam Road, Munnar', '9:30 AM - 1:30 PM', 'Specialized in Malabari and Boer goat breeds, parasite control, and nutrition.'),
(5, 'Dr. Rajesh V.', 'Thrissur Veterinary Polyclinic', 'dairy', '+919400000005', 'Thrissur', 'Round East, Thrissur', '24-Hour Emergency Service', 'Round-the-clock emergency calving, metabolic disorders, and trauma care.'),
(6, 'Dr. Ananya Menon', 'Palakkad Rural Veterinary Dispensary', 'general', '+919400000006', 'Palakkad', 'Ottapalam Road, Palakkad', '9:00 AM - 2:30 PM', 'Routine vaccinations, livestock deworming, and preventive farm checks.'),
(7, 'Dr. Manoj Prabhakar', 'Kerala State Poultry Farm Consultancy', 'poultry', '+919400000007', 'Thrissur', 'Mannuthy, Thrissur', '10:00 AM - 3:00 PM', 'Quail, duck, and country fowl breeding and disease prevention specialist.'),
(8, 'Dr. George Cherian', 'Highland Livestock Hospital', 'dairy', '+919400000008', 'Idukki', 'Kattappana, Idukki', '9:00 AM - 3:30 PM', 'High altitude dairy farming management, bloat, and mineral deficiency treatment.');

-- 6. Crop Diseases Lookup & Advice
INSERT OR IGNORE INTO diseases (id, code, title, description, advice) VALUES
(1, 'healthy', 'Healthy Crop Foliage', 'Leaf demonstrates normal chlorophyll pigmentation without necrotic spots or chlorosis.', 'Continue regular root-zone watering schedule.\nMaintain organic compost application every 3-4 weeks.\nInspect underside of leaves weekly for early pest colonization.'),
(2, 'leaf_spot', 'Leaf Spot / Blight-like Condition', 'Brown or dark necrotic spots caused by fungal or bacterial pathogens.', 'Prune and safely discard heavily spotted foliage to prevent spore spread.\nAvoid overhead sprinkler watering; keep foliage dry.\nApply bio-control spray (Pseudomonas Fluorescens @ 20g/litre) or consult Krishibhavan for certified organic copper fungicide.'),
(3, 'powdery', 'Powdery Mildew-like Stress', 'Superficial whitish or grey powdery patches on the leaf surface.', 'Improve plant spacing and airflow around the crop.\nAvoid excessive nitrogen fertilizers which foster tender susceptible foliage.\nSpray neem oil emulsion (5 ml/litre with mild soap) or diluted sour buttermilk on cool evenings.'),
(4, 'yellowing', 'Yellowing / Chlorosis / Nutrient Stress', 'Pale yellow foliage indicating nitrogen deficiency, root waterlogging, or early viral stress.', 'Examine root zone for poor drainage or water stagnation.\nApply balanced enriched vermicompost and micronutrient foliar spray.\nIf yellowing is accompanied by leaf curling or mosaic pattern, isolate the plant and notify the Krishibhavan.'),
(5, 'mixed', 'Mixed Stress / Multi-symptom Condition', 'Multiple stress factors detected including localized spotting and chlorosis.', 'Inspect for sap-sucking pests (aphids or mites) on the lower leaf surface.\nImprove soil aeration with organic compost.\nTake a sample leaf in a sealed bag to your nearest Krishibhavan for lab examination.'),
(6, 'unclear', 'Unclear / Indeterminate Foliage View', 'Unable to establish confident disease pattern due to lighting or perspective.', 'Retake photo in clear natural daylight.\nPlace a single leaf flat on a plain white paper or neutral background.\nHold camera steady 15–20 cm away to ensure sharp focus.');

