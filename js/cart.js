setupHeader();
const content=document.querySelector('#cartContent');
const clearBtn=document.querySelector('#clearCart');
function renderCart(){
 const cart=getCart();
 clearBtn.classList.toggle('hidden',cart.length===0);
 if(!cart.length){content.innerHTML='<div class="empty"><div>🛒</div><h3>Корзина пуста</h3><p>Добавь смартфоны из каталога.</p><a class="btn btn-primary" href="index.html">Перейти в каталог</a></div>';return;}
 content.innerHTML=`<div class="cart-layout"><div class="cart-items">${cart.map(item=>`<article class="cart-item"><img src="${imageFallback(escapeHtml(item.image))}" alt="${escapeHtml(item.title)}"><div class="cart-info"><span class="tag">${escapeHtml(item.brand)}</span><h3>${escapeHtml(item.title)}</h3><b>${moneyCart(item.price)}</b><div class="qty"><button data-action="minus" data-id="${item.id}">−</button><strong>${item.qty}</strong><button data-action="plus" data-id="${item.id}">+</button><button class="remove-cart" data-action="remove" data-id="${item.id}">Удалить</button></div></div><strong class="cart-subtotal">${moneyCart(item.price*item.qty)}</strong></article>`).join('')}</div><aside class="cart-summary"><p class="eyebrow">Заказ</p><h2>Итого</h2><div class="summary-line"><span>Товаров</span><b>${cartCount()}</b></div><div class="summary-line total"><span>К оплате</span><b>${moneyCart(cartTotal())}</b></div><button id="checkoutBtn" class="btn btn-primary full">Оформить заказ</button><p id="cartMsg" class="form-message"></p></aside></div>`;
 content.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.id;const action=btn.dataset.action;if(action==='plus')changeCartQty(id,1);if(action==='minus')changeCartQty(id,-1);if(action==='remove')removeFromCart(id);renderCart();}));
 document.querySelector('#checkoutBtn').addEventListener('click',checkout);
}
async function checkout(){
 const user=auth.currentUser;const msg=document.querySelector('#cartMsg');
 if(!user){location.href='auth.html';return;}
 const cart=getCart();if(!cart.length)return;
 try{
  await db.collection('history').add({userId:user.uid,action:'Оформил заказ',items:cart.map(x=>({productId:x.id,title:x.title,price:x.price,qty:x.qty})),total:cartTotal(),createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  clearCart();renderCart();alert('Заказ оформлен! Он сохранён в истории личного кабинета.');
 }catch(e){msg.textContent=e.message;}
}
clearBtn.addEventListener('click',()=>{if(confirm('Очистить корзину?')){clearCart();renderCart();}});
window.addEventListener('storage',renderCart);renderCart();
