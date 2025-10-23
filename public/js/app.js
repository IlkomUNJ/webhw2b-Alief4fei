// public/js/app.js
(() => {
  // ========================== 🔹 DEFAULT DATA ==========================
  const defaultProducts = [
    {
      id: 'angel',
      name: 'The Angel Sneaker',
      price: 750000,
      img: '/images/angel_sneakers.jpeg',
      rating: 4.5,
      desc: 'Sepatu Angel Sneaker dirancang untuk kenyamanan maksimal dan tampilan elegan.'
    },
    {
      id: 'devil',
      name: 'The Devil Boot',
      price: 900000,
      img: '/images/devil_boots.jpeg',
      rating: 5,
      desc: 'Boot kokoh dan gagah untuk jiwa pemberani.'
    },
    {
      id: 'heaven-loafer',
      name: 'The Heaven Loafer',
      price: 825000,
      img: '/images/loafers_hitam.jpeg',
      rating: 4.8,
      desc: 'Elegan dan nyaman, cocok untuk gaya formal atau santai.'
    },
    {
      id: 'inferno-hiker',
      name: 'The Inferno Hiker',
      price: 925000,
      img: '/images/inferno_hiker.png',
      rating: 4.8,
      desc: 'Cocok untuk petualangan di alam bebas dengan desain tangguh dan nyaman.'
    }
  ];

  // ========================== 🔹 STORAGE HELPERS ==========================
  const safeParse = (key, fallback) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  };

  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const getProducts = () => {
    const prods = safeParse('products', defaultProducts);
    if (!prods.length) save('products', defaultProducts);
    return prods;
  };
  const saveProducts = arr => save('products', arr);

  const getCart = () => safeParse('cart', []);
  const saveCart = arr => save('cart', arr);

  const getWishlist = () => safeParse('wishlist', []);
  const saveWishlist = arr => save('wishlist', arr);

  const getTx = () => safeParse('transactions', []);
  const saveTx = arr => save('transactions', arr);

  const money = v => 'Rp ' + Number(v).toLocaleString('id-ID');

  // ========================== 🔹 RENDER PRODUCTS ==========================
  function renderProductsGrid() {
    const el = document.getElementById('products-grid');
    if (!el) return;

    const products = getProducts();
    const wishlist = getWishlist();

    const isHome = window.location.pathname === '/home' || window.location.pathname === '/';
    const list = isHome ? products.slice(0, 3) : products;

    el.innerHTML = '';
    list.forEach((p) => {
      const isWish = wishlist.some(w => w.id === p.id);

      const card = document.createElement('div');
      card.className =
        'bg-white p-6 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2 flex flex-col justify-between h-full';

      card.innerHTML = `
        <div>
          <img src="${p.img}" alt="${p.name}" class="w-full h-56 object-contain mb-4">
          <h3 class="text-lg font-semibold">${p.name}</h3>
          <div class="text-yellow-400 text-sm mt-1">${'★'.repeat(Math.round(p.rating))}</div>
          <p class="text-secondary mt-2 min-h-[60px] line-clamp-3">${p.desc?.slice(0, 80) || ''}</p>
        </div>

        <div class="mt-4 flex items-center justify-between border-t pt-3">
          <span class="font-semibold text-gray-800">${money(p.price)}</span>
          <div class="flex gap-2">
            <button 
              data-id="${p.id}" 
              class="add-wishlist flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full hover:bg-red-50 transition"
              title="Tambah ke wishlist"
            >
              <span class="heart-icon text-lg leading-none align-middle transition-all duration-200">${isWish ? '❤️' : '🤍'}</span>
            </button>
            <button data-id="${p.id}" class="add-to-cart px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
              Add to cart
            </button>
            <a href="/product?product=${p.id}" class="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
              Detail
            </a>
          </div>
        </div>
      `;
      el.appendChild(card);
    });
  }

  // ========================== 🔹 PRODUCT DETAIL ==========================
  function renderProductDetail() {
    const wrapImg = document.getElementById('product-image');
    const wrapInfo = document.getElementById('product-info');
    if (!wrapImg || !wrapInfo) return;
    const pid = new URLSearchParams(window.location.search).get('product');
    const p = getProducts().find(x => x.id === pid);
    if (!p) {
      wrapImg.innerHTML = '<div>Produk tidak ditemukan</div>';
      wrapInfo.innerHTML = '';
      return;
    }
    wrapImg.innerHTML = `<img src="${p.img}" alt="${p.name}" class="w-full rounded-xl shadow">`;
    wrapInfo.innerHTML = `
      <h1 class="text-3xl font-bold mb-2">${p.name}</h1>
      <p class="text-2xl font-semibold mb-3">${money(p.price)}</p>
      <div class="text-yellow-400 mb-3">${'★'.repeat(Math.round(p.rating))}</div>
      <p class="text-gray-600 mb-6">${p.desc}</p>
      <div class="flex gap-3">
        <button id="add-to-cart-btn" class="px-6 py-2 rounded-full bg-red-600 text-white font-medium shadow hover:bg-red-700 transform hover:scale-105 transition-all duration-300">
          Add to Cart
        </button>
        <button id="add-wish-btn" class="px-6 py-2 rounded-full border border-red-600 text-red-600 font-medium hover:bg-red-50 transform hover:scale-105 transition-all duration-300">
          Wishlist
        </button>
      </div>
    `;

    document.getElementById('add-to-cart-btn').onclick = () => addToCart(p.id);
    document.getElementById('add-wish-btn').onclick = () => {
      const wl = getWishlist();
      if (!wl.find(i => i.id === p.id)) {
        wl.push({ id: p.id, name: p.name, img: p.img });
        saveWishlist(wl);
        alert('Ditambahkan ke wishlist!');
      } else alert('Sudah ada di wishlist.');
    };
  }

  // ========================== 🔹 WISHLIST PAGE ==========================
  function renderWishlistPage() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    const wishlist = getWishlist();
    container.innerHTML = '';

    if (wishlist.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500 col-span-full">Wishlist kamu kosong 😢</div>';
      return;
    }

    wishlist.forEach((item) => {
      const card = document.createElement('div');
      card.className =
        'bg-white rounded-xl shadow hover:shadow-lg p-5 transition-transform transform hover:-translate-y-2 flex flex-col items-center text-center';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="w-40 h-40 object-contain mb-4">
        <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
        <div class="flex justify-center gap-2 mt-4">
          <a href="/product?product=${item.id}" class="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition">View</a>
          <button data-id="${item.id}" class="remove-wishlist px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition">Remove</button>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.remove-wishlist').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        let wl = getWishlist();
        wl = wl.filter((x) => x.id !== id);
        saveWishlist(wl);
        renderWishlistPage();
      })
    );
  }

  // ========================== 🔹 CART ==========================
  function addToCart(id) {
    const prod = getProducts().find(p => p.id === id);
    if (!prod) return alert('Produk tidak ditemukan');
    const cart = getCart();
    const found = cart.find(c => c.id === id);
    if (found) found.qty++;
    else cart.push({ ...prod, qty: 1 });
    saveCart(cart);
    alert('Produk ditambahkan ke keranjang!');
    renderCartPage();
  }

  function renderCartPage() {
    const list = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    if (!list || !summary) return;
    const cart = getCart();
    list.innerHTML = '';
    if (!cart.length) {
      list.innerHTML = '<p class="p-6 bg-white rounded shadow">Keranjang kosong.</p>';
      summary.innerHTML = '';
      return;
    }

    cart.forEach(i => {
      const div = document.createElement('div');
      div.className = 'flex gap-4 items-center bg-white p-4 mb-3 rounded shadow';
      div.innerHTML = `
        <img src="${i.img}" class="w-20 h-20 rounded">
        <div class="flex-1">
          <h3 class="font-semibold">${i.name}</h3>
          <p>${money(i.price)}</p>
          <div class="mt-2 flex gap-2">
            <button data-id="${i.id}" class="decrease border px-2">-</button>
            <input type="number" data-id="${i.id}" value="${i.qty}" class="w-16 border rounded text-center">
            <button data-id="${i.id}" class="increase border px-2">+</button>
          </div>
        </div>
        <button data-id="${i.id}" class="remove-item text-red-600 font-semibold">Hapus</button>
      `;
      list.appendChild(div);
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    summary.innerHTML = `
      <div class="bg-white p-5 rounded shadow">
        <p class="text-lg font-semibold mb-3">Ringkasan</p>
        <div class="flex justify-between"><span>Total</span><span>${money(total)}</span></div>
        <button id="checkout-btn" class="w-full bg-red-600 text-white rounded-full py-2 mt-4 hover:bg-red-700 transition">Checkout</button>
        <button id="clear-cart" class="w-full bg-gray-100 text-gray-700 rounded-full py-2 mt-2 hover:bg-gray-200 transition">Kosongkan Cart</button>
      </div>
    `;

    summary.querySelector('#checkout-btn').onclick = () => checkout();
    summary.querySelector('#clear-cart').onclick = () => { saveCart([]); renderCartPage(); };

    list.querySelectorAll('.remove-item').forEach(b => b.onclick = e => {
      const id = e.target.dataset.id;
      saveCart(cart.filter(c => c.id !== id));
      renderCartPage();
    });
    list.querySelectorAll('.increase').forEach(b => b.onclick = e => {
      const id = e.target.dataset.id;
      const item = cart.find(c => c.id === id);
      item.qty++;
      saveCart(cart);
      renderCartPage();
    });
    list.querySelectorAll('.decrease').forEach(b => b.onclick = e => {
      const id = e.target.dataset.id;
      const item = cart.find(c => c.id === id);
      item.qty = Math.max(1, item.qty - 1);
      saveCart(cart);
      renderCartPage();
    });
  }

  function checkout() {
    const cart = getCart();
    if (!cart.length) return alert('Keranjang kosong!');
    const txs = getTx();
    const tx = { id: 'TX' + Date.now(), date: new Date().toISOString(), items: cart, total: cart.reduce((s, i) => s + i.price * i.qty, 0) };
    txs.push(tx);
    saveTx(txs);
    saveCart([]);
    window.location.href = '/success';
  }

  // ========================== 🔹 SEARCH FEATURE ==========================
function doSearch(query) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const products = getProducts();
  const filtered =
    query.trim() === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="text-center text-gray-500 col-span-full">Produk tidak ditemukan 😢</p>`;
    return;
  }

  filtered.forEach((p) => {
    const wishlist = getWishlist();
    const isWish = wishlist.some((w) => w.id === p.id);

    const card = document.createElement("div");
    card.className =
      "bg-white p-6 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2 flex flex-col";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="w-full h-56 object-contain mb-4">
      <h3 class="text-lg font-semibold">${p.name}</h3>
      <div class="text-yellow-400 text-sm mt-1">${"★".repeat(Math.round(p.rating))}</div>
      <p class="text-secondary mt-2 flex-grow">${p.desc?.slice(0, 80) || ""}</p>
      <div class="mt-auto flex items-center justify-between pt-4">
        <span class="font-semibold text-gray-800">${money(p.price)}</span>
        <div class="flex gap-2">
          <button 
            data-id="${p.id}" 
            class="add-wishlist flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full hover:bg-red-50 transition"
            title="Tambah ke wishlist"
          >
            <span class="heart-icon text-lg leading-none align-middle transition-all duration-200">${isWish ? "❤️" : "🤍"}</span>
          </button>
          <button data-id="${p.id}" class="add-to-cart px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
            Add to cart
          </button>
          <a href="/product?product=${p.id}" class="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
            Detail
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ========================== 🔹 SEARCH FEATURE (AUTO REDIRECT + FILTER) ==========================
function doSearch(query) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const products = getProducts();
  const filtered =
    query.trim() === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="text-center text-gray-500 col-span-full">Produk tidak ditemukan 😢</p>`;
    return;
  }

  filtered.forEach((p) => {
    const wishlist = getWishlist();
    const isWish = wishlist.some((w) => w.id === p.id);

    const card = document.createElement("div");
    card.className =
      "bg-white p-6 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2 flex flex-col";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="w-full h-56 object-contain mb-4">
      <h3 class="text-lg font-semibold">${p.name}</h3>
      <div class="text-yellow-400 text-sm mt-1">${"★".repeat(Math.round(p.rating))}</div>
      <p class="text-secondary mt-2 flex-grow">${p.desc?.slice(0, 80) || ""}</p>
      <div class="mt-auto flex items-center justify-between pt-4">
        <span class="font-semibold text-gray-800">${money(p.price)}</span>
        <div class="flex gap-2">
          <button 
            data-id="${p.id}" 
            class="add-wishlist flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full hover:bg-red-50 transition"
            title="Tambah ke wishlist"
          >
            <span class="heart-icon text-lg leading-none align-middle transition-all duration-200">${isWish ? "❤️" : "🤍"}</span>
          </button>
          <button data-id="${p.id}" class="add-to-cart px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
            Add to cart
          </button>
          <a href="/product?product=${p.id}" class="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
            Detail
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ========================== 🔹 SEARCH FEATURE (ENTER + AUTO FILTER DI SHOP + ANIMASI) ==========================
function doSearch(query) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const products = getProducts();
  const filtered =
    query.trim() === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `
      <p class="text-center text-gray-500 col-span-full opacity-0 animate-fadeIn">
        Produk tidak ditemukan 😢
      </p>`;
    return;
  }

  const wishlist = getWishlist();
  filtered.forEach((p, i) => {
    const isWish = wishlist.some((w) => w.id === p.id);

    const card = document.createElement("div");
    card.className =
      "bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col opacity-0 animate-fadeIn delay-" +
      i * 100;
    card.style.animationDelay = `${i * 100}ms`;
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="w-full h-56 object-contain mb-4 rounded">
      <h3 class="text-lg font-semibold">${p.name}</h3>
      <div class="text-yellow-400 text-sm mt-1">${"★".repeat(Math.round(p.rating))}</div>
      <p class="text-gray-600 mt-2 flex-grow">${p.desc?.slice(0, 80) || ""}</p>
      <div class="mt-auto flex items-center justify-between pt-4">
        <span class="font-semibold text-gray-800">${money(p.price)}</span>
        <div class="flex gap-2">
          <button 
            data-id="${p.id}" 
            class="add-wishlist flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full hover:bg-red-50 transition"
            title="Tambah ke wishlist"
          >
            <span class="heart-icon text-lg leading-none align-middle transition-all duration-200">${isWish ? "❤️" : "🤍"}</span>
          </button>
          <button data-id="${p.id}" class="add-to-cart px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
            Add to cart
          </button>
          <a href="/product?product=${p.id}" class="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
            Detail
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ========================== 🔹 SEARCH HANDLER ==========================
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("global-search");
  const searchBtn = document.getElementById("search-btn");

  if (searchInput && searchBtn) {
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;

      // Kalau bukan di /shop, redirect ke shop dengan query
      if (window.location.pathname !== "/shop") {
        window.location.href = "/shop?q=" + encodeURIComponent(query);
      } else {
        // Kalau udah di /shop langsung filter
        doSearch(query);
      }
    };

    // klik tombol Search
    searchBtn.addEventListener("click", handleSearch);

    // tekan Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
  }

  // Kalau udah di /shop dan URL ada query → langsung tampil hasil
  if (window.location.pathname === "/shop") {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      const input = document.getElementById("global-search");
      if (input) input.value = q;
      doSearch(q);
    } else {
      renderProductsGrid();
    }
  }
});

// ========================== 🔹 ANIMASI (Tailwind Utility) ==========================
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease forwards;
}
`;
document.head.appendChild(style);




  // ========================== 🔹 SELLER ==========================
  function renderSellerProducts() {
    const el = document.getElementById('seller-products-list');
    if (!el) return;

    const products = getProducts();
    if (!products.length) {
      el.innerHTML = `
        <div class="text-center text-gray-500 py-8 bg-white rounded-xl shadow">
          Belum ada produk yang ditambahkan.
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        ${products.map(p => `
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col">
            <div class="relative w-full h-48 flex justify-center items-center mb-4">
              <img src="${p.img}" alt="${p.name}" class="h-full object-contain rounded-lg">
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">${p.name}</h3>
            <p class="text-red-600 font-medium mb-4">${money(p.price)}</p>
            <div class="mt-auto flex justify-between items-center">
              <span class="text-yellow-400 text-sm">★ ${p.rating || 4.5}</span>
              <button data-id="${p.id}" 
                class="text-sm text-red-600 hover:text-red-800 font-medium transition">
                Hapus
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = e => {
        const id = e.target.dataset.id;
        const updated = products.filter(p => p.id !== id);
        saveProducts(updated);
        renderSellerProducts();
      };
    });
  }


  function handleAddProductForm() {
    const form = document.getElementById('add-product-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('#p-name').value.trim();
      const price = +form.querySelector('#p-price').value.trim();
      const slug = form.querySelector('#p-slug').value.trim();
      const img = '/images/' + form.querySelector('#p-image').value.trim();
      const desc = form.querySelector('#p-desc').value.trim();

      if (!name || !price || !slug) {
        alert('Lengkapi semua field');
        return;
      }

      const all = getProducts();
      if (all.find(p => p.id === slug)) {
        alert('Slug sudah dipakai.');
        return;
      }

      all.push({ id: slug, name, price, img, desc, rating: 4.5 });
      saveProducts(all);
      alert('Produk ditambahkan!');
      form.reset();
      renderSellerProducts();
    });
  }

  function renderAllWishlist() {
    const el = document.getElementById('wishlist-list');
    if (!el) return;
    const wl = getWishlist();
    if (!wl.length) {
      el.innerHTML = '<p class="text-center text-gray-500">Belum ada wishlist dari customer.</p>';
      return;
    }
    el.innerHTML = wl.map(i => `
      <div class="flex items-center gap-4 bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <img src="${i.img}" alt="${i.name}" class="w-16 h-16 object-contain rounded">
        <div>
          <h3 class="font-semibold">${i.name}</h3>
          <p class="text-sm text-gray-500">ID: ${i.id}</p>
        </div>
      </div>
    `).join('');
  }

  function initSellerDashboard() {
    const tabs = {
      products: document.getElementById('seller-products-section'),
      wishlist: document.getElementById('wishlist-section'),
      add: document.getElementById('add-product-section'),
    };
    const buttons = {
      products: document.getElementById('tab-products'),
      wishlist: document.getElementById('tab-wishlist'),
      add: document.getElementById('tab-add'),
    };

    function switchTab(active) {
      Object.keys(tabs).forEach((key) => {
        if (!tabs[key] || !buttons[key]) return;
        tabs[key].classList.toggle("hidden", key !== active);
        buttons[key].classList.toggle("bg-red-600", key === active);
        buttons[key].classList.toggle("text-white", key === active);
        buttons[key].classList.toggle("bg-white", key !== active);
        buttons[key].classList.toggle("text-red-600", key !== active);
      });

      if (active === "wishlist") renderAllWishlist();
      if (active === "products") renderSellerProducts();
    }

    if (buttons.products) buttons.products.addEventListener("click", () => switchTab("products"));
    if (buttons.wishlist) buttons.wishlist.addEventListener("click", () => switchTab("wishlist"));
    if (buttons.add) buttons.add.addEventListener("click", () => switchTab("add"));

    renderSellerProducts();
    handleAddProductForm();
  }

  // ========================== 🔹 INIT ==========================
  document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('global-search');
    if (searchBtn && searchInput) {
      searchBtn.onclick = () => {
        const q = searchInput.value.trim();
        if (window.location.pathname !== '/shop') window.location.href = '/shop?q=' + encodeURIComponent(q);
        else doSearch(q);
      };
      searchInput.onkeypress = e => { if (e.key === 'Enter') searchBtn.click(); };
    }

    if (document.getElementById('products-grid')) renderProductsGrid();
    if (document.getElementById('product-info')) renderProductDetail();
    if (document.getElementById('wishlist-items')) renderWishlistPage();
    if (document.getElementById('cart-items')) renderCartPage();
    if (document.getElementById('seller-dashboard')) initSellerDashboard();
  });

  // ========================== 🔹 GLOBAL CLICK HANDLERS ==========================
  document.addEventListener('click', (e) => {
    const addCartBtn = e.target.closest('.add-to-cart');
    const addWishBtn = e.target.closest('.add-wishlist');

    if (addCartBtn) {
      const id = addCartBtn.dataset.id;
      const product = getProducts().find(p => p.id === id);
      if (product) {
        const cart = getCart();
        const existing = cart.find(c => c.id === id);
        if (existing) existing.qty++;
        else cart.push({ ...product, qty: 1 });
        saveCart(cart);
        alert('Produk ditambahkan ke keranjang!');
      }
    }

    if (addWishBtn) {
      const id = addWishBtn.dataset.id;
      const p = getProducts().find(x => x.id === id);
      const wl = getWishlist();
      const already = wl.find(x => x.id === id);

      if (!already) {
        wl.push({ id, name: p.name, img: p.img });
        saveWishlist(wl);
      } else {
        saveWishlist(wl.filter(x => x.id !== id));
      }

      renderProductsGrid();
    }

    // Seller Logout
    const logoutBtn = document.getElementById('seller-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('sellerLoggedIn');
        window.location.href = '/';
      });
    }

  });
})();
