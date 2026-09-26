function setupHeader() {
  const authLink = document.querySelector("#authLink");
  const logoutBtn = document.querySelector("#logoutBtn");
  const userName = document.querySelector("#userName");
  const adminLink = document.querySelector("#adminLink");

  auth.onAuthStateChanged(async user => {
    if (!user) {
      authLink?.classList.remove("hidden");
      logoutBtn?.classList.add("hidden");
      if (userName) userName.textContent = "";
      return;
    }
    authLink?.classList.add("hidden");
    logoutBtn?.classList.remove("hidden");
    try {
      const snap = await db.collection("users").doc(user.uid).get();
      const data = snap.exists ? snap.data() : {};
      if (userName) userName.textContent = data.name || user.email;
      if (data.role === "admin") adminLink?.classList.remove("hidden");
    } catch (e) {
      if (userName) userName.textContent = user.email;
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    await auth.signOut();
    location.href = "index.html";
  });
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function formatDate(value) {
  if (!value) return "—";
  const d = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {day:"2-digit", month:"2-digit", year:"numeric"}).format(d);
}

function imageFallback(url) {
  return url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80";
}


// ===== Корзина =====
function getCart() {
  try { return JSON.parse(localStorage.getItem('feraPhoneCart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('feraPhoneCart', JSON.stringify(cart));
  updateCartCount();
}
function cartCount() { return getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0); }
function updateCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cartCount());
}
function addToCart(product, qty=1) {
  const cart = getCart();
  const found = cart.find(x => x.id === product.id);
  if (found) found.qty += qty;
  else cart.push({
    id: product.id, title: product.title, price: Number(product.price || 0),
    image: product.image || '', brand: product.brand || '', qty
  });
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(x => x.id !== id)); }
function changeCartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(id);
  saveCart(cart);
}
function clearCart() { saveCart([]); }
function cartTotal() { return getCart().reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 1), 0); }
function moneyCart(v) { return Number(v || 0).toLocaleString('ru-RU') + ' ₸'; }
updateCartCount();
