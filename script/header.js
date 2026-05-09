document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger_btn");
  const menu = document.querySelector(".mobile_menu");
  burger?.addEventListener("click", () => menu?.classList.toggle("open"));

  const input = document.getElementById("search_input");
  const btn = document.getElementById("search_btn");
  const wrap = document.querySelector(".header_search_wrap");
  if (!input || !wrap) return;

  const dropdown = document.createElement("div");
  dropdown.className = "search_dropdown";
  wrap.appendChild(dropdown);

  let products = [];

  input.addEventListener("focus", async () => {
    if (products.length) return;
    const text = await fetch("./products_all.xml").then((r) => r.text());
    const xml = new DOMParser().parseFromString(text, "application/xml");
    products = [...xml.querySelectorAll("product")].map((node) => ({
      id: node.querySelector("id").textContent,
      name: node.querySelector("n").textContent,
      price: parseInt(node.querySelector("price_retail").textContent) || 0,
      image: node.querySelector("image").textContent,
    }));
  });

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      dropdown.style.display = "none";
      return;
    }

    const found = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 7);

    dropdown.innerHTML = found.length
      ? found
          .map(
            (p) => `
                <a class="sdd_item" href="product.html?id=${p.id}">
                    <img src="./images/main-images/${p.image}" onerror="this.style.display='none'">
                    <span>${p.name}</span>
                    <b>${p.price.toLocaleString("ru")} BYN</b>
                </a>`,
          )
          .join("")
      : '<div class="sdd_empty">Ничего не найдено</div>';

    dropdown.style.display = "block";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim())
      location.href =
        "catalog.html?search=" + encodeURIComponent(input.value.trim());
    if (e.key === "Escape") dropdown.style.display = "none";
  });

  btn?.addEventListener("click", () => {
    if (input.value.trim())
      location.href =
        "catalog.html?search=" + encodeURIComponent(input.value.trim());
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) dropdown.style.display = "none";
  });
});
