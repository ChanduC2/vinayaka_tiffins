/****************************************************************************
 * VINAYAKA TIFFINS - PREMIUM WEB INTERACTION ENGINE
 ****************************************************************************/

// ==========================================
// 1. DATA STORES & APP STATE
// ==========================================

const menuItems = [
  { 
    id: 1, 
    name: "Idly", 
    image: "assets/images/Idly.jpeg", 
    description: "4 Pieces of steamed rice cakes served with hot peanut & ginger chutneys and traditional sambar.", 
    price: 25, 
    type: "traditional", 
    isBestseller: true 
  },
  { 
    id: 2, 
    name: "Mysore Bonda", 
    image: "assets/images/Bonda.jpeg", 
    description: "4 Pieces of crispy, fluffy deep-fried fritters made of flour and yogurt.", 
    price: 25, 
    type: "light",
    isBestseller: false 
  },
  { 
    id: 3, 
    name: "Plain Dosa", 
    image: "assets/images/Plain_Dosa.jpeg", 
    description: "Crispy, paper-thin fermented rice-lentil crepe served with flavorful chutneys.", 
    price: 35, 
    type: "traditional",
    isBestseller: false 
  },
  { 
    id: 4, 
    name: "Onion Dosa", 
    image: "assets/images/Onion_Dosa.jpeg", 
    description: "Crispy crepe topped with a generous layer of finely chopped fresh onions and green chilies.", 
    price: 35, 
    type: "special",
    isBestseller: false 
  },
  { 
    id: 5, 
    name: "Upma Dosa", 
    image: "assets/images/Upma_Dosa.jpeg", 
    description: "Special fusion dosa stuffed with fresh, soft and spicy semolina upma.", 
    price: 40, 
    type: "special",
    isBestseller: true 
  },
  { 
    id: 6, 
    name: "Uthappam", 
    image: "assets/images/Uthappam.jpeg", 
    description: "Thick savory pancake topped with fresh onions, green chilies, and coriander leaves.", 
    price: 25, 
    type: "traditional",
    isBestseller: false 
  },
  { 
    id: 7, 
    name: "Pesarattu", 
    image: "assets/images/Pesarattu.jpeg", 
    description: "Healthy and high-protein green moong dal crepe cooked with chopped ginger and cumin.", 
    price: 35, 
    type: "traditional",
    isBestseller: false 
  },
  { 
    id: 8, 
    name: "Upma Pesarattu", 
    image: "assets/images/Upma_Pesarattu.jpeg", 
    description: "A legendary Andhra combination of green moong crepe stuffed with hot delicious semolina upma.", 
    price: 40, 
    type: "special",
    isBestseller: true 
  },
  { 
    id: 9, 
    name: "Vada", 
    image: "assets/images/Vada.jpeg", 
    description: "2 Pieces of crispy, golden-brown lentil donuts served with rich coconut chutney and piping hot sambar.", 
    price: 25, 
    type: "light",
    isBestseller: true 
  },
  { 
    id: 10, 
    name: "Puri", 
    image: "assets/images/puri.jpeg", 
    description: "2 Fluffy deep-fried wheat flatbreads served with spiced potato masala curry.", 
    price: 25, 
    type: "traditional",
    isBestseller: true 
  },
  { 
    id: 11, 
    name: "Punugulu", 
    image: "assets/images/Punugulu.jpeg", 
    description: "Deep-fried snack bites made of rice-dal batter, served with spicy ginger chutney.", 
    price: 25, 
    type: "light",
    isBestseller: false 
  },
  { 
    id: 12, 
    name: "Upma", 
    image: "assets/images/Upma.jpeg", 
    description: "Classic South Indian breakfast of roasted semolina cooked with vegetables, cashew nuts, and ghee.", 
    price: 25, 
    type: "light",
    isBestseller: false 
  }
];

let cart = [];
let userData = {};
let verifiedTxn = null; // Stored transaction ID verify code
let activeOrder = null; // Cache for the current active order logic
let activeFilter = "all";

// ==========================================
// 2. DOM CONTENT LOADING & STATE INITS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Splash Screen reveal with Morph animation
  initSplashScreen();

  // Initialize Data & States
  initUserData();
  initTheme();
  initMenuFilters();
  renderMenuGrid();
  updateCartCountBadge();

  // Weekly Planner dynamic setup
  initWeeklyPlannerState();

  // Scroll listener for active desktop nav highlights
  window.addEventListener("scroll", highlightActiveSection);

  // Geo-location trigger
  detectLocation();
});

// Splash Screen transition
function initSplashScreen() {
  const video = document.getElementById("introVideo");
  const circle = document.querySelector(".video-circle");
  const splash = document.getElementById("videoSplash");

  if (video) {
    // Reveal the homepage after a quick 1-second play peek
    video.addEventListener("play", () => {
      setTimeout(triggerSplashReveal, 1000);
    });

    // Fallback if video fails to load, is paused, or autoplay is blocked
    setTimeout(() => {
      triggerSplashReveal();
    }, 1200);
  } else {
    triggerSplashReveal();
  }

  function triggerSplashReveal() {
    if (circle && circle.classList.contains("morph")) return; // Prevent double trigger

    if (circle) circle.classList.add("morph");
    
    // Snappy transitions: morph in 400ms, fade out splash in 300ms
    setTimeout(() => {
      if (splash) {
        splash.style.opacity = "0";
        setTimeout(() => {
          splash.style.display = "none";
        }, 300);
      }
    }, 400);
  }
}

// User Profile Init
function initUserData() {
  const savedUser = localStorage.getItem("vinayaka_user");
  if (savedUser) {
    userData = JSON.parse(savedUser);
    updateProfileWidgets();
  }
}

// Light / Dark Theme setup
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const body = document.body;

  // Read saved setting
  const savedTheme = localStorage.getItem("dark_mode");
  if (savedTheme === "true") {
    body.classList.add("dark");
    themeToggleBtn.innerHTML = '<i class="fas fa-sun" style="color: var(--color-secondary);"></i>';
  } else {
    body.classList.remove("dark");
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }

  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("dark_mode", isDark);

    if (isDark) {
      themeToggleBtn.innerHTML = '<i class="fas fa-sun" style="color: var(--color-secondary);"></i>';
    } else {
      themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
}

// ==========================================
// 3. GEOLOCATION HANDLER
// ==========================================

function detectLocation() {
  const addressArea = document.getElementById("userAddress");
  if (!addressArea) return;

  if (navigator.geolocation) {
    addressArea.value = "Detecting your delivery address...";
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          // Reverse geocode using OpenStreetMap's free Nominatim API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              addressArea.value = data.display_name;
              return;
            }
          }
        } catch (err) {
          console.error("Geocoding fetch error: ", err);
        }
        
        // Fallback if geocoding fails
        addressArea.value = `Mandapeta region (Coords: ${lat.toFixed(5)}, ${lon.toFixed(5)})`;
      },
      () => {
        addressArea.value = "";
        addressArea.placeholder = "Location permission denied. Enter your house delivery address manually.";
        showToast("Location permission denied. Please enter address manually.", "warning");
      }
    );
  } else {
    addressArea.placeholder = "Geolocation not supported. Enter your house address manually.";
  }
}

// ==========================================
// 4. MENU GRID & RENDER FLOWS
// ==========================================

function initMenuFilters() {
  const filterContainer = document.getElementById("categoryFilters");
  if (!filterContainer) return;

  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      // Remove active from all
      filterContainer.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      
      // Make clicked active
      e.target.classList.add("active");
      activeFilter = e.target.dataset.filter;
      renderMenuGrid();
    }
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  // Filter items
  let filteredItems = menuItems;
  if (activeFilter === "bestseller") {
    filteredItems = menuItems.filter(i => i.isBestseller);
  } else if (activeFilter === "light") {
    filteredItems = menuItems.filter(i => i.type === "light");
  } else if (activeFilter === "special") {
    filteredItems = menuItems.filter(i => i.type === "special" || i.type === "traditional");
  }

  grid.innerHTML = filteredItems.map((item, idx) => {
    // Check if item is already in cart
    const cartItem = cart.find(c => c.id === item.id);
    const qty = cartItem ? cartItem.quantity : 0;

    return `
      <div class="menu-card glass-panel" style="animation: scaleIn 0.5s ${idx * 0.05}s forwards; opacity:0;">
        <div class="menu-card-img-wrapper">
          <img class="menu-card-img" src="${item.image}" onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300';" alt="${item.name}">
          ${item.isBestseller ? `<span class="menu-tag menu-tag-bestseller"><i class="fas fa-fire"></i> Best Seller</span>` : `<span class="menu-tag menu-tag-veg"><i class="fas fa-leaf"></i> Veg</span>`}
        </div>

        <div class="menu-card-body">
          <div class="menu-card-header">
            <h3 class="menu-card-title">${item.name}</h3>
          </div>
          <p class="menu-card-desc">${item.description}</p>
          
          <div class="menu-card-footer">
            <span class="menu-card-price">₹${item.price}</span>
            <div class="menu-action-wrapper" id="action-wrapper-${item.id}">
              ${qty === 0 ? `
                <button class="btn btn-primary btn-sm" onclick="handleAddToCart(${item.id})">
                  <i class="fas fa-plus"></i> Add
                </button>
              ` : `
                <div class="card-qty-controls">
                  <button class="card-qty-btn" onclick="handleDecreaseQty(${item.id})">−</button>
                  <span class="card-qty-val">${qty}</span>
                  <button class="card-qty-btn" onclick="handleIncreaseQty(${item.id})">+</button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================
// 5. CART ENGINE & INTERACTIONS
// ==========================================

function handleAddToCart(id) {
  const item = menuItems.find(m => m.id === id);
  const cartItem = cart.find(c => c.id === id);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  updateCartCountBadge();
  renderMenuGrid();
  animateCartIcon();
  
  // Refresh cart panel if visible
  if (document.getElementById("cartPanelOverlay").classList.contains("active")) {
    renderCartPanel();
  }
}

function handleIncreaseQty(id) {
  const cartItem = cart.find(c => c.id === id);
  if (cartItem) {
    cartItem.quantity++;
  }
  updateCartCountBadge();
  renderMenuGrid();
  
  if (document.getElementById("cartPanelOverlay").classList.contains("active")) {
    renderCartPanel();
  }
}

function handleDecreaseQty(id) {
  const cartIndex = cart.findIndex(c => c.id === id);
  if (cartIndex > -1) {
    if (cart[cartIndex].quantity > 1) {
      cart[cartIndex].quantity--;
    } else {
      cart.splice(cartIndex, 1);
    }
  }
  updateCartCountBadge();
  renderMenuGrid();
  
  if (document.getElementById("cartPanelOverlay").classList.contains("active")) {
    renderCartPanel();
  }
}

function updateCartCountBadge() {
  const count = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const countBadges = document.querySelectorAll(".cart-badge");
  countBadges.forEach(b => {
    b.textContent = count;
  });
}

function openCartPanel() {
  renderCartPanel();
  document.getElementById("cartPanelOverlay").classList.add("active");
}

function closeCartPanel(e) {
  if (e && e.target !== document.getElementById("cartPanelOverlay")) return;
  document.getElementById("cartPanelOverlay").classList.remove("active");
}

function renderCartPanel() {
  const wrapper = document.getElementById("cartContentWrapper");
  const totalLabel = document.getElementById("cartTotal");
  const confirmBtn = document.getElementById("finalConfirmBtn");
  
  if (cart.length === 0) {
    wrapper.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 16px; color: var(--border-color);"></i>
        <p>Your basket is looking empty today!</p>
        <button class="btn btn-secondary" onclick="closeCartPanel(); document.getElementById('menuSection').scrollIntoView();" style="margin-top: 16px;">
          View Today's Specials
        </button>
      </div>
    `;
    totalLabel.textContent = "₹0";
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<i class="fas fa-lock"></i> Basket is Empty`;
    return;
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  totalLabel.textContent = `₹${total}`;

  // UPI configuration deep link
  const upiLink = `upi://pay?pa=veeravarapumanikanta@oksbi&pn=Vinayaka%20Tiffins&am=${total}&cu=INR`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=200x200`;

  let itemsHTML = cart.map(item => `
    <div class="cart-item-row">
      <img class="cart-item-img-thumb" src="${item.image}" onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=80';" alt="">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-price-each">₹${item.price} each</div>
      </div>
      <div class="cart-item-actions">
        <div class="card-qty-controls">
          <button class="card-qty-btn" onclick="handleDecreaseQty(${item.id})">−</button>
          <span class="card-qty-val">${item.quantity}</span>
          <button class="card-qty-btn" onclick="handleIncreaseQty(${item.id})">+</button>
        </div>
      </div>
    </div>
  `).join("");

  wrapper.innerHTML = `
    <div class="cart-item-list">
      ${itemsHTML}
    </div>
    
    <div class="cart-payment-box">
      <img class="qr-code-img" src="${qrImage}" alt="Scan QR to Pay">
      <a href="${upiLink}" class="payment-link"><i class="fas fa-mobile-alt"></i> Pay directly via UPI Apps</a>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Scan the QR code or click pay link above to pay <strong>₹${total}</strong></p>
      
      <button class="btn btn-secondary" onclick="openPaymentPopup()" style="width: 100%; padding: 10px; font-size: 0.85rem;">
        <i class="fas fa-receipt"></i> Enter UPI UTR / Transaction ID
      </button>
    </div>
  `;

  // Toggle Confirm Order CTA
  if (!userData.name) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<i class="fas fa-user-plus"></i> Setup Profile to Complete`;
    confirmBtn.onclick = () => { openLoginModal(); };
  } else if (!verifiedTxn) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<i class="fas fa-qrcode"></i> Enter UTR / Ref No.`;
    confirmBtn.onclick = () => { openPaymentPopup(); };
  } else {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<i class="fas fa-check-circle"></i> Confirm order (₹${total})`;
    confirmBtn.onclick = () => { finalizeOrderCheckout(); };
  }
}

// Cart Icon Pop animation
function animateCartIcon() {
  const trigger = document.querySelector(".cart-trigger");
  if (trigger) {
    trigger.classList.add("animate-shake");
    setTimeout(() => trigger.classList.remove("animate-shake"), 400);
  }
}

// ==========================================
// 6. UPI TRANSACTION DIALOG MECHANICS
// ==========================================

function openPaymentPopup() {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  if (total === 0) return;

  const upiLink = `upi://pay?pa=veeravarapumanikanta@oksbi&pn=Vinayaka%20Tiffins&am=${total}&cu=INR`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=230x230`;

  document.getElementById("paymentPopupQR").innerHTML = `
    <img src="${qrImage}" style="border: 4px solid var(--border-color); border-radius: 8px; margin-bottom: 12px;" width="200" height="200">
    <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">Total Due: ₹${total}</div>
  `;

  document.getElementById("paymentModal").classList.add("active");
}

function closePaymentPopup() {
  document.getElementById("paymentModal").classList.remove("active");
}

function verifyTransaction() {
  const txnInput = document.getElementById("txnInput");
  const value = txnInput.value.trim();

  // Basic check for UTR length (usually 12 numeric digits in UPI or alphanumeric codes)
  if (!/^[A-Za-z0-9]{8,18}$/.test(value)) {
    showToast("Please enter a valid Transaction Ref/UTR Number (8-18 Alphanumeric digits).", "warning");
    return;
  }

  verifiedTxn = value;
  closePaymentPopup();
  renderCartPanel();
  showToast("Transaction ID recorded! Please confirm your order below.", "success");
}

// ==========================================
// 7. ORDER CHECKOUT & REAL-TIME PROGRESS
// ==========================================

async function finalizeOrderCheckout() {
  if (!userData.name) {
    showToast("Please set up your profile details first.", "warning");
    openLoginModal();
    return;
  }
  if (!verifiedTxn) {
    showToast("UPI Payment Reference is required before ordering.", "warning");
    openPaymentPopup();
    return;
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryAddress = (userData.house ? userData.house + ", " : "") + userData.address;

  const orderPayload = {
    name: userData.name,
    phone: userData.phone,
    address: deliveryAddress,
    total,
    txn: verifiedTxn,
    items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
  };

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    if (response.ok) {
      const serverOrder = await response.json();
      
      activeOrder = serverOrder;

      // Close cart panel
      closeCartPanel();

      // Launch Active Order Modal
      openActiveOrderModal();

      // Trigger Status Tracking logic (polls server updates)
      startOrderStatusSimulator(serverOrder.orderId);
      
      // Clear cart states
      cart = [];
      verifiedTxn = null;
      updateCartCountBadge();
      renderMenuGrid();
    } else {
      const err = await response.json();
      showToast("Checkout failed: " + err.error, "error");
    }
  } catch (err) {
    console.error("Error creating order:", err);
    showToast("Error connecting to backend server.", "error");
  }
}

function openActiveOrderModal() {
  if (!activeOrder) return;
  renderActiveOrderTracker();
  document.getElementById("activeOrderModal").classList.add("active");
}

function closeActiveOrderModal() {
  document.getElementById("activeOrderModal").classList.remove("active");
}

function renderActiveOrderTracker() {
  const content = document.getElementById("activeOrderContent");
  if (!content || !activeOrder) return;

  let currentStep = 1;
  if (activeOrder.status === "Preparing") currentStep = 2;
  if (activeOrder.status === "Delivering") currentStep = 3;
  if (activeOrder.status === "Completed") currentStep = 4;

  let itemsSummary = activeOrder.items.map(item => `
    <div style="display:flex; justify-content:space-between; font-size:0.9rem; padding:6px 0; border-bottom:1.5px dashed var(--border-color);">
      <span>${item.name} <strong>x${item.quantity}</strong></span>
      <span>₹${item.price * item.quantity}</span>
    </div>
  `).join("");

  content.innerHTML = `
    <div class="status-tracker-box">
      <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-primary); text-align:center;">
        Order Reference: ${activeOrder.orderId}
      </div>
      
      <!-- Tracker Steps Timeline -->
      <div class="tracker-timeline">
        <div class="tracker-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}">
          <div class="tracker-node">1</div>
          <div class="tracker-label">UTR Verify</div>
        </div>
        <div class="tracker-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}">
          <div class="tracker-node">2</div>
          <div class="tracker-label">Cooking</div>
        </div>
        <div class="tracker-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}">
          <div class="tracker-node">3</div>
          <div class="tracker-label">On Route</div>
        </div>
        <div class="tracker-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}">
          <div class="tracker-node"><i class="fas fa-check"></i></div>
          <div class="tracker-label">Arrived</div>
        </div>
      </div>
    </div>

    <div class="glass-panel" style="padding: 20px; border-radius: var(--border-radius-md); margin-bottom: 20px;">
      <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1.5px solid var(--border-color); padding-bottom: 6px;">Delivery Details</h3>
      <p style="font-size:0.85rem; margin-bottom:6px;"><strong>Deliver to:</strong> ${activeOrder.name} (${activeOrder.phone})</p>
      <p style="font-size:0.85rem; margin-bottom:12px;"><strong>Address:</strong> ${activeOrder.address}</p>
      
      <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1.5px solid var(--border-color); padding-bottom: 6px;">Order Basket</h3>
      ${itemsSummary}
      <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; margin-top:12px; color:var(--text-primary);">
        <span>Total Paid:</span>
        <span>₹${activeOrder.total}</span>
      </div>
    </div>

    <button onclick="downloadLatestPDFReceipt()" class="btn btn-success" style="width:100%;">
      <i class="fas fa-file-pdf"></i> Download PDF Receipt
    </button>
  `;
}

let orderTrackingInterval = null;

// Polls order status updates from the backend
function startOrderStatusSimulator(orderId) {
  if (orderTrackingInterval) clearInterval(orderTrackingInterval);

  orderTrackingInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const updatedOrder = await response.json();
        activeOrder = updatedOrder;
        renderActiveOrderTracker();

        // Auto-download PDF receipt when payment is verified (i.e. status goes beyond Verifying)
        if (updatedOrder.status !== "Verifying") {
          let downloadedReceipts = [];
          try {
            downloadedReceipts = JSON.parse(localStorage.getItem("vinayaka_downloaded_receipts") || "[]");
          } catch(e) { downloadedReceipts = []; }
          
          if (!downloadedReceipts.includes(orderId)) {
            generatePDFReceipt(
              updatedOrder.orderId,
              updatedOrder.name,
              updatedOrder.phone,
              updatedOrder.address,
              updatedOrder.total,
              updatedOrder.txn,
              updatedOrder.items,
              "preview"
            );
            downloadedReceipts.push(orderId);
            localStorage.setItem("vinayaka_downloaded_receipts", JSON.stringify(downloadedReceipts));
            showToast("Payment verified! PDF invoice opened.", "success");
          }
        }

        if (updatedOrder.status === "Completed") {
          clearInterval(orderTrackingInterval);
          console.log(`[Order Tracker] Order ${orderId} reached final destination.`);
        }
      }
    } catch (err) {
      console.error("Error polling order status:", err);
    }
  }, 3000);
}

// ==========================================
// 8. PROFILE REGISTRATION & CARD DRAWING
// ==========================================

function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
  initAuthFormView();
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
}

function initAuthFormView() {
  const loginSection = document.getElementById("loginFormSection");
  const registerSection = document.getElementById("registerFormSection");
  const logoutSection = document.getElementById("logoutSection");
  const loginTab = document.getElementById("loginTabBtn");
  const registerTab = document.getElementById("registerTabBtn");

  if (userData.name) {
    // User already logged in
    loginSection.style.display = "none";
    registerSection.style.display = "none";
    logoutSection.style.display = "block";
    loginTab.style.display = "none";
    registerTab.style.display = "none";
    
    // Update holographic display card
    document.getElementById("cardNameDisplay").textContent = userData.name.toUpperCase();
    document.getElementById("cardPhoneDisplay").textContent = userData.phone;
    loadUserOrderHistory();
  } else {
    // Not logged in
    logoutSection.style.display = "none";
    loginTab.style.display = "block";
    registerTab.style.display = "block";
    toggleAuthTab("login");
  }
}

function toggleAuthTab(type) {
  const loginSection = document.getElementById("loginFormSection");
  const registerSection = document.getElementById("registerFormSection");
  const loginTab = document.getElementById("loginTabBtn");
  const registerTab = document.getElementById("registerTabBtn");

  if (type === "login") {
    loginSection.style.display = "block";
    registerSection.style.display = "none";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  } else {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
  }
}

async function saveUserDetails() {
  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const password = document.getElementById("userPassword").value.trim();
  const house = document.getElementById("houseNo").value.trim();
  const address = document.getElementById("userAddress").value.trim();

  if (!name || !phone || !email || !password || !address) {
    showToast("Please fill in all details for registration.", "warning");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, house, address })
    });

    if (response.ok) {
      const registeredUser = await response.json();
      userData = registeredUser;
      localStorage.setItem("vinayaka_user", JSON.stringify(userData));
      updateProfileWidgets();
      closeLoginModal();
      initWeeklyPlannerState();
      showToast("Profile registration complete! Welcome to Vinayaka Tiffins.", "success");
    } else {
      const err = await response.json();
      showToast("Registration failed: " + err.error, "error");
    }
  } catch (err) {
    console.error("Error saving user details:", err);
    showToast("Error connecting to backend server.", "error");
  }
}

async function loginUser() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!phone || !password) {
    showToast("Please input your mobile number and password.", "warning");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });

    if (response.ok) {
      const user = await response.json();
      userData = user;
      localStorage.setItem("vinayaka_user", JSON.stringify(userData));
      updateProfileWidgets();
      closeLoginModal();
      initWeeklyPlannerState();
      showToast("Login successful!", "success");
    } else {
      const err = await response.json();
      showToast("Login failed: " + err.error, "error");
    }
  } catch (err) {
    console.error("Error logging in:", err);
    showToast("Error connecting to backend server.", "error");
  }
}

function logoutUser() {
  localStorage.removeItem("vinayaka_user");
  userData = {};

  // Reset display values
  document.getElementById("userProfileWidget").style.display = "none";
  document.getElementById("loginHeaderBtn").style.display = "block";
  document.getElementById("cardNameDisplay").textContent = "GUEST USER";
  document.getElementById("cardPhoneDisplay").textContent = "----";
  
  // Clear forms
  document.getElementById("loginPhone").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("userPhone").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("houseNo").value = "";
  
  const histList = document.getElementById("orderHistoryList");
  if (histList) {
    histList.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">No past orders found.</p>`;
  }
  
  detectLocation();
  closeLoginModal();
  renderMenuGrid();
}

function enableProfileEdit() {
  // Populate form fields
  document.getElementById("userName").value = userData.name || "";
  document.getElementById("userPhone").value = userData.phone || "";
  document.getElementById("userEmail").value = userData.email || "";
  document.getElementById("userPassword").value = userData.password || "";
  document.getElementById("houseNo").value = userData.house || "";
  document.getElementById("userAddress").value = userData.address || "";

  // Clear local storage and state variables to toggle view
  userData = {};
  initAuthFormView();
  toggleAuthTab("register");
}

function updateProfileWidgets() {
  const widget = document.getElementById("userProfileWidget");
  const loginHeaderBtn = document.getElementById("loginHeaderBtn");
  const widgetName = document.getElementById("profileWidgetName");
  const widgetPhone = document.getElementById("profileWidgetPhone");
  const avatar = document.getElementById("profileAvatar");

  if (widget && userData.name) {
    widget.style.display = "flex";
    if (loginHeaderBtn) loginHeaderBtn.style.display = "none";
    widgetName.textContent = userData.name;
    widgetPhone.textContent = userData.phone;
    avatar.textContent = userData.name.charAt(0).toUpperCase();

    // Attach click listener to profile widget to load user options
    widget.onclick = () => { openLoginModal(); };
  }
}

// ==========================================
// 9. WEEKLY PLANNER INTERACTIVE MECHANICS
// ==========================================

let weeklyPlan = {};

async function initWeeklyPlannerState() {
  if (!userData.phone) return;
  try {
    const response = await fetch(`/api/plans/${userData.phone}`);
    if (response.ok) {
      weeklyPlan = await response.json();
    }
  } catch (err) {
    console.error("Error fetching weekly plan from server:", err);
    const storedPlan = localStorage.getItem("weekly_tiffin_plan");
    if (storedPlan) {
      weeklyPlan = JSON.parse(storedPlan);
    }
  }
  
  // Pre-load breakfast based on planner schedule
  autoAddTodayFoodFromPlan();
}

function openWeeklyPlanner() {
  if (!userData.name) {
    showToast("Please log in or register a profile first to set up your weekly planner.", "warning");
    openLoginModal();
    return;
  }
  
  renderWeeklyPlannerForm();
  document.getElementById("weeklyPlannerModal").classList.add("active");
}

function closeWeeklyPlanner() {
  document.getElementById("weeklyPlannerModal").classList.remove("active");
}

function renderWeeklyPlannerForm() {
  const container = document.getElementById("weeklyPlannerContent");
  if (!container) return;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  container.innerHTML = days.map(day => {
    // Current selections for this day
    const daySelections = weeklyPlan[day] || [];

    let checkboxesHTML = menuItems.map(item => {
      const isChecked = daySelections.includes(item.id);
      return `
        <label class="weekly-checkbox-label ${isChecked ? 'selected' : ''}" id="lbl-${day}-${item.id}">
          <input type="checkbox" 
                 value="${item.id}" 
                 data-day="${day}" 
                 onchange="handleWeeklyCheckboxChange(this, '${day}', ${item.id})"
                 ${isChecked ? "checked" : ""}>
          <span>${item.name}</span>
        </label>
      `;
    }).join("");

    return `
      <div class="weekly-day-card">
        <h3 class="weekly-day-title">
          ${day} 
          <span>${daySelections.length} Scheduled</span>
        </h3>
        <div class="weekly-day-options">
          ${checkboxesHTML}
        </div>
      </div>
    `;
  }).join("");
}

function handleWeeklyCheckboxChange(checkbox, day, itemId) {
  const label = document.getElementById(`lbl-${day}-${itemId}`);
  if (checkbox.checked) {
    label.classList.add("selected");
  } else {
    label.classList.remove("selected");
  }

  // Update visual scheduled badge count
  const dayCard = checkbox.closest(".weekly-day-card");
  const badge = dayCard.querySelector(".weekly-day-title span");
  const checkedCount = dayCard.querySelectorAll('input[type="checkbox"]:checked').length;
  badge.textContent = `${checkedCount} Scheduled`;
}

async function saveWeeklyPlan() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  weeklyPlan = {};

  days.forEach(day => {
    const checkboxes = document.querySelectorAll(`input[data-day="${day}"]:checked`);
    weeklyPlan[day] = Array.from(checkboxes).map(cb => Number(cb.value));
  });

  try {
    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: userData.phone, plan: weeklyPlan })
    });
    if (response.ok) {
      localStorage.setItem("weekly_tiffin_plan", JSON.stringify(weeklyPlan));
      closeWeeklyPlanner();
      showToast("Your Weekly Breakfast Planner has been updated successfully on the server.", "success");
    } else {
      const err = await response.json();
      showToast("Error saving plan: " + err.error, "error");
    }
  } catch (err) {
    console.error("Error saving plan to server:", err);
    localStorage.setItem("weekly_tiffin_plan", JSON.stringify(weeklyPlan));
    closeWeeklyPlanner();
    showToast("Saved plan locally (offline).", "warning");
  }

  // Re-run today's plan check
  autoAddTodayFoodFromPlan();
}

function autoAddTodayFoodFromPlan() {
  if (!userData.name) return;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const plannedItemIds = weeklyPlan[today];

  if (!plannedItemIds || plannedItemIds.length === 0) return;

  // Clear existing cart to load fresh planner items
  cart = [];

  plannedItemIds.forEach(id => {
    const item = menuItems.find(m => m.id === id);
    if (item) {
      cart.push({ ...item, quantity: 1 });
    }
  });

  updateCartCountBadge();
  renderMenuGrid();
}

// ==========================================
// 10. PDF INVOICE RECEIPT GENERATION
// ==========================================

function downloadLatestPDFReceipt() {
  if (!activeOrder) return;
  generatePDFReceipt(
    activeOrder.orderId,
    activeOrder.name,
    activeOrder.phone,
    activeOrder.address,
    activeOrder.total,
    activeOrder.txn,
    activeOrder.items,
    "download"
  );
}

function generatePDFReceipt(orderId, name, phone, address, total, txn, customItems = null, action = "download") {
  if (!window.jspdf) {
    alert("Unable to generate invoice. PDF library is offline.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.width;

  // 1. Header Banner
  doc.setFillColor(255, 107, 53); // Brand Primary Color
  doc.rect(0, 0, width, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Vinayaka Tiffins", 20, 18);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Fresh • Hot • Home-Style Tiffin Delivery", 20, 26);
  doc.text("Mandapeta, Andhra Pradesh | Ph: +91 73964 44654", 20, 31);

  // 2. Receipt Label
  doc.setTextColor(30, 25, 21);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 20, 52);

  // Line Spacer
  doc.setDrawColor(255, 107, 53);
  doc.setLineWidth(0.6);
  doc.line(20, 56, width - 20, 56);

  // 3. Customer Info Box
  doc.setFillColor(253, 251, 247);
  doc.roundedRect(20, 64, width - 40, 45, 3, 3, "F");
  doc.setDrawColor(235, 225, 210);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 64, width - 40, 45, 3, 3, "S");

  doc.setFontSize(9.5);
  doc.setTextColor(92, 84, 77);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", 25, 71);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name:       ${name}`, 25, 78);
  doc.text(`Mobile:     ${phone}`, 25, 84);
  
  const addressLines = doc.splitTextToSize(`Address:    ${address}`, width - 60);
  doc.text(addressLines, 25, 90);

  // 4. Order Table Header
  let y = 120;
  doc.setFillColor(255, 107, 53);
  doc.roundedRect(20, y, width - 40, 10, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Tiffin Description", 25, y + 6.5);
  doc.text("Qty", 125, y + 6.5);
  doc.text("Rate", 145, y + 6.5);
  doc.text("Subtotal", 168, y + 6.5);

  // Order Items
  y += 10;
  doc.setTextColor(30, 25, 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);

  const itemsToPrint = customItems || cart;
  itemsToPrint.forEach(item => {
    y += 8;
    
    // Draw row separator
    doc.setDrawColor(240, 235, 225);
    doc.setLineWidth(0.2);
    doc.line(20, y + 1.5, width - 20, y + 1.5);

    doc.text(item.name, 25, y - 2);
    doc.text(String(item.quantity), 127, y - 2);
    doc.text(`Rs. ${item.price}`, 145, y - 2);
    doc.text(`Rs. ${item.price * item.quantity}`, 168, y - 2);
  });

  // 5. Total Paid Box
  y += 12;
  doc.setFillColor(16, 185, 129); // Emerald Success Color
  doc.roundedRect(120, y, width - 140, 14, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`PAID: Rs. ${total}`, 128, y + 9);

  // 6. Transaction / Validation metadata
  y += 28;
  doc.setTextColor(92, 84, 77);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DIGITAL TRANSACTION LOG:", 20, y);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Order Reference:  ${orderId}`, 20, y + 6);
  doc.text(`Transaction UTR:  ${txn}`, 20, y + 11);
  doc.text(`Created Date:     ${new Date().toLocaleDateString("en-IN")}`, 20, y + 16);
  doc.text(`Created Time:     ${new Date().toLocaleTimeString("en-IN")}`, 20, y + 21);

  // 7. Footer
  doc.setFillColor(245, 240, 230);
  doc.rect(0, 275, width, 22, "F");
  
  doc.setTextColor(255, 107, 53);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Thank You for Supporting Local Home Cooks!", width / 2, 287, { align: "center" });

  // Conditionally save or preview the PDF
  if (action === "preview") {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error("Popup preview failed, downloading instead:", e);
      doc.save(`Vinayaka_Tiffins_Bill_${orderId}.pdf`);
    }
  } else {
    doc.save(`Vinayaka_Tiffins_Bill_${orderId}.pdf`);
  }
}

// ==========================================
// 11. NAVIGATION & LAYOUT UI polish
// ==========================================

function highlightActiveSection() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("#desktopNav a");
  const scrollY = window.pageYOffset;

  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    const height = sec.offsetHeight;
    const id = sec.getAttribute("id");

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${id}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

// ==========================================
// 12. CUSTOMER FEEDBACK SUBMISSION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const name = document.getElementById("c_name").value.trim();
      const phone = document.getElementById("c_phone").value.trim();
      const message = document.getElementById("c_message").value.trim();

      if (!name || !message) {
        showToast("Please fill out your Name and Message.", "warning");
        return;
      }

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, message })
        });

        if (response.ok) {
          showToast("📩 Thank you for your feedback! Your message has been saved.", "success");
          contactForm.reset();
        } else {
          const err = await response.json();
          showToast("Failed to send message: " + err.error, "error");
        }
      } catch (err) {
        console.error("Error sending feedback message:", err);
        showToast("Connection failed! Unable to reach backend server.", "error");
      }
    });
  }
});

// ==========================================
// 13. USER ORDER HISTORY & TRACKING ENGINE
// ==========================================

async function loadUserOrderHistory() {
  const container = document.getElementById("orderHistoryList");
  if (!container || !userData.phone) return;

  try {
    const response = await fetch(`/api/orders/user/${userData.phone}`);
    if (response.ok) {
      const orders = await response.json();
      renderOrderHistoryList(orders);
    } else {
      container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">Failed to load order history.</p>`;
    }
  } catch (err) {
    console.error("Error loading user order history:", err);
    container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">Error reaching backend.</p>`;
  }
}

function renderOrderHistoryList(orders) {
  const container = document.getElementById("orderHistoryList");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 20px 0;">You haven't placed any orders yet!</p>`;
    return;
  }

  container.innerHTML = orders.map(order => {
    const dateObj = new Date(order.createdAt);
    const formattedDate = dateObj.toLocaleDateString("en-IN") + " " + dateObj.toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit'});
    
    const itemsText = order.items.map(item => `${item.name} x${item.quantity}`).join(", ");
    
    // Inline badge styles using standard theme palettes
    let badgeStyle = "background-color: rgba(168, 154, 143, 0.15); color: var(--text-secondary);";
    if (order.status === "Preparing") badgeStyle = "background-color: rgba(245, 158, 11, 0.15); color: var(--color-secondary);";
    if (order.status === "Delivering") badgeStyle = "background-color: rgba(59, 130, 246, 0.15); color: #3b82f6;";
    if (order.status === "Completed") badgeStyle = "background-color: rgba(16, 185, 129, 0.15); color: #10b981;";

    return `
      <div class="glass-panel" style="padding: 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-color); background: rgba(36, 30, 26, 0.3); margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${order.orderId}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${formattedDate}</div>
          </div>
          <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; ${badgeStyle}">
            ${order.status}
          </span>
        </div>
        
        <div style="font-size: 0.85rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
          ${itemsText}
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">₹${order.total}</div>
          <div style="display: flex; gap: 8px;">
            <button onclick="trackSpecificOrder('${order.orderId}')" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px; box-shadow: none;">
              <i class="fas fa-search-location"></i> Track
            </button>
            <button onclick="downloadSpecificPDFReceipt('${order.orderId}')" class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; background-color: transparent; border: 1px solid var(--border-color); color: var(--text-primary); box-shadow: none;" title="Download PDF Receipt">
              <i class="fas fa-file-pdf"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function trackSpecificOrder(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) {
      const order = await response.json();
      activeOrder = order;
      
      // Close the login/profile modal first so they can see the tracker modal clearly
      closeLoginModal();
      
      openActiveOrderModal();
      startOrderStatusSimulator(orderId);
    } else {
      showToast("Unable to fetch order tracking details.", "error");
    }
  } catch (err) {
    console.error("Error tracking order:", err);
    showToast("Connection failed.", "error");
  }
}

async function downloadSpecificPDFReceipt(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) {
      const order = await response.json();
      generatePDFReceipt(
        order.orderId,
        order.name,
        order.phone,
        order.address,
        order.total,
        order.txn,
        order.items,
        "download"
      );
    } else {
      showToast("Unable to fetch receipt details.", "error");
    }
  } catch (err) {
    console.error("Error displaying specific receipt:", err);
    showToast("Connection failed.", "error");
  }
}

// ==========================================
// 14. TOAST NOTIFICATION UTILITY
// ==========================================

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.style.pointerEvents = "auto";
  toast.style.background = "rgba(36, 30, 26, 0.95)";
  toast.style.border = "1px solid var(--border-color, #3b312a)";
  toast.style.color = "var(--text-primary, #fdfbf7)";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "12px";
  toast.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
  toast.style.fontFamily = "'Outfit', sans-serif";
  toast.style.fontSize = "0.9rem";
  toast.style.fontWeight = "600";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  toast.style.minWidth = "280px";
  toast.style.maxWidth = "350px";
  toast.style.animation = "toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards";
  
  let icon = "fa-info-circle";
  let color = "#ff6b35";
  if (type === "success") {
    icon = "fa-check-circle";
    color = "#10b981";
  } else if (type === "error") {
    icon = "fa-exclamation-circle";
    color = "#ef4444";
  } else if (type === "warning") {
    icon = "fa-exclamation-triangle";
    color = "#f59e0b";
  }

  toast.innerHTML = `
    <i class="fas ${icon}" style="color: ${color}; font-size: 1.1rem; flex-shrink: 0;"></i>
    <span style="flex-grow: 1;">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = "toastFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

