/**
 * KrishiSetu - Common Utilities & Helpers
 * Owned by Member 1 (Frontend & Experience)
 */

// ---------------------------------------------------------------------------
// 1. Malayalam / English Localization Dictionary (Stretch Goal)
// ---------------------------------------------------------------------------
const I18N = {
  en: {
    siteTitle: "KrishiSetu",
    tagline: "Direct bridge for Kerala farmers & buyers",
    farmer: "Farmer",
    buyer: "Buyer",
    iamFarmer: "I am a Farmer",
    iamBuyer: "I am a Buyer",
    home: "Home",
    buyInputs: "Buy Inputs",
    cropDoctor: "Crop Doctor",
    sellProduce: "Sell Produce",
    findVet: "Find a Vet",
    cart: "Cart",
    orders: "Orders",
    login: "Login",
    logout: "Logout",
    register: "Register",
    addToCart: "Add to Cart",
    callVet: "Call",
    fairPrice: "FAIR PRICE",
    checkout: "Checkout",
    placeOrder: "Place Order (Pay on Delivery)"
  },
  ml: {
    siteTitle: "കൃഷിസേതു",
    tagline: "കർഷകർക്കും ഉപഭോക്താക്കൾക്കും നേരിട്ടുള്ള പാലം",
    farmer: "കർഷകൻ",
    buyer: "ഉപഭോക്താവ്",
    iamFarmer: "ഞാൻ ഒരു കർഷകനാണ്",
    iamBuyer: "ഞാൻ ഒരു ഉപഭോക്താവാണ്",
    home: "ഹോം",
    buyInputs: "വിത്തും വളവും",
    cropDoctor: "വിള ഡോക്ടർ",
    sellProduce: "വിളകൾ വിൽക്കുക",
    findVet: "മൃഗഡോക്ടർ",
    cart: "കാർട്ട്",
    orders: "ഓർഡറുകൾ",
    login: "പ്രവേശിക്കുക",
    logout: "പുറത്തുകടക്കുക",
    register: "രജിസ്റ്റർ",
    addToCart: "കാർട്ടിലേക്ക് ചേർക്കുക",
    callVet: "വിളിക്കുക",
    fairPrice: "ന്യായവില",
    checkout: "ചെക്ക്ഔട്ട്",
    placeOrder: "ഓർഡർ നൽകുക (പണം നൽകി സ്വീകരിക്കാം)"
  }
};

let currentLang = localStorage.getItem("krishi_lang") || "en";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("krishi_lang", lang);
  applyTranslations();
  updateLangButtonText();
}

function toggleLanguage() {
  setLanguage(currentLang === "en" ? "ml" : "en");
}

function updateLangButtonText() {
  const btn = document.getElementById("lang-toggle-btn");
  if (btn) {
    btn.innerHTML = currentLang === "en" ? "🌐 മലയാളം" : "🌐 English";
  }
}

function applyTranslations() {
  const dict = I18N[currentLang] || I18N.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 2. Toast Notification System
// ---------------------------------------------------------------------------
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------------------------------------------------------------------------
// 3. User Session & Auth Management
// ---------------------------------------------------------------------------
let currentUser = null;

async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.user) {
        currentUser = data.user;
        localStorage.setItem("krishi_user", JSON.stringify(currentUser));
        renderUserBadge();
        return currentUser;
      }
    }
  } catch (e) {
    console.warn("Auth check failed or offline mode", e);
  }

  // Fallback to localStorage if offline/demo
  const saved = localStorage.getItem("krishi_user");
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      renderUserBadge();
      return currentUser;
    } catch (_) {}
  }
  return null;
}

function renderUserBadge() {
  const userSlot = document.getElementById("header-user-slot");
  if (!userSlot) return;

  if (currentUser) {
    const roleEmoji = currentUser.role === "farmer" ? "🌾" : "🛒";
    userSlot.innerHTML = `
      <div class="user-badge">
        <span>${roleEmoji}</span>
        <span>${currentUser.name || "User"}</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logoutUser()">
        <span data-i18n="logout">${currentLang === "ml" ? "പുറത്തുകടക്കുക" : "Logout"}</span>
      </button>
    `;
  } else {
    userSlot.innerHTML = `
      <a href="/login" class="btn btn-primary btn-sm">
        <span data-i18n="login">${currentLang === "ml" ? "പ്രവേശിക്കുക" : "Login"}</span>
      </a>
    `;
  }
}

async function logoutUser() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("Logout request failed", e);
  }
  localStorage.removeItem("krishi_user");
  currentUser = null;
  showToast("Logged out successfully", "info");
  setTimeout(() => {
    window.location.href = "/";
  }, 400);
}

// ---------------------------------------------------------------------------
// 4. Cart Counter Badge
// ---------------------------------------------------------------------------
function getCartStorageKey() {
  const isBuyer = window.location.pathname.includes("buyer");
  return isBuyer ? "krishi_buyer_cart" : "krishi_farmer_cart";
}

function getCartItems() {
  try {
    const key = getCartStorageKey();
    let raw = localStorage.getItem(key);
    if (!raw && localStorage.getItem("krishi_cart")) {
      const legacy = JSON.parse(localStorage.getItem("krishi_cart"));
      const isBuyer = window.location.pathname.includes("buyer");
      const filtered = legacy.filter((item) => (isBuyer ? item.type === "produce" : item.type === "input"));
      if (filtered.length > 0) return filtered;
    }
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCartItems(items) {
  const key = getCartStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
  updateCartBadge();
}

function updateCartBadge() {
  const badges = document.querySelectorAll(".cart-counter");
  const cart = getCartItems();
  const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  badges.forEach((b) => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? "inline-block" : "none";
  });
}

// ---------------------------------------------------------------------------
// 5. Active Nav Highlighting
// ---------------------------------------------------------------------------
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".bottom-nav-item, .header-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && (currentPath === href || (href !== "/" && currentPath.startsWith(href)))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ---------------------------------------------------------------------------
// 6. Initialization on DOM Load
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  updateLangButtonText();
  checkAuth();
  updateCartBadge();
  highlightActiveNav();

  const langBtn = document.getElementById("lang-toggle-btn");
  if (langBtn) {
    langBtn.addEventListener("click", toggleLanguage);
  }
});

