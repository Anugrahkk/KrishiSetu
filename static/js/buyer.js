/**
 * KrishiSetu - Buyer Experience Engine
 * Owned by Member 1 (Frontend & Experience)
 * Manages Produce Browsing, Fair Price Badging, and Consumer Orders
 */

let allProduce = [];

// ---------------------------------------------------------------------------
// 1. Load Produce Marketplace
// ---------------------------------------------------------------------------
async function loadBuyerProduce() {
  const grid = document.getElementById("produce-grid");
  const emptyView = document.getElementById("produce-empty-view");
  if (!grid) return;

  const category = document.querySelector(".produce-chip.active")?.getAttribute("data-category") || "";
  const district = document.getElementById("produce-district-filter")?.value || "";
  const sort = document.getElementById("produce-sort-filter")?.value || "";
  const query = document.getElementById("produce-search")?.value.trim().toLowerCase() || "";

  grid.innerHTML = `
    <div class="skeleton" style="height: 250px; border-radius: 14px;"></div>
    <div class="skeleton" style="height: 250px; border-radius: 14px;"></div>
    <div class="skeleton" style="height: 250px; border-radius: 14px;"></div>
  `;

  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (district) params.append("district", district);
    if (sort) params.append("sort", sort);
    if (query) params.append("q", query);

    const res = await fetch(`/api/produce?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      allProduce = data.produce || [];
    } else {
      allProduce = getSampleProduce();
    }
  } catch (_) {
    allProduce = getSampleProduce();
  }

  // Filter client-side if sample produce is used
  let filtered = allProduce.filter((item) => {
    if (category && item.category !== category) return false;
    if (district && item.district !== district) return false;
    if (query && !item.name.toLowerCase().includes(query) && !item.description?.toLowerCase().includes(query)) return false;
    return true;
  });

  if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (emptyView) emptyView.style.display = "block";
    return;
  }

  if (emptyView) emptyView.style.display = "none";

  grid.innerHTML = filtered.map((item) => {
    const imgUrl = item.image || "/static/img/placeholder.svg";
    const farmerName = item.farmer_name || (item.farmer ? item.farmer.name : "Saji Karshakan");
    const farmerPlace = item.village ? `${item.village}, ${item.district}` : (item.district || "Ernakulam");
    const isFairPrice = item.fair_price !== undefined ? item.fair_price : true;

    return `
      <div class="product-card">
        <a href="product.html?id=${item.id}" class="product-card-img-wrap" style="display: block;">
          <img src="${imgUrl}" alt="${item.name}" class="product-card-img" onerror="this.src='/static/img/placeholder.svg'">
          <div class="product-card-badges">
            <span class="badge badge-govt">${item.category.toUpperCase()}</span>
            ${isFairPrice ? '<span class="badge badge-fair-price">✓ FAIR PRICE</span>' : ''}
          </div>
        </a>
        <div class="product-card-body">
          <a href="product.html?id=${item.id}" style="color: inherit; text-decoration: none;">
            <h3 class="product-card-title">${item.name}</h3>
          </a>
          <p class="product-card-subtitle">🧑‍🌾 Direct from ${farmerName} (${farmerPlace})</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${item.description || "Fresh harvest harvested directly from Kerala farm."}</p>
          <div class="product-card-footer" style="flex-wrap: wrap; gap: 8px;">
            <div>
              <span class="price-tag">₹${parseFloat(item.price).toFixed(0)}</span>
              <span class="price-unit">/ ${item.unit}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <div class="stepper-box" style="height: 36px;">
                <button type="button" class="stepper-btn" style="width: 28px; height: 36px;" onclick="adjustBuyerCardQty('produce-qty-${item.id}', -1)">−</button>
                <input type="number" id="produce-qty-${item.id}" class="stepper-input" style="width: 36px; height: 36px;" value="1" min="1" max="999">
                <button type="button" class="stepper-btn" style="width: 28px; height: 36px;" onclick="adjustBuyerCardQty('produce-qty-${item.id}', 1)">+</button>
              </div>
              <button class="btn btn-primary btn-sm" onclick="addItemToCart({
                id: ${item.id},
                name: '${item.name.replace(/'/g, "\\'")}',
                price: ${item.price},
                unit: '${item.unit}',
                type: 'produce',
                sellerName: '${farmerName.replace(/'/g, "\\'")}',
                image: '${imgUrl}',
                quantity: parseInt(document.getElementById('produce-qty-${item.id}').value) || 1
              })">
                <span>🛒 Add</span>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="buyItemNow({
                id: ${item.id},
                name: '${item.name.replace(/'/g, "\\'")}',
                price: ${item.price},
                unit: '${item.unit}',
                type: 'produce',
                sellerName: '${farmerName.replace(/'/g, "\\'")}',
                image: '${imgUrl}',
                quantity: parseInt(document.getElementById('produce-qty-${item.id}').value) || 1
              })">
                <span>⚡ Buy Now →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getSampleProduce() {
  return [
    { id: 1, name: "Organic Nendran Bananas (നേന്ത്രപ്പഴം)", category: "fruit", price: 52, unit: "kg", quantity: 120, district: "Ernakulam", village: "Aluva", fair_price: true, farmer_name: "Rajan Pillai", image: "../../static/img/produce-banana.svg", description: "Naturally ripened traditional Kerala Nendran bananas directly from farm." },
    { id: 2, name: "Fresh Country Eggs (നാടൻ കോഴിമുട്ട)", category: "egg", price: 8, unit: "piece", quantity: 200, district: "Thrissur", village: "Ollur", fair_price: true, farmer_name: "Mariamma Joseph", image: "../../static/img/produce-egg.svg", description: "Free-range country hen eggs high in protein and natural carotenoids." },
    { id: 3, name: "Pure Farm Fresh Cow Milk (പശുവിൻ പാൽ)", category: "milk", price: 54, unit: "litre", quantity: 60, district: "Kottayam", village: "Pala", fair_price: true, farmer_name: "Manoj Kumar", image: "../../static/img/produce-milk.svg", description: "Raw unadulterated cow milk fresh from morning milking at local dairy farm." },
    { id: 4, name: "Spicy Green Chillies (പച്ചമുളക്)", category: "vegetable", price: 45, unit: "kg", quantity: 45, district: "Idukki", village: "Thodupuzha", fair_price: true, farmer_name: "Biju Varghese", image: "../../static/img/produce-chilli.svg", description: "Hot, pungent green chillies grown naturally without synthetic insecticides." },
    { id: 5, name: "Fresh Tapioca / Cassava (കപ്പ)", category: "crop", price: 25, unit: "kg", quantity: 300, district: "Ernakulam", village: "Perumbavoor", fair_price: true, farmer_name: "Eldho Paul", image: "../../static/img/produce-tapioca.svg", description: "Freshly harvested buttery soft boiling Kerala kappa tubers." },
    { id: 6, name: "Organic Malabar Black Pepper (കുരുമുളക്)", category: "other", price: 550, unit: "kg", quantity: 35, district: "Idukki", village: "Nedumkandam", fair_price: true, farmer_name: "Sunny Thomas", image: "../../static/img/produce-pepper.svg", description: "Sun-dried grade 1 Tellicherry black pepper garbled with bold aroma." },
    { id: 7, name: "Fresh Tender & Husked Coconut (തേങ്ങ)", category: "fruit", price: 38, unit: "piece", quantity: 180, district: "Thrissur", village: "Chalakudy", fair_price: true, farmer_name: "Sasi Nair", image: "../../static/img/produce-coconut.svg", description: "Sweet water tender coconuts and mature rich oil-grade coconuts." },
    { id: 8, name: "Farm Fresh Wild Ginger (ഇഞ്ചി)", category: "vegetable", price: 120, unit: "kg", quantity: 40, district: "Wayanad", village: "Sulthan Bathery", fair_price: true, farmer_name: "Varkey Chacko", image: "../../static/img/produce-ginger.svg", description: "Aromatic native ginger rhizomes freshly pulled from hill soils." },
    { id: 9, name: "Highland Green Cardamom (ഏലക്ക)", category: "other", price: 1800, unit: "kg", quantity: 15, district: "Idukki", village: "Kumily", fair_price: true, farmer_name: "Kurian Joseph", image: "../../static/img/produce-cardamom.svg", description: "Extra-bold 8mm green cardamom pods dried in traditional firewood kilns." },
    { id: 10, name: "Elephant Foot Yam (നാടൻ ചേന)", category: "crop", price: 42, unit: "kg", quantity: 150, district: "Ernakulam", village: "Muvattupuzha", fair_price: true, farmer_name: "Gopalakrishnan", image: "../../static/img/produce-yam.svg", description: "Rich, non-itchy traditional native yam for authentic Kerala curries." },
    { id: 11, name: "Farm Bitter Gourd (പാവയ്ക്ക)", category: "vegetable", price: 48, unit: "kg", quantity: 50, district: "Alappuzha", village: "Kayamkulam", fair_price: true, farmer_name: "Shaji K.", image: "../../static/img/produce-gourd.svg", description: "Crisp green bitter gourds cultivated on bio-fencing trellis." },
    { id: 12, name: "Vine-Ripened Country Tomatoes (നാടൻ തക്കാളി)", category: "vegetable", price: 38, unit: "kg", quantity: 90, district: "Palakkad", village: "Chittur", fair_price: true, farmer_name: "Murugan P.", image: "../../static/img/produce-tomato.svg", description: "Juicy, naturally ripened country red tomatoes freshly handpicked." }
  ];
}

// ---------------------------------------------------------------------------
// 2. Buyer Order History
// ---------------------------------------------------------------------------
async function loadBuyerOrders() {
  const container = document.getElementById("buyer-orders-list");
  if (!container) return;

  let orders = [];

  try {
    const res = await fetch("/api/orders/mine");
    if (res.ok) {
      const data = await res.json();
      orders = data.orders || [];
    }
  } catch (_) {}

  // Merge locally stored orders placed by buyer
  try {
    const localRaw = localStorage.getItem("krishi_buyer_orders");
    if (localRaw) {
      const localOrders = JSON.parse(localRaw);
      localOrders.forEach((lo) => {
        if (!orders.some((o) => o.id === lo.id)) {
          orders.unshift(lo);
        }
      });
    }
  } catch (_) {}

  if (orders.length === 0) {
    orders = [
      {
        id: 21,
        order_type: "produce",
        total: 260.0,
        status: "confirmed",
        created_at: "2026-11-07 18:20",
        items: [
          { item_name: "Organic Nendran Bananas", unit_price: 52, quantity: 3 },
          { item_name: "Country Eggs", unit_price: 8, quantity: 12 }
        ]
      }
    ];
  }

  // Check if just navigated from checkout
  const urlParams = new URLSearchParams(window.location.search);
  const isJustOrdered = urlParams.get("just_ordered") === "1";
  let successBanner = "";

  if (isJustOrdered && orders.length > 0) {
    const latest = orders[0];
    successBanner = `
      <div class="surface-card" style="background: linear-gradient(135deg, #E8F5E9 0%, #FAF8F2 100%); border: 2px solid var(--primary-green); padding: 20px; margin-bottom: 24px; text-align: center; animation: slideUpFade 0.3s ease;">
        <div style="font-size: 2.5rem; margin-bottom: 6px;">🎉</div>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--dark-green); margin-bottom: 6px;">Fresh Produce Order Placed!</h2>
        <p style="font-size: 0.95rem; color: var(--text-dark); margin-bottom: 12px;">
          Your order <strong>#${latest.id}</strong> has been sent directly to the farm. Total payable on delivery: <strong style="color: var(--dark-green);">₹${parseFloat(latest.total).toFixed(2)}</strong>
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="produce.html" class="btn btn-primary btn-sm"><span>🌾 Browse More Fresh Harvests</span></a>
          <a href="home.html" class="btn btn-outline btn-sm"><span>🛒 Buyer Marketplace</span></a>
        </div>
      </div>
    `;
  }

  renderBuyerOrders(orders, container, successBanner);
}

function renderBuyerOrders(orders, container, bannerHtml = "") {
  if (orders.length === 0) {
    container.innerHTML = bannerHtml + `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <div class="empty-state-title">No orders placed yet</div>
        <div class="empty-state-desc">Discover farm-fresh harvests and buy directly from nearby growers.</div>
        <a href="produce.html" class="btn btn-primary btn-sm" style="margin-top: 10px;">
          <span>Explore Fresh Produce Marketplace →</span>
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = bannerHtml + orders.map((o) => `
    <div class="surface-card" style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap;">
        <div>
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--dark-green);">ORDER #${o.id}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 8px;">${o.created_at || "Recent"}</span>
        </div>
        <span class="badge ${o.status === 'confirmed' ? 'badge-govt' : 'badge-coop'}">${o.status.toUpperCase()}</span>
      </div>
      <div style="border-top: 1px solid var(--card-border); padding-top: 10px; margin-top: 6px;">
        ${(o.items || []).map((i) => `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
            <span>${i.item_name} × ${i.quantity}</span>
            <span style="font-family: var(--font-mono);">₹${(i.unit_price * i.quantity).toFixed(2)}</span>
          </div>
        `).join("")}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--card-border); padding-top: 10px; margin-top: 10px;">
        <span style="font-weight: 700;">Total (Cash on Delivery):</span>
        <span style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 800; color: var(--dark-green);">₹${parseFloat(o.total).toFixed(2)}</span>
      </div>
    </div>
  `).join("");
}

function adjustBuyerCardQty(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  let val = parseInt(el.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  el.value = val;
}

// ---------------------------------------------------------------------------
// 3. DOM Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Read URL query parameters (?category=vegetable&q=banana)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCat = urlParams.get("category");
  const paramQ = urlParams.get("q");

  if (paramCat) {
    document.querySelectorAll(".produce-chip").forEach((b) => {
      if (b.getAttribute("data-category") === paramCat) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  if (paramQ) {
    const searchInput = document.getElementById("produce-search");
    if (searchInput) searchInput.value = paramQ;
  }

  loadBuyerProduce();
  loadBuyerOrders();

  // Category filter chips
  document.querySelectorAll(".produce-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".produce-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadBuyerProduce();
    });
  });

  // Filters & search listeners
  const distFilter = document.getElementById("produce-district-filter");
  if (distFilter) distFilter.addEventListener("change", loadBuyerProduce);
  const sortFilter = document.getElementById("produce-sort-filter");
  if (sortFilter) sortFilter.addEventListener("change", loadBuyerProduce);
  const searchInput = document.getElementById("produce-search");
  if (searchInput) searchInput.addEventListener("input", loadBuyerProduce);
});

