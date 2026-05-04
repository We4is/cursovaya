document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    document.getElementById('btn_clear_cart')?.addEventListener('click', () => {
        cartClear();
        renderCart();
    });

    document.querySelectorAll('.btn_checkout').forEach(btn => {
        btn.addEventListener('click', () =>
            alert('Для оформления заказа свяжитесь с нами: +375 29 526 67 42')
        );
    });
});

const renderCart = () => {
    const items = cartGetItems();
    const emptyEl = document.getElementById('cart_empty');
    const tableEl = document.getElementById('cart_table');
    const sumEl = document.getElementById('cart_summary');
    const actEl = document.getElementById('cart_actions');

    const show = (el, val) => { if (el) el.style.display = val; };

    if (!items.length) {
        show(emptyEl, 'flex'); show(tableEl, 'none');
        show(sumEl, 'none');   show(actEl, 'none');
        return;
    }

    show(emptyEl, 'none'); show(tableEl, 'block');
    show(sumEl, 'block');  show(actEl, 'flex');

    document.getElementById('cart_items_container').innerHTML = items.map(item => `
        <div class="cart_item" data-id="${item.id}">
            <img src="./images/main-images/${item.image || 'protein.png'}"
                onerror="this.style.opacity=0.2">
            <div class="cart_item_info">
                <div class="cart_item_article"><span>Артикул:</span> ${item.article || ''}</div>
                <div class="cart_item_name">${item.name}</div>
            </div>
            <div class="cart_item_price">${item.price.toLocaleString('ru')} BYN</div>
            <div class="cart_item_qty">
                <button onclick="changeQty('${item.id}', -1)">−</button>
                <input type="number" value="${item.qty}" min="1"
                    onchange="setQty('${item.id}', this.value)">
                <button class="qty_plus_btn" onclick="changeQty('${item.id}', 1)">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </button>
            </div>
            <div class="cart_item_total">${(item.price * item.qty).toLocaleString('ru')} BYN</div>
            <button class="cart_item_remove" onclick="removeItem('${item.id}')">×</button>
        </div>`).join('');

    const subtotal = cartTotal();
    const tax = Math.round(subtotal / 6);
    document.getElementById('cart_subtotal').textContent = subtotal.toLocaleString('ru') + ' BYN';
    document.getElementById('cart_tax').textContent = tax.toLocaleString('ru') + ' BYN';
    document.getElementById('cart_total').textContent = subtotal.toLocaleString('ru') + ' BYN';
};

const changeQty = (id, delta) => {
    const items = cartGetItems();
    const item = items.find(p => p.id === id);
    if (item) item.qty = Math.max(1, item.qty + delta);
    cartSave(items);
    cartUpdateBadge();
    renderCart();
};

const setQty = (id, val) => {
    const items = cartGetItems();
    const item  = items.find(p => p.id === id);
    if (item) item.qty = Math.max(1, parseInt(val) || 1);
    cartSave(items);
    cartUpdateBadge();
    renderCart();
};

const removeItem = id => { cartRemove(id); renderCart(); };
