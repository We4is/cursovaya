function cartGetItems() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function cartSave(items) {
    localStorage.setItem('cart', JSON.stringify(items));
}

function cartAdd(product) {
    const items = cartGetItems();
    const found = items.find(p => p.id === product.id);

    if (found) {
        found.qty += 1;
    } else {
        items.push({ id: product.id, name: product.name, price: product.price, image: product.image, article: product.article, qty: 1 });
    }

    cartSave(items);
    cartUpdateBadge();
}

function cartRemove(id) {
    const items = cartGetItems().filter(p => p.id !== id);
    cartSave(items);
    cartUpdateBadge();
}

function cartHas(id) {
    return cartGetItems().some(p => p.id === id);
}

function cartClear() {
    localStorage.removeItem('cart');
    cartUpdateBadge();
}

function cartTotal() {
    return cartGetItems().reduce((sum, p) => sum + p.price * p.qty, 0);
}

function cartUpdateBadge() {
    const items = cartGetItems();
    const count = items.reduce((sum, p) => sum + p.qty, 0);
    const badges = document.querySelectorAll('.cart_badge');

    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cartUpdateBadge();
});
