let products = [];

const params = new URLSearchParams(window.location.search);
let currentCat = params.get("cat") || "";
let currentSearch = params.get("search") || "";
let viewMode = "grid";
let priceMin = 0;
let priceMax = 9999999;

const catNames = {
  protein: "Протеин",
  creatine: "Креатин",
  gainer: "Гейнеры",
  collagen: "Коллаген",
  magnesium: "Магний",
  "": "Все товары",
};

fetch("./products_all.xml")
  .then((r) => r.text())
  .then((text) => {
    const xml = new DOMParser().parseFromString(text, "application/xml");
    products = [...xml.querySelectorAll("product")].map((node) => {
      const g = (tag) => node.querySelector(tag)?.textContent.trim() ?? "";
      return {
        id: g("id"),
        article: g("article"),
        category: node.getAttribute("category"),
        name: g("n"),
        brand: g("brand"),
        price: parseInt(g("price_retail")) || 0,
        price_wholesale: parseInt(g("price_wholesale")) || 0,
        price_preorder: parseInt(g("price_preorder")) || 0,
        price_package: parseInt(g("price_package")) || 0,
        package_qty: parseInt(g("package_qty")) || 0,
        in_stock: g("in_stock") === "true",
        rating: parseInt(g("rating")) || 0,
        image: g("image"),
      };
    });

    buildBrands();

    const maxPrice =
      Math.ceil(Math.max(...products.map((p) => p.price)) / 1000) * 1000;
    const slMax = document.getElementById("slider_max");
    const slMin = document.getElementById("slider_min");
    if (slMax) {
      slMax.max = maxPrice;
      slMax.value = maxPrice;
      priceMax = maxPrice;
    }
    if (slMin) {
      slMin.max = maxPrice;
    }
    const lblMax = document.getElementById("price_max_label");
    if (lblMax) lblMax.textContent = maxPrice.toLocaleString("ru");

    showProducts();
  });

function showProducts() {
  const title = document.getElementById("catalog_title");
  if (title)
    title.textContent = currentSearch
      ? `Поиск: ${currentSearch}`
      : (catNames[currentCat] ?? "Каталог");

  document.querySelectorAll(".cat_link").forEach((a) => {
    a.classList.toggle("active", a.dataset.cat === currentCat);
  });

  const checkedBrands = [
    ...document.querySelectorAll("#brand_list input:checked"),
  ].map((cb) => cb.value);
  const onlyInStock =
    document.getElementById("only_in_stock")?.checked ?? false;
  const sortVal = document.getElementById("sort_select")?.value ?? "price_asc";
  const limit = parseInt(document.getElementById("show_select")?.value) || 15;

  let result = products.filter((p) => {
    if (currentCat && p.category !== currentCat) return false;
    if (
      currentSearch &&
      !p.name.toLowerCase().includes(currentSearch.toLowerCase()) &&
      !p.brand.toLowerCase().includes(currentSearch.toLowerCase())
    )
      return false;
    if (checkedBrands.length && !checkedBrands.includes(p.brand)) return false;
    if (onlyInStock && !p.in_stock) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    return true;
  });

  result.sort((a, b) => {
    if (sortVal === "price_asc") return a.price - b.price;
    if (sortVal === "price_desc") return b.price - a.price;
    if (sortVal === "name_asc") return a.name.localeCompare(b.name, "ru");
    if (sortVal === "name_desc") return b.name.localeCompare(a.name, "ru");
    if (sortVal === "rating") return b.rating - a.rating;
    return 0;
  });

  const shown = result.slice(0, limit);
  const container = document.getElementById("products_container");

  if (!shown.length) {
    container.innerHTML =
      '<p style="padding:40px;color:#888">Товары не найдены</p>';
    return;
  }

  if (viewMode === "grid") {
    container.innerHTML = `<div class="cat_grid">${shown.map(cardGrid).join("")}</div>`;
  } else {
    container.innerHTML = `<div class="cat_list">
            <div class="cat_list_head">
                <span>Фото</span><span>Наименование</span>
                <span>Предзаказ</span><span>Уп-ка</span><span>Кол-во</span>
                <span>Опт</span><span>Розница</span><span></span>
            </div>
            ${shown.map(cardList).join("")}
        </div>`;
  }
}

function cardGrid(p) {
  const inCart = cartHas(p.id);
  return `<div class="cat_card" onclick="location.href='product.html?id=${p.id}'">
        ${p.in_stock ? "" : '<span class="out_badge">Нет в наличии</span>'}
        <button class="heart_btn${inCart ? " active" : ""}"
            onclick="event.stopPropagation(); toggleCart(this,'${p.id}')"
            title="В корзину">${heartSVG(inCart)}</button>
        <img src="./images/main-images/${p.image}" alt="${p.name}" onerror="this.style.opacity=0.2">
        <div class="cat_card_stars">${stars(p.rating)}</div>
        <p class="cat_card_name">${p.name}</p>
        <div class="cat_card_price">${p.price.toLocaleString("ru")} BYN</div>
    </div>`;
}

function cardList(p) {
  return `
    <div class="cat_list_row" onclick="location.href='product.html?id=${p.id}'">
        <img src="./images/main-images/${p.image}" alt="${p.name}" onerror="this.style.opacity=0.2">
        <span class="sp">${p.name}<br><small>${p.brand}</small></span>
        <span>${p.price_preorder.toLocaleString("ru")} BYN</span>
        <span>${p.price_package.toLocaleString("ru")} BYN</span>
        <span>${p.package_qty}</span>
        <span>${p.price_wholesale.toLocaleString("ru")} BYN</span>
        <span>${p.price.toLocaleString("ru")} BYN</span>
        <button class="cat_list_btn${p.in_stock ? "" : " disabled"}"
            ${p.in_stock ? "" : "disabled"}
            onclick="event.stopPropagation(); addToCart('${p.id}')">
            ${p.in_stock ? cartSVG() + " В корзину" : "Нет"}
        </button>
    </div>`;
}

function stars(rating) {
  return Array.from(
    { length: 5 },
    (_, i) =>
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i < rating ? "#F5A623" : "#E0E0E0"}">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`,
  ).join("");
}

function heartSVG(filled) {
  return `<svg width="20" height="20" viewBox="0 0 24 24"
        fill="${filled ? "#4174CB" : "none"}"
        stroke="${filled ? "#4174CB" : "#BDBDBD"}" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;
}

function cartSVG() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>`;
}

function toggleCart(btn, id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  if (cartHas(id)) {
    cartRemove(id);
    btn.classList.remove("active");
    btn.innerHTML = heartSVG(false);
  } else {
    cartAdd({
      id: p.id,
      name: p.name,
      price: p.price,
      price_wholesale: p.price_wholesale,
      image: p.image,
      article: p.article,
    });
    btn.classList.add("active");
    btn.innerHTML = heartSVG(true);
  }
}

function addToCart(id) {
  const p = products.find((x) => x.id === id);
  if (p)
    cartAdd({
      id: p.id,
      name: p.name,
      price: p.price,
      price_wholesale: p.price_wholesale,
      image: p.image,
      article: p.article,
    });
}

function buildBrands() {
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const list = document.getElementById("brand_list");
  if (!list) return;
  list.innerHTML = brands
    .map(
      (b) =>
        `<label><input type="checkbox" value="${b}" onchange="showProducts()"> ${b}</label>`,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const slMin = document.getElementById("slider_min");
  const slMax = document.getElementById("slider_max");
  const lblMin = document.getElementById("price_min_label");
  const lblMax = document.getElementById("price_max_label");

  const updateSlider = () => {
    let min = parseInt(slMin.value);
    let max = parseInt(slMax.value);
    if (min > max) [min, max] = [max, min];
    priceMin = min;
    priceMax = max;
    if (lblMin) lblMin.textContent = min.toLocaleString("ru");
    if (lblMax) lblMax.textContent = max.toLocaleString("ru");
    updateTrack();
    showProducts();
  };

  const updateTrack = () => {
    if (!slMin || !slMax) return;
    const min = parseInt(slMin.value);
    const max = parseInt(slMax.value);
    const total = parseInt(slMax.max) || 10000;
    const left = (Math.min(min, max) / total) * 100;
    const right = 100 - (Math.max(min, max) / total) * 100;
    const track = document.querySelector(".slider_track_fill");
    if (track) {
      track.style.left = left + "%";
      track.style.right = right + "%";
    }
  };

  if (slMin) slMin.addEventListener("input", updateSlider);
  if (slMax) slMax.addEventListener("input", updateSlider);

  document.querySelectorAll(".cat_link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      currentCat = a.dataset.cat;
      currentSearch = "";
      showProducts();
    });
  });

  document.getElementById("grid_btn")?.addEventListener("click", () => {
    viewMode = "grid";
    document.getElementById("grid_btn").classList.add("active");
    document.getElementById("list_btn").classList.remove("active");
    showProducts();
  });
  document.getElementById("list_btn")?.addEventListener("click", () => {
    viewMode = "list";
    document.getElementById("list_btn").classList.add("active");
    document.getElementById("grid_btn").classList.remove("active");
    showProducts();
  });

  document
    .getElementById("sort_select")
    ?.addEventListener("change", showProducts);
  document
    .getElementById("show_select")
    ?.addEventListener("change", showProducts);

  document
    .getElementById("only_in_stock")
    ?.addEventListener("change", showProducts);

  document.getElementById("brand_toggle")?.addEventListener("click", () => {
    const list = document.getElementById("brand_list");
    const head = document.getElementById("brand_toggle");
    list.style.display = list.style.display === "none" ? "" : "none";
    head.classList.toggle("collapsed");
  });
});
