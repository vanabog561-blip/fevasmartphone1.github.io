setupHeader();
let user = null;
const savedGrid = document.querySelector('#savedGrid');
const savedEmpty = document.querySelector('#savedEmpty');
const ordersList = document.querySelector('#ordersList');
const ordersEmpty = document.querySelector('#ordersEmpty');
const historyList = document.querySelector('#historyList');
const historyEmpty = document.querySelector('#historyEmpty');

function money(v) {
  return Number(v || 0).toLocaleString('ru-RU') + ' ₸';
}

function escape(value = '') {
  return escapeHtml(value);
}

function renderOrders(docs) {
  const orders = docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(x => Array.isArray(x.items))
    .sort((a, b) => {
      const ad = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bd = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return bd - ad;
    });

  ordersEmpty.classList.toggle('hidden', orders.length > 0);

  ordersList.innerHTML = orders.map((order, index) => {
    const items = order.items || [];
    const date = formatDate(order.createdAt);
    return `
      <article class="order-card">
        <div class="order-head">
          <div>
            <span class="tag">Заказ №${String(index + 1).padStart(3, '0')}</span>
            <h3>Покупка телефона</h3>
            <p class="muted">${date}</p>
          </div>
          <strong class="order-total">${money(order.total)}</strong>
        </div>
        <div class="order-products">
          ${items.map(item => `
            <div class="order-product">
              <div>
                <b>${escape(item.title)}</b>
                <span>${Number(item.qty || 1)} шт. × ${money(item.price)}</span>
              </div>
              <strong>${money(Number(item.price || 0) * Number(item.qty || 1))}</strong>
            </div>
          `).join('')}
        </div>
        <div class="order-foot">
          <span class="status status-success">Заказ оформлен</span>
          <span>${items.length} ${items.length === 1 ? 'позиция' : 'позиций'}</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderHistory(docs) {
  const items = docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
    const ad = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bd = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bd - ad;
  });

  historyEmpty.classList.toggle('hidden', items.length > 0);
  historyList.innerHTML = items.map(x => `
    <div class="history-item">
      <div>
        <b>${escape(x.action || 'Действие')}</b>
        ${x.total ? `<span class="muted">Сумма: ${money(x.total)}</span>` : ''}
      </div>
      <span class="muted">${formatDate(x.createdAt)}</span>
    </div>
  `).join('');
}

auth.onAuthStateChanged(async current => {
  user = current;
  if (!user) {
    location.href = 'auth.html';
    return;
  }

  try {
    const snap = await db.collection('users').doc(user.uid).get();
    const profile = snap.exists ? snap.data() : {};
    document.querySelector('#welcome').textContent = `Привет, ${profile.name || user.email}`;
    document.querySelector('#profileName').value = profile.name || user.displayName || '';
    document.querySelector('#profileEmail').value = user.email || '';
  } catch (e) {
    console.error('profile:', e);
  }

  db.collection('users').doc(user.uid).collection('saved')
    .orderBy('savedAt', 'desc')
    .onSnapshot(async savedSnap => {
      const ids = savedSnap.docs.map(d => d.id);
      const products = [];
      for (const id of ids) {
        const r = await db.collection('products').doc(id).get();
        if (r.exists) products.push({ id, ...r.data() });
      }
      document.querySelector('#savedCount').textContent = products.length;
      savedEmpty.classList.toggle('hidden', products.length > 0);
      savedGrid.innerHTML = products.map(p => `
        <article class="recipe-card">
          <a href="detail.html?id=${p.id}">
            <img class="recipe-img" src="${imageFallback(escape(p.image))}" alt="">
            <div class="recipe-body">
              <span class="tag">${escape(p.brand)}</span>
              <h3>${escape(p.title)}</h3>
              <p>${escape(p.description)}</p>
              <div class="meta"><span>${money(p.price)}</span><span>★ ${(p.rating || 0).toFixed(1)}</span></div>
            </div>
          </a>
        </article>
      `).join('');
    }, e => console.error('saved:', e));

  // Без orderBy: так история работает без обязательного составного индекса Firestore.
  db.collection('history')
    .where('userId', '==', user.uid)
    .onSnapshot(snapshot => {
      renderOrders(snapshot.docs);
      renderHistory(snapshot.docs);
    }, e => {
      console.error('history:', e);
      ordersEmpty.classList.remove('hidden');
      historyEmpty.classList.remove('hidden');
    });
});

document.querySelector('#profileForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!user) return;
  const name = document.querySelector('#profileName').value.trim();
  const msg = document.querySelector('#profileMsg');
  try {
    await user.updateProfile({ displayName: name });
    await db.collection('users').doc(user.uid).update({ name });
    document.querySelector('#welcome').textContent = `Привет, ${name || user.email}`;
    msg.textContent = 'Профиль обновлён.';
  } catch (e) {
    msg.textContent = e.message;
  }
});
