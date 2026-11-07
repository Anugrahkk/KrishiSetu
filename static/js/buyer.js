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
        <div class="product-card-img-wrap">
          <img src="${imgUrl}" alt="${item.name}" class="product-card-img" onerror="this.src='/static/img/placeholder.svg'">
          <div class="product-card-badges">
            <span class="badge badge-govt">${item.category.toUpperCase()}</span>
            ${isFairPrice ? '<span class="badge badge-fair-price">✓ FAIR PRICE</span>' : ''}
          </div>
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${item.name}</h3>
          <p class="product-card-subtitle">🧑‍🌾 Direct from ${farmerName} (${farmerPlace})</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${item.description || "Fresh harvest harvested directly from Kerala farm."}</p>
          <div class="product-card-footer">
            <div>
              <span class="price-tag">₹${parseFloat(item.price).toFixed(0)}</span>
              <span class="price-unit">/ ${item.unit}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addItemToCart({
              id: ${item.id},
              name: '${item.name.replace(/'/g, "\\'")}',
              price: ${item.price},
              unit: '${item.unit}',
              type: 'produce',
              sellerName: '${farmerName.replace(/'/g, "\\'")}',
              quantity: 1
            })">
              <span>🛒 Add</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getSampleProduce() {
  return [
    { id: 1, name: "Organic Nendran Bananas", category: "fruit", price: 52, unit: "kg", quantity: 80, district: "Ernakulam", village: "Aluva", fair_price: true, farmer_name: "Rajan Pillai", description: "Naturally ripened traditional Kerala Nendran bananas." },
    { id: 2, name: "Fresh Country Eggs (നാടൻ കോഴിമുട്ട)", category: "egg", price: 8, unit: "piece", quantity: 150, district: "Thrissur", village: "Ollur", fair_price: true, farmer_name: "Mariamma Joseph", description: "Free-range country hen eggs high in protein." },
    { id: 3, name: "Pure Farm Fresh Cow Milk", category: "milk", price: 54, unit: "litre", quantity: 40, district: "Kottayam", village: "Pala", fair_price: true, farmer_name: "Manoj Kumar", description: "Raw unadulterated cow milk fresh from morning milking." },
    { id: 4, name: "Green Chillies (പച്ചമുളക്)", category: "vegetable", price: 45, unit: "kg", quantity: 30, district: "Idukki", village: "Thodupuzha", fair_price: true, farmer_name: "Biju Varghese", description: "Spicy pungent green chillies grown without synthetic chemicals." },
    { id: 5, name: "Tapioca / Cassava (കപ്പ)", category: "crop", price: 25, unit: "kg", quantity: 200, district: "Ernakulam", village: "Perumbavoor", fair_price: true, farmer_name: "Eldho Paul", description: "Freshly dug buttery soft cooking tapioca." },
    { id: 6, name: "Organic Malabar Black Pepper", category: "other", price: 550, unit: "kg", quantity: 25, district: "Idukki", village: "Nedumkandam", fair_price: true, farmer_name: "Sunny Thomas", description: "Sun-dried grade 1 tellicherry black pepper garbled." }
  ];
}

// ---------------------------------------------------------------------------
// 2. Buyer Order History
// ---------------------------------------------------------------------------
async function loadBuyerOrders() {
  const container = document.getElementById("buyer-orders-list");
  if (!container) return;

  try {
    const res = await fetch("/api/orders/mine");
    if (res.ok) {
      const data = await res.json();
      renderBuyerOrders(data.orders || [], container);
      return;
    }
  } catch (_) {}

  renderBuyerOrders([
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
  ], container);
}

function renderBuyerOrders(orders, container) {
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <div class="empty-state-title">No orders placed yet</div>
        <div class="empty-state-desc">Discover farm-fresh harvests and buy directly from nearby growers.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map((o) => `
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

// ---------------------------------------------------------------------------
// 3. DOM Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
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

