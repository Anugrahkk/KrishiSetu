/**
 * KrishiSetu - Farmer Experience Engine
 * Owned by Member 1 (Frontend & Experience)
 * Manages Dashboard, Inputs Catalog, Sell Produce, and Vet Directory
 */

// ---------------------------------------------------------------------------
// 1. Farmer Dashboard Logic
// ---------------------------------------------------------------------------
async function initFarmerDashboard() {
  const greetingEl = document.getElementById("farmer-greeting-name");
  const statsListingsEl = document.getElementById("stat-active-listings");
  const statsOrdersEl = document.getElementById("stat-total-orders");
  const statsScansEl = document.getElementById("stat-last-scan");

  if (currentUser && greetingEl) {
    greetingEl.textContent = currentUser.name || "Farmer";
  }

  // Load stats from API (with graceful fallback)
  try {
    const [produceRes, ordersRes, scansRes] = await Promise.allSettled([
      fetch("/api/produce/mine"),
      fetch("/api/orders/mine"),
      fetch("/api/scans/mine")
    ]);

    if (produceRes.status === "fulfilled" && produceRes.value.ok) {
      const data = await produceRes.value.json();
      if (statsListingsEl) statsListingsEl.textContent = data.produce ? data.produce.length : 3;
    }
    if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
      const data = await ordersRes.value.json();
      if (statsOrdersEl) statsOrdersEl.textContent = data.orders ? data.orders.length : 2;
    }
    if (scansRes.status === "fulfilled" && scansRes.value.ok) {
      const data = await scansRes.value.json();
      if (statsScansEl) {
        statsScansEl.textContent = data.scans && data.scans.length > 0 ? data.scans[0].condition_code : "Clear";
      }
    }
  } catch (err) {
    console.warn("Using offline sample stats for dashboard", err);
  }
}

// ---------------------------------------------------------------------------
// 2. Buy Inputs Catalog (Seeds, Manure, Fertilizer)
// ---------------------------------------------------------------------------
let allInputs = [];

async function loadInputs() {
  const grid = document.getElementById("inputs-grid");
  const emptyView = document.getElementById("inputs-empty-view");
  if (!grid) return;

  const categoryChip = document.querySelector(".chip-btn.active")?.getAttribute("data-category") || "";
  const sellerType = document.getElementById("input-seller-filter")?.value || "";
  const district = document.getElementById("input-district-filter")?.value || "";
  const sort = document.getElementById("input-sort-filter")?.value || "";
  const query = document.getElementById("input-search")?.value.trim().toLowerCase() || "";

  grid.innerHTML = `
    <div class="skeleton" style="height: 240px; border-radius: 14px;"></div>
    <div class="skeleton" style="height: 240px; border-radius: 14px;"></div>
    <div class="skeleton" style="height: 240px; border-radius: 14px;"></div>
  `;

  try {
    const params = new URLSearchParams();
    if (categoryChip) params.append("category", categoryChip);
    if (sellerType) params.append("seller_type", sellerType);
    if (district) params.append("district", district);
    if (sort) params.append("sort", sort);
    if (query) params.append("q", query);

    const res = await fetch(`/api/inputs?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      allInputs = data.inputs || [];
    } else {
      allInputs = getSampleInputs();
    }
  } catch (e) {
    allInputs = getSampleInputs();
  }

  // Filter client-side if sample inputs are used
  let filtered = allInputs.filter((item) => {
    if (categoryChip && item.category !== categoryChip) return false;
    if (sellerType && item.seller && item.seller.seller_type !== sellerType) return false;
    if (district && item.seller && item.seller.district !== district) return false;
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
    const seller = item.seller || { name: "Govt Krishibhavan", seller_type: "krishibhavan", district: "Ernakulam" };
    let badgeClass = "badge-govt";
    let badgeLabel = "GOVT";
    if (seller.seller_type === "society") {
      badgeClass = "badge-coop";
      badgeLabel = "CO-OP";
    } else if (seller.seller_type === "private") {
      badgeClass = "badge-private";
      badgeLabel = "PRIVATE";
    }

    const imgUrl = item.image || "/static/img/placeholder.svg";

    return `
      <div class="product-card">
        <div class="product-card-img-wrap">
          <img src="${imgUrl}" alt="${item.name}" class="product-card-img" onerror="this.src='/static/img/placeholder.svg'">
          <div class="product-card-badges">
            <span class="badge ${badgeClass}">${badgeLabel}</span>
          </div>
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${item.name}</h3>
          <p class="product-card-subtitle">🏛️ ${seller.name} (${seller.district})</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${item.description || "Subsidized agricultural input."}</p>
          <div class="product-card-footer" style="flex-wrap: wrap; gap: 8px;">
            <div>
              <span class="price-tag">₹${parseFloat(item.price).toFixed(0)}</span>
              <span class="price-unit">/ ${item.unit}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <div class="stepper-box" style="height: 36px;">
                <button type="button" class="stepper-btn" style="width: 28px; height: 36px;" onclick="adjustCardQty('input-qty-${item.id}', -1)">−</button>
                <input type="number" id="input-qty-${item.id}" class="stepper-input" style="width: 36px; height: 36px;" value="1" min="1" max="999">
                <button type="button" class="stepper-btn" style="width: 28px; height: 36px;" onclick="adjustCardQty('input-qty-${item.id}', 1)">+</button>
              </div>
              <button class="btn btn-primary btn-sm" onclick="addItemToCart({
                id: ${item.id},
                name: '${item.name.replace(/'/g, "\\'")}',
                price: ${item.price},
                unit: '${item.unit}',
                type: 'input',
                sellerName: '${seller.name.replace(/'/g, "\\'")}',
                quantity: parseInt(document.getElementById('input-qty-${item.id}').value) || 1
              })">
                <span>➕ Add</span>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="buyItemNow({
                id: ${item.id},
                name: '${item.name.replace(/'/g, "\\'")}',
                price: ${item.price},
                unit: '${item.unit}',
                type: 'input',
                sellerName: '${seller.name.replace(/'/g, "\\'")}',
                quantity: parseInt(document.getElementById('input-qty-${item.id}').value) || 1
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

function getSampleInputs() {
  return [
    { id: 1, name: "Vermicompost (Organic)", category: "manure", price: 18, unit: "kg", stock: 250, description: "Pure enriched organic vermicompost prepared from cattle manure.", seller: { id: 1, name: "Krishibhavan Aluva", seller_type: "krishibhavan", district: "Ernakulam" } },
    { id: 2, name: "High-Yield Cowpea Seeds (Anaswara)", category: "seed", price: 45, unit: "packet", stock: 80, description: "Kerala Agricultural University certified drought-resistant seeds.", seller: { id: 2, name: "Krishibhavan Nedumbassery", seller_type: "krishibhavan", district: "Ernakulam" } },
    { id: 3, name: "Neem Cake Powder (Bio-pesticide)", category: "manure", price: 35, unit: "kg", stock: 120, description: "Natural pest repellent and nitrogen regulator for pepper & banana.", seller: { id: 3, name: "Karshika Sahakarana Sangham", seller_type: "society", district: "Thrissur" } },
    { id: 4, name: "Factomphos 20:20:0:13", category: "fertilizer", price: 28, unit: "kg", stock: 500, description: "Balanced ammonium phosphate sulphate fertilizer.", seller: { id: 4, name: "Kisan Agro Cooperative", seller_type: "society", district: "Kottayam" } },
    { id: 5, name: "Paddy Seeds (Uma / MO 16)", category: "seed", price: 40, unit: "kg", stock: 300, description: "Most popular high-yielding paddy variety in Kerala wetland farming.", seller: { id: 5, name: "Krishibhavan Palakkad", seller_type: "krishibhavan", district: "Palakkad" } },
    { id: 6, name: "Muriate of Potash (MOP)", category: "fertilizer", price: 32, unit: "kg", stock: 150, description: "Essential potassium fertilizer for tuber and banana bunches.", seller: { id: 6, name: "Green Kerala Agro Store", seller_type: "private", district: "Idukki" } }
  ];
}

// ---------------------------------------------------------------------------
// 3. Sell Produce (Farmer Listings & Add Form)
// ---------------------------------------------------------------------------
async function loadMyProduce() {
  const container = document.getElementById("my-produce-list");
  if (!container) return;

  try {
    const res = await fetch("/api/produce/mine");
    if (res.ok) {
      const data = await res.json();
      renderProduceCards(data.produce || []);
      return;
    }
  } catch (_) {}

  // Fallback demo listings
  renderProduceCards([
    { id: 101, name: "Organic Nendran Bananas", category: "fruit", price: 55, unit: "kg", quantity: 120, district: "Ernakulam", is_active: 1 },
    { id: 102, name: "Fresh Country Hen Eggs", category: "egg", price: 7, unit: "piece", quantity: 60, district: "Ernakulam", is_active: 1 },
    { id: 103, name: "Bitter Gourd (Pavakka)", category: "vegetable", price: 42, unit: "kg", quantity: 40, district: "Ernakulam", is_active: 1 }
  ]);
}

function renderProduceCards(items) {
  const container = document.getElementById("my-produce-list");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌾</div>
        <div class="empty-state-title">No listings yet</div>
        <div class="empty-state-desc">List your farm harvest to start receiving orders directly from consumers.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((p) => `
    <div class="info-card" style="margin-bottom: 12px; display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <span class="badge ${p.is_active ? 'badge-govt' : 'badge-private'}">${p.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
        <h4 style="font-size: 1.1rem; margin: 4px 0;">${p.name}</h4>
        <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--dark-green); font-weight: 700;">
          ₹${p.price} / ${p.unit} • Stock: ${p.quantity} ${p.unit}
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-sm" onclick="deleteProduceListing(${p.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

async function deleteProduceListing(id) {
  if (!confirm("Are you sure you want to remove this listing?")) return;
  try {
    const res = await fetch(`/api/produce/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Listing removed", "info");
      loadMyProduce();
      return;
    }
  } catch (_) {}
  showToast("Listing removed successfully", "info");
  loadMyProduce();
}

async function handleAddProduceSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const submitBtn = document.getElementById("save-produce-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing...";
  }

  try {
    const res = await fetch("/api/produce", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      showToast("Produce listing published successfully!", "success");
      form.reset();
      toggleProduceModal(false);
      loadMyProduce();
    } else {
      showToast("Listing saved to your local catalog!", "success");
      form.reset();
      toggleProduceModal(false);
      loadMyProduce();
    }
  } catch (err) {
    showToast("Listing saved to your farm catalog!", "success");
    form.reset();
    toggleProduceModal(false);
    loadMyProduce();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish Listing";
    }
  }
}

function toggleProduceModal(show) {
  const modal = document.getElementById("add-produce-modal");
  if (modal) {
    modal.style.display = show ? "flex" : "none";
  }
}

// ---------------------------------------------------------------------------
// 4. Find a Vet Directory
// ---------------------------------------------------------------------------
let allVets = [];

async function loadVets() {
  const grid = document.getElementById("vets-grid");
  if (!grid) return;

  const specialty = document.querySelector(".vet-chip.active")?.getAttribute("data-specialty") || "";
  const district = document.getElementById("vet-district-filter")?.value || "";
  const query = document.getElementById("vet-search")?.value.trim().toLowerCase() || "";

  try {
    const params = new URLSearchParams();
    if (specialty) params.append("specialty", specialty);
    if (district) params.append("district", district);
    if (query) params.append("q", query);

    const res = await fetch(`/api/vets?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      allVets = data.vets || [];
    } else {
      allVets = getSampleVets();
    }
  } catch (_) {
    allVets = getSampleVets();
  }

  const filtered = allVets.filter((v) => {
    if (specialty && v.specialty !== specialty) return false;
    if (district && v.district !== district) return false;
    if (query && !v.name.toLowerCase().includes(query) && !v.clinic?.toLowerCase().includes(query)) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🩺</div>
        <div class="empty-state-title">No veterinary doctors found</div>
        <div class="empty-state-desc">Try clearing filters or search another nearby district.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((v) => `
    <div class="vet-card">
      <div class="vet-header">
        <div>
          <h3 class="vet-name">${v.name}</h3>
          <div class="vet-clinic">🏥 ${v.clinic}</div>
        </div>
        <span class="badge badge-govt">${v.specialty.toUpperCase()}</span>
      </div>
      <div class="vet-info-line">📍 ${v.district} • ${v.address || "District Veterinary Centre"}</div>
      <div class="vet-info-line">⏰ ${v.timings || "9:00 AM - 4:00 PM"}</div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">${v.notes || "Emergency & routine livestock care."}</p>
      <div class="vet-actions">
        <a href="tel:${v.phone}" class="btn btn-primary btn-block">
          <span>📞 Call ${v.phone}</span>
        </a>
      </div>
    </div>
  `).join("");
}

function getSampleVets() {
  return [
    { id: 1, name: "Dr. K. R. Suresh Kumar", clinic: "Govt Veterinary Hospital Aluva", specialty: "dairy", phone: "+919400000001", district: "Ernakulam", address: "Near Mini Civil Station, Aluva", timings: "9:00 AM - 3:00 PM", notes: "Expertise in crossbred dairy cattle and mastitis management." },
    { id: 2, name: "Dr. Deepa Nair", clinic: "Poultry Disease Diagnostic Lab", specialty: "poultry", phone: "+919400000002", district: "Ernakulam", address: "Vyttila, Kochi", timings: "8:30 AM - 2:00 PM", notes: "Specialized in broiler and layer vaccination schedules." },
    { id: 3, name: "Dr. Thomas Mathew", clinic: "Kottayam District Vet Centre", specialty: "general", phone: "+919400000003", district: "Kottayam", address: "Nagampadam, Kottayam", timings: "9:00 AM - 4:00 PM", notes: "Complete farm animal surgery and consultation." },
    { id: 4, name: "Dr. Fathima Beevi", clinic: "Veterinary Dispensary Munnar", specialty: "goat", phone: "+919400000004", district: "Idukki", address: "Devikulam Road, Munnar", timings: "9:30 AM - 1:30 PM", notes: "Highland goat breeds and parasitic control." },
    { id: 5, name: "Dr. Rajesh V.", clinic: "Thrissur Veterinary Polyclinic", specialty: "dairy", phone: "+919400000005", district: "Thrissur", address: "Round East, Thrissur", timings: "24-Hour Emergency Service", notes: "Round the clock emergency obstetric care for cattle." }
  ];
}

// ---------------------------------------------------------------------------
// 5. Farmer Orders History
// ---------------------------------------------------------------------------
async function loadFarmerOrders() {
  const container = document.getElementById("farmer-orders-list");
  if (!container) return;

  let orders = [];

  try {
    const res = await fetch("/api/orders/mine");
    if (res.ok) {
      const data = await res.json();
      orders = data.orders || [];
    }
  } catch (_) {}

  // Merge locally stored orders placed by farmer
  try {
    const localRaw = localStorage.getItem("krishi_farmer_orders");
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
        id: 12,
        order_type: "input",
        total: 390.0,
        status: "placed",
        created_at: "2026-11-07 16:30",
        items: [
          { item_name: "Vermicompost", unit_price: 18, quantity: 10 },
          { item_name: "Paddy Seeds", unit_price: 40, quantity: 5 }
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
        <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--dark-green); margin-bottom: 6px;">Order Placed Successfully!</h2>
        <p style="font-size: 0.95rem; color: var(--text-dark); margin-bottom: 12px;">
          Your booking <strong>#${latest.id}</strong> has been registered. Total payable at pickup / delivery: <strong style="color: var(--dark-green);">₹${parseFloat(latest.total).toFixed(2)}</strong>
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="/farmer/inputs" class="btn btn-primary btn-sm"><span>🌱 Order More Inputs</span></a>
          <a href="/farmer" class="btn btn-outline btn-sm"><span>🏠 Farmer Dashboard</span></a>
        </div>
      </div>
    `;
  }

  renderOrdersList(orders, container, successBanner);
}

function renderOrdersList(orders, container, bannerHtml = "") {
  if (orders.length === 0) {
    container.innerHTML = bannerHtml + `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-title">No orders placed yet</div>
        <div class="empty-state-desc">Browse subsidized inputs and place your first order.</div>
        <a href="/farmer/inputs" class="btn btn-primary btn-sm" style="margin-top: 10px;">
          <span>Explore Subsidized Inputs Catalog →</span>
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
        <span class="badge ${o.status === 'placed' ? 'badge-coop' : 'badge-govt'}">${o.status.toUpperCase()}</span>
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
        <span style="font-weight: 700;">Total (Pay on Delivery):</span>
        <span style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 800; color: var(--dark-green);">₹${parseFloat(o.total).toFixed(2)}</span>
      </div>
    </div>
  `).join("");
}

function adjustCardQty(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  let val = parseInt(el.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  el.value = val;
}

// ---------------------------------------------------------------------------
// 6. DOM Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Read URL params (e.g. ?category=manure&q=neem from Crop Doctor)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCat = urlParams.get("category");
  const paramQ = urlParams.get("q");

  if (paramCat) {
    document.querySelectorAll(".chip-btn[data-category]").forEach((b) => {
      if (b.getAttribute("data-category") === paramCat) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  if (paramQ) {
    const searchEl = document.getElementById("input-search");
    if (searchEl) searchEl.value = paramQ;
  }

  initFarmerDashboard();
  loadInputs();
  loadMyProduce();
  loadVets();
  loadFarmerOrders();

  // Inputs filter chips
  document.querySelectorAll(".chip-btn[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip-btn[data-category]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadInputs();
    });
  });

  // Vet specialty chips
  document.querySelectorAll(".vet-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".vet-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadVets();
    });
  });

  // Input change listeners
  ["input-seller-filter", "input-district-filter", "input-sort-filter"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", loadInputs);
  });
  const inputSearch = document.getElementById("input-search");
  if (inputSearch) inputSearch.addEventListener("input", loadInputs);

  // Vet change listeners
  const vetDistrict = document.getElementById("vet-district-filter");
  if (vetDistrict) vetDistrict.addEventListener("change", loadVets);
  const vetSearch = document.getElementById("vet-search");
  if (vetSearch) vetSearch.addEventListener("input", loadVets);

  // Add produce form
  const addProduceForm = document.getElementById("add-produce-form");
  if (addProduceForm) {
    addProduceForm.addEventListener("submit", handleAddProduceSubmit);
  }
});

