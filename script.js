const WHATSAPP_NUMBER = "201000000000";
const cart = new Map();
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = value => `${value.toLocaleString("en-US")} EGP`;

$("#menuButton").addEventListener("click", () => {
  const opened = $("#navLinks").classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", String(opened));
  $("#menuButton").textContent = opened ? "×" : "☰";
});
$$(".nav-links a").forEach(a => a.addEventListener("click", () => {
  $("#navLinks").classList.remove("open");
  $("#menuButton").setAttribute("aria-expanded", "false");
  $("#menuButton").textContent = "☰";
}));

function setFilter(category) {
  $$(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === category));
  $$(".product").forEach(card => card.hidden = category !== "all" && card.dataset.category !== category);
}
$$(".filter").forEach(btn => btn.addEventListener("click", () => setFilter(btn.dataset.filter)));

function addProduct(card) {
  const id = card.dataset.id;
  if (cart.has(id)) cart.get(id).qty++;
  else cart.set(id, {id, name:card.dataset.name, price:Number(card.dataset.price), image:card.dataset.image, qty:1});
  renderCart();
  showToast("اتضاف المنتج للسلة");
}
$$(".add-to-cart").forEach(btn => btn.addEventListener("click", () => addProduct(btn.closest(".product"))));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderCart() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartTitleCount").textContent = `(${count})`;
  $("#cartSubtotal").textContent = money(total);
  if (!items.length) {
    $("#cartItems").innerHTML = '<p class="empty-cart">لسه ما أضفتش أي منتجات.</p>';
    return;
  }
  $("#cartItems").innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="">
      <div><h3>${escapeHtml(item.name)}</h3><p>${money(item.price)}</p>
        <div class="qty-controls"><button data-qty="-1" data-id="${item.id}" aria-label="تقليل الكمية">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="زيادة الكمية">+</button></div>
        <button class="remove" data-remove="${item.id}">حذف</button>
      </div><strong>${money(item.price * item.qty)}</strong>
    </div>`).join("");
  $$("[data-qty]", $("#cartItems")).forEach(btn => btn.addEventListener("click", () => {
    const item = cart.get(btn.dataset.id);
    if (!item) return;
    item.qty += Number(btn.dataset.qty);
    if (item.qty <= 0) cart.delete(item.id);
    renderCart();
  }));
  $$("[data-remove]", $("#cartItems")).forEach(btn => btn.addEventListener("click", () => {
    cart.delete(btn.dataset.remove);
    renderCart();
  }));
}
function openCart() {
  $("#scrim").classList.add("open");
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  $("#closeCart").focus();
}
function closeCart() {
  $("#scrim").classList.remove("open");
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
}
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#scrim").addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.size) return showToast("أضف منتجًا للسلة أولًا");
  if (WHATSAPP_NUMBER === "201000000000") return showToast("غيّر رقم واتساب المتجر داخل script.js أولًا");
  const items = [...cart.values()];
  const lines = items.map(item => `• ${item.name} × ${item.qty} = ${money(item.price * item.qty)}`);
  const total = items.reduce((sum,item) => sum + item.price * item.qty, 0);
  const message = `مرحبًا ATHAR، أريد تأكيد الطلب:\n${lines.join("\n")}\nالإجمالي: ${money(total)}\n\nالاسم:\nالعنوان:\nالمقاس/اللون:`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}
$("#newsletterForm").addEventListener("submit", e => {
  e.preventDefault();
  showToast("النموذج تجريبي حاليًا — اربطه بخدمة بريد قبل النشر.");
  e.target.reset();
});
$("#contactLink").addEventListener("click", e => {
  e.preventDefault();
  showToast("أضف رابط التواصل أو رقم واتساب الخاص بالمتجر.");
});
renderCart();