/**
 * KrishiSetu - Cart & Dynamic Price Calculation Engine
 * Supports both Farmer Subsidized Inputs and Buyer Fresh Produce
 * Fully responsive with direct quantity input, bulk chips, and live calculation.
 */

// ---------------------------------------------------------------------------
// 1. Context-Aware Storage Key
// ---------------------------------------------------------------------------
function getCartStorageKey() {
  const isBuyer = window.location.pathname.includes("buyer");
  return isBuyer ? "krishi_buyer_cart" : "krishi_farmer_cart";
}

function getCartItems() {
  try {
    const key = getCartStorageKey();
    let raw = localStorage.getItem(key);
    
    // Fallback/migration from legacy single cart key
    if (!raw && localStorage.getItem("krishi_cart")) {
      const legacy = JSON.parse(localStorage.getItem("krishi_cart"));
      const isBuyer = window.location.pathname.includes("buyer");
      const filtered = legacy.filter((item) => (isBuyer ? item.type === "produce" : item.type === "input"));
      if (filtered.length > 0) {
        saveCartItems(filtered);
        return filtered;
      }
    }

    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load cart from storage", e);
    return [];
  }
}

function saveCartItems(items) {
  const key = getCartStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
  updateCartBadge();
  updateFloatingCartBar();
}

// ---------------------------------------------------------------------------
// 2. Add, Update & Remove Cart Items
// ---------------------------------------------------------------------------
function getProduceThumb(name = "", type = "produce") {
  const n = (name || "").toLowerCase();
  if (type === "input") {
    if (n.includes("vermi") || n.includes("compost") || n.includes("manure")) return "../../static/img/input-vermicompost.svg";
    if (n.includes("seed") || n.includes("paddy") || n.includes("cowpea")) return "../../static/img/input-seeds.svg";
    if (n.includes("neem")) return "../../static/img/input-neem.svg";
    if (n.includes("factomphos") || n.includes("potash") || n.includes("mop") || n.includes("fertilizer") || n.includes("urea")) return "../../static/img/input-fertilizer.svg";
    return "../../static/img/input-vermicompost.svg";
  }

  // Produce crops
  if (n.includes("banana") || n.includes("nendran") || n.includes("robusta") || n.includes("പഴം")) return "../../static/img/produce-banana.svg";
  if (n.includes("egg") || n.includes("മുട്ട")) return "../../static/img/produce-egg.svg";
  if (n.includes("milk") || n.includes("പാൽ") || n.includes("dairy")) return "../../static/img/produce-milk.svg";
  if (n.includes("chilli") || n.includes("chilly") || n.includes("മുളക്")) return "../../static/img/produce-chilli.svg";
  if (n.includes("tapioca") || n.includes("cassava") || n.includes("കപ്പ") || n.includes("kappa")) return "../../static/img/produce-tapioca.svg";
  if (n.includes("pepper") || n.includes("കുരുമുളക്")) return "../../static/img/produce-pepper.svg";
  if (n.includes("coconut") || n.includes("തേങ്ങ") || n.includes("tender")) return "../../static/img/produce-coconut.svg";
  if (n.includes("ginger") || n.includes("ഇഞ്ചി")) return "../../static/img/produce-ginger.svg";
  if (n.includes("cardamom") || n.includes("ഏലക്ക")) return "../../static/img/produce-cardamom.svg";
  if (n.includes("yam") || n.includes("chena") || n.includes("ചേന")) return "../../static/img/produce-yam.svg";
  if (n.includes("gourd") || n.includes("pavakka") || n.includes("പാവയ്ക്ക")) return "../../static/img/produce-gourd.svg";
  if (n.includes("tomato") || n.includes("തക്കാളി")) return "../../static/img/produce-tomato.svg";
  return "../../static/img/placeholder.svg";
}

function addItemToCart(item, showFeedback = true) {
  // item: { id, name, price, unit, type ('input' | 'produce'), sellerName, image, quantity }
  const cart = getCartItems();
  const existing = cart.find((i) => i.id === item.id && i.type === item.type);
  const addQty = Math.max(1, parseInt(item.quantity) || 1);
  const thumbUrl = item.image || getProduceThumb(item.name, item.type);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + addQty;
    if (!existing.image) existing.image = thumbUrl;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      unit: item.unit || "unit",
      type: item.type || (window.location.pathname.includes("buyer") ? "produce" : "input"),
      sellerName: item.sellerName || "Kerala Direct Seller",
      image: thumbUrl,
      quantity: addQty
    });
  }

  saveCartItems(cart);
  updateFloatingCartBar();

  if (showFeedback) {
    const isInsideSub = window.location.pathname.includes("farmer") || window.location.pathname.includes("buyer");
    const targetCart = (item.type === "produce" || window.location.pathname.includes("buyer"))
      ? (isInsideSub ? "cart.html" : "templates/buyer/cart.html")
      : (isInsideSub ? "cart.html" : "templates/farmer/cart.html");
    showToast(`Added ${addQty} ${item.unit || ""} of ${item.name} to cart. <a href="${targetCart}" style="color: #FFF; text-decoration: underline; font-weight: 700; margin-left: 6px;">Proceed to Cart →</a>`, "success");
  }
  
  // If cart view is open, re-render
  if (document.getElementById("cart-items-container")) {
    renderCartView();
  }
}

function buyItemNow(item) {
  addItemToCart(item, false);
  const isInsideSub = window.location.pathname.includes("farmer") || window.location.pathname.includes("buyer");
  const targetCart = (item.type === "produce" || window.location.pathname.includes("buyer"))
    ? (isInsideSub ? "cart.html" : "templates/buyer/cart.html")
    : (isInsideSub ? "cart.html" : "templates/farmer/cart.html");
  window.location.href = targetCart;
}

function updateItemQuantity(id, type, delta) {
  let cart = getCartItems();
  const item = cart.find((i) => i.id === id && i.type === type);
  if (!item) return;

  const newQty = (item.quantity || 1) + delta;
  if (newQty <= 0) {
    removeItemFromCart(id, type);
    return;
  }

  item.quantity = newQty;
  saveCartItems(cart);
  renderCartView();
  showToast(`Updated ${item.name} quantity to ${item.quantity}`, "info");
}

function setItemQuantity(id, type, rawValue) {
  let cart = getCartItems();
  const item = cart.find((i) => i.id === id && i.type === type);
  if (!item) return;

  const parsed = parseInt(rawValue);
  if (isNaN(parsed) || parsed < 1) {
    // If cleared or zero, default to 1
    item.quantity = 1;
  } else {
    item.quantity = Math.min(parsed, 999);
  }

  saveCartItems(cart);
  renderCartView();
}

function removeItemFromCart(id, type) {
  let cart = getCartItems();
  const item = cart.find((i) => i.id === id && i.type === type);
  const name = item ? item.name : "Item";

  cart = cart.filter((i) => !(i.id === id && i.type === type));
  saveCartItems(cart);
  renderCartView();
  showToast(`Removed ${name} from cart`, "info");
}

function clearCart() {
  saveCartItems([]);
  renderCartView();
}

// ---------------------------------------------------------------------------
// 3. Render Cart View with Live Price Calculation
// ---------------------------------------------------------------------------
function renderCartView() {
  const container = document.getElementById("cart-items-container");
  const emptyView = document.getElementById("cart-empty-view");
  const checkoutCard = document.getElementById("cart-checkout-card");
  const subtotalEl = document.getElementById("cart-subtotal-val");
  const grandTotalEl = document.getElementById("cart-grand-total");
  const itemCountEl = document.getElementById("cart-item-count");

  if (!container) return;

  const cart = getCartItems();

  if (cart.length === 0) {
    if (emptyView) emptyView.style.display = "block";
    if (checkoutCard) checkoutCard.style.display = "none";
    container.innerHTML = "";
    if (subtotalEl) subtotalEl.textContent = "₹0.00";
    if (grandTotalEl) grandTotalEl.textContent = "₹0.00";
    if (itemCountEl) itemCountEl.textContent = "0 items";
    return;
  }

  if (emptyView) emptyView.style.display = "none";
  if (checkoutCard) checkoutCard.style.display = "block";

  let totalAmount = 0.0;
  let totalUnits = 0;

  container.innerHTML = cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    totalUnits += item.quantity;

    const badgeClass = item.type === "input" ? "badge-govt" : "badge-coop";
    const badgeText = item.type === "input" ? "GOVT INPUT" : "FRESH HARVEST";
    const imgUrl = item.image || getProduceThumb(item.name, item.type);

    return `
      <div class="cart-item-card">
        <div class="cart-item-thumb-col">
          <img src="${imgUrl}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='../../static/img/placeholder.svg'">
        </div>

        <div class="cart-item-info">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <h3 class="cart-item-name">${item.name}</h3>
          <div class="cart-item-seller">🧑‍🌾 ${item.sellerName}</div>
          <div class="cart-item-unit-rate">Rate: ₹${item.price.toFixed(2)} / ${item.unit}</div>
        </div>

        <!-- Quantity Section with direct input & quick pills -->
        <div class="cart-qty-wrapper">
          <span class="qty-label-sub">Quantity (${item.unit}):</span>
          <div class="stepper-box">
            <button type="button" class="stepper-btn" onclick="updateItemQuantity(${item.id}, '${item.type}', -1)" title="Decrease">−</button>
            <input type="number" class="stepper-input" min="1" max="999" value="${item.quantity}" onchange="setItemQuantity(${item.id}, '${item.type}', this.value)" oninput="setItemQuantity(${item.id}, '${item.type}', this.value)">
            <button type="button" class="stepper-btn" onclick="updateItemQuantity(${item.id}, '${item.type}', 1)" title="Increase">+</button>
          </div>
          <div class="quick-qty-chips">
            <button type="button" class="quick-qty-chip" onclick="updateItemQuantity(${item.id}, '${item.type}', 1)">+1</button>
            <button type="button" class="quick-qty-chip" onclick="updateItemQuantity(${item.id}, '${item.type}', 5)">+5</button>
            <button type="button" class="quick-qty-chip" onclick="updateItemQuantity(${item.id}, '${item.type}', 10)">+10</button>
          </div>
        </div>

        <!-- Real-time Line Price Calculation -->
        <div class="cart-price-column">
          <span class="line-calc-formula">₹${item.price.toFixed(0)} × ${item.quantity} ${item.unit}</span>
          <span class="line-total-price">₹${itemTotal.toFixed(2)}</span>
          <button type="button" class="btn-remove-item" onclick="removeItemFromCart(${item.id}, '${item.type}')">
            <span>🗑️ Remove</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Update summary breakdown
  const formattedTotal = `₹${totalAmount.toFixed(2)}`;
  if (subtotalEl) subtotalEl.textContent = formattedTotal;
  if (grandTotalEl) grandTotalEl.textContent = formattedTotal;
  if (itemCountEl) itemCountEl.textContent = `${cart.length} item(s) • ${totalUnits} units`;
}

// ---------------------------------------------------------------------------
// 4. Quick Add & Price Calculator Section inside Cart
// ---------------------------------------------------------------------------
const QUICK_CATALOG = {
  farmer: [
    { id: 1, name: "Vermicompost (Organic Bio-Manure)", price: 18, unit: "kg", sellerName: "Krishibhavan Aluva", type: "input", image: "../../static/img/input-vermicompost.svg" },
    { id: 2, name: "High-Yield Cowpea Seeds (Anaswara)", price: 45, unit: "packet", sellerName: "Krishibhavan Nedumbassery", type: "input", image: "../../static/img/input-seeds.svg" },
    { id: 3, name: "Neem Cake Powder (Bio-Pesticide)", price: 35, unit: "kg", sellerName: "Karshika Sahakarana Sangham", type: "input", image: "../../static/img/input-neem.svg" },
    { id: 4, name: "Factomphos 20:20:0:13 Complex", price: 28, unit: "kg", sellerName: "Kisan Agro Cooperative", type: "input", image: "../../static/img/input-fertilizer.svg" },
    { id: 5, name: "Certified Paddy Seeds (Uma MO-16)", price: 40, unit: "kg", sellerName: "Krishibhavan Palakkad", type: "input", image: "../../static/img/input-seeds.svg" },
    { id: 6, name: "Muriate of Potash (MOP)", price: 32, unit: "kg", sellerName: "Green Kerala Agro Store", type: "input", image: "../../static/img/input-fertilizer.svg" }
  ],
  buyer: [
    { id: 1, name: "Organic Nendran Bananas (നേന്ത്രപ്പഴം)", price: 52, unit: "kg", sellerName: "Rajan Pillai (Aluva)", type: "produce", image: "../../static/img/produce-banana.svg" },
    { id: 2, name: "Fresh Country Hen Eggs (നാടൻ മുട്ട)", price: 8, unit: "piece", sellerName: "Mariamma Joseph (Thrissur)", type: "produce", image: "../../static/img/produce-egg.svg" },
    { id: 3, name: "Pure Morning Cow Milk (പശുവിൻ പാൽ)", price: 54, unit: "litre", sellerName: "Manoj Kumar (Kottayam)", type: "produce", image: "../../static/img/produce-milk.svg" },
    { id: 4, name: "Spicy Green Chillies (പച്ചമുളക്)", price: 45, unit: "kg", sellerName: "Biju Varghese (Idukki)", type: "produce", image: "../../static/img/produce-chilli.svg" },
    { id: 5, name: "Fresh Tapioca / Cassava (കപ്പ)", price: 25, unit: "kg", sellerName: "Eldho Paul (Ernakulam)", type: "produce", image: "../../static/img/produce-tapioca.svg" },
    { id: 6, name: "Organic Malabar Black Pepper (കുരുമുളക്)", price: 550, unit: "kg", sellerName: "Sunny Thomas (Idukki)", type: "produce", image: "../../static/img/produce-pepper.svg" },
    { id: 7, name: "Fresh Tender & Husked Coconut (തേങ്ങ)", price: 38, unit: "piece", sellerName: "Sasi Nair (Chalakudy)", type: "produce", image: "../../static/img/produce-coconut.svg" },
    { id: 8, name: "Farm Fresh Wild Ginger (ഇഞ്ചി)", price: 120, unit: "kg", sellerName: "Varkey Chacko (Wayanad)", type: "produce", image: "../../static/img/produce-ginger.svg" },
    { id: 9, name: "Highland Green Cardamom (ഏലക്ക)", price: 1800, unit: "kg", sellerName: "Kurian Joseph (Kumily)", type: "produce", image: "../../static/img/produce-cardamom.svg" },
    { id: 10, name: "Elephant Foot Yam (നാടൻ ചേന)", price: 42, unit: "kg", sellerName: "Gopalakrishnan (Muvattupuzha)", type: "produce", image: "../../static/img/produce-yam.svg" },
    { id: 11, name: "Farm Bitter Gourd (പാവയ്ക്ക)", price: 48, unit: "kg", sellerName: "Shaji K. (Alappuzha)", type: "produce", image: "../../static/img/produce-gourd.svg" },
    { id: 12, name: "Country Red Tomatoes (തക്കാളി)", price: 38, unit: "kg", sellerName: "Murugan P. (Palakkad)", type: "produce", image: "../../static/img/produce-tomato.svg" }
  ]
};

function initQuickAddSection() {
  const selectEl = document.getElementById("quick-add-select");
  if (!selectEl) return;

  const isBuyer = window.location.pathname.includes("buyer");
  const catalog = isBuyer ? QUICK_CATALOG.buyer : QUICK_CATALOG.farmer;

  selectEl.innerHTML = catalog.map((p, idx) => `
    <option value="${p.id}" data-idx="${idx}">
      ${p.name} — ₹${p.price} / ${p.unit} (${p.sellerName})
    </option>
  `).join("");

  updateQuickAddPreview();
}

function adjustQuickAddQty(delta) {
  const qtyInput = document.getElementById("quick-add-qty");
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  val = Math.max(1, val + delta);
  qtyInput.value = val;
  updateQuickAddPreview();
}

function updateQuickAddPreview() {
  const selectEl = document.getElementById("quick-add-select");
  const qtyInput = document.getElementById("quick-add-qty");
  const previewEl = document.getElementById("quick-add-calc-preview");
  if (!selectEl || !qtyInput || !previewEl) return;

  const isBuyer = window.location.pathname.includes("buyer");
  const catalog = isBuyer ? QUICK_CATALOG.buyer : QUICK_CATALOG.farmer;
  const selectedId = parseInt(selectEl.value);
  const item = catalog.find((i) => i.id === selectedId) || catalog[0];
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);

  const calcTotal = item.price * qty;
  const imgUrl = item.image || getProduceThumb(item.name, item.type);

  previewEl.innerHTML = `
    <div class="quick-add-preview-box">
      <img src="${imgUrl}" alt="${item.name}" class="quick-add-preview-thumb" onerror="this.src='../../static/img/placeholder.svg'">
      <div class="quick-add-preview-details">
        <div class="quick-add-preview-name">${item.name}</div>
        <div class="quick-add-preview-calc">
          ₹${item.price.toFixed(2)} × ${qty} ${item.unit} = <strong>₹${calcTotal.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  `;
}

function executeQuickAdd() {
  const selectEl = document.getElementById("quick-add-select");
  const qtyInput = document.getElementById("quick-add-qty");
  if (!selectEl || !qtyInput) return;

  const isBuyer = window.location.pathname.includes("buyer");
  const catalog = isBuyer ? QUICK_CATALOG.buyer : QUICK_CATALOG.farmer;
  const selectedId = parseInt(selectEl.value);
  const item = catalog.find((i) => i.id === selectedId);
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);

  if (item) {
    addItemToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      type: item.type,
      sellerName: item.sellerName,
      image: item.image || getProduceThumb(item.name, item.type),
      quantity: qty
    });
    // Reset quick quantity
    qtyInput.value = 1;
    updateQuickAddPreview();
  }
}

// ---------------------------------------------------------------------------
// 5. Checkout Form Submission (Direct Progression to Next Page)
// ---------------------------------------------------------------------------
async function submitCheckout(e) {
  if (e) e.preventDefault();
  const cart = getCartItems();
  if (cart.length === 0) {
    showToast("Your cart is empty. Please add items before placing order.", "error");
    return;
  }

  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const addressInput = document.getElementById("checkout-address");
  const submitBtn = document.getElementById("place-order-btn");

  const contactName = nameInput ? nameInput.value.trim() : "";
  const contactPhone = phoneInput ? phoneInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";

  if (!contactName || !contactPhone || !address) {
    showToast("Please provide your name, phone number, and delivery address.", "error");
    return;
  }

  const orderType = window.location.pathname.includes("buyer") ? "produce" : "input";
  const nextUrl = "orders.html?just_ordered=1";

  const payload = {
    order_type: orderType,
    items: cart.map((i) => ({ item_id: i.id, quantity: i.quantity })),
    contact_name: contactName,
    contact_phone: contactPhone,
    address: address
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing Order...";
  }

  let finalOrderId = Math.floor(Math.random() * 800 + 100);
  let finalTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      finalOrderId = data.order_id || finalOrderId;
      finalTotal = data.total || finalTotal;
    }
  } catch (_) {
    // Demo offline fallback continues directly
  }

  // Construct local order record
  const newOrder = {
    id: finalOrderId,
    order_type: orderType,
    total: finalTotal,
    status: "placed",
    created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    contact_name: contactName,
    contact_phone: contactPhone,
    address: address,
    items: cart.map((i) => ({
      item_name: i.name,
      unit_price: i.price,
      quantity: i.quantity
    }))
  };

  // Save to localStorage
  const storageKey = orderType === "produce" ? "krishi_buyer_orders" : "krishi_farmer_orders";
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    stored.unshift(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(stored));
    localStorage.setItem("krishi_just_placed_order", JSON.stringify(newOrder));
  } catch (_) {}

  // Clear current cart
  clearCart();

  showToast(`Order #${finalOrderId} placed successfully! Opening your Orders page...`, "success");

  // DIRECT TRANSITION TO THE NEXT PAGE:
  setTimeout(() => {
    window.location.href = nextUrl;
  }, 400);
}

function showOrderSuccess(orderId, totalAmount) {
  const nextUrl = "orders.html?just_ordered=1";
  window.location.href = nextUrl;
}

// ---------------------------------------------------------------------------
// 6. Floating Cart Sequential Connector
// ---------------------------------------------------------------------------
function updateFloatingCartBar() {
  const isInputsPage = window.location.pathname.includes("inputs");
  const isProducePage = window.location.pathname.includes("produce");
  
  if (!isInputsPage && !isProducePage) {
    const existing = document.getElementById("floating-cart-bar");
    if (existing) existing.remove();
    return;
  }

  const cart = getCartItems();
  let bar = document.getElementById("floating-cart-bar");

  if (!cart || cart.length === 0) {
    if (bar) bar.remove();
    return;
  }

  const totalCount = cart.reduce((sum, i) => sum + (parseInt(i.quantity) || 1), 0);
  const totalAmount = cart.reduce((sum, i) => sum + (parseFloat(i.price) * (parseInt(i.quantity) || 1)), 0);
  const targetUrl = "cart.html";
  const stepLabel = isProducePage ? "Review Cart & Checkout (Step 2) →" : "Proceed to Cart & Price Calculation (Step 2) →";

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "floating-cart-bar";
    bar.className = "floating-cart-bar";
    document.body.appendChild(bar);
  }

  bar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.4rem;">🛒</span>
      <div>
        <div style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF;">${totalCount} item${totalCount > 1 ? "s" : ""} selected</div>
        <div style="font-size: 0.85rem; color: #E8F5E9;">Subtotal: <strong style="color: #A3E635;">₹${totalAmount.toFixed(2)}</strong></div>
      </div>
    </div>
    <a href="${targetUrl}" class="btn" style="background: #A3E635; color: #1B4332; font-weight: 700; padding: 10px 16px; border: none; text-decoration: none; border-radius: 10px; font-size: 0.88rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      <span>${stepLabel}</span>
    </a>
  `;
}

// ---------------------------------------------------------------------------
// 7. DOM Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderCartView();
  initQuickAddSection();
  updateFloatingCartBar();

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", submitCheckout);
  }
});
