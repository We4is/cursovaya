function cartGetItems() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function cartSave(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

const WHOLESALE_QTY = 20;

function cartGetActivePrice(item) {
  return item.qty >= WHOLESALE_QTY ? item.price_wholesale : item.price;
}

function cartAdd(product) {
  const items = cartGetItems();
  const found = items.find((p) => p.id === product.id);

  if (found) {
    found.qty += 1;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      price_wholesale: product.price_wholesale,
      image: product.image,
      article: product.article,
      qty: 1,
    });
  }

  cartSave(items);
  cartUpdateBadge();
}

function cartRemove(id) {
  const items = cartGetItems().filter((p) => p.id !== id);
  cartSave(items);
  cartUpdateBadge();
}

function cartHas(id) {
  return cartGetItems().some((p) => p.id === id);
}

function cartClear() {
  localStorage.removeItem("cart");
  cartUpdateBadge();
}

function cartTotal() {
  return cartGetItems().reduce(
    (sum, p) => sum + cartGetActivePrice(p) * p.qty,
    0,
  );
}

function cartUpdateBadge() {
  const items = cartGetItems();
  const count = items.reduce((sum, p) => sum + p.qty, 0);
  const badges = document.querySelectorAll(".cart_badge");

  badges.forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

cartUpdateBadge();
