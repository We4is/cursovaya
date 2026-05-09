const catNames = {
    protein: 'Протеин', creatine: 'Креатин',
    gainer: 'Гейнеры', collagen: 'Коллаген', magnesium: 'Магний'
};

function heartSVG(filled) {
    return `<svg width="22" height="22" viewBox="0 0 24 24"
        fill="${filled ? '#4174CB' : 'none'}"
        stroke="${filled ? '#4174CB' : '#BDBDBD'}" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;
}

function stars(rating) {
    return Array.from({length: 5}, (_, i) =>
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="${i < rating ? '#F5A623' : '#E0E0E0'}">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`).join('');
}

function showError(msg) {
    const w = document.getElementById('product_wrapper');
    if (w) w.innerHTML = `<div style="text-align:center;padding:60px;color:#888">
        <p>${msg}</p><br>
        <a href="catalog.html" style="color:#4174CB">← Вернуться в каталог</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;

    try {
        const text = await fetch('./products_all.xml').then(r => r.text());
        const xml  = new DOMParser().parseFromString(text, 'application/xml');
        const node = [...xml.querySelectorAll('product')].find(n =>
            n.querySelector('id')?.textContent === id
        );

        if (!node) { showError('Товар не найден'); return; }

        const g = tag => node.querySelector(tag)?.textContent.trim() ?? '';
        const p = {
            id:       g('id'),   article:  g('article'),
            category: node.getAttribute('category'),
            name:     g('n'),    brand:    g('brand'),
            desc:     g('description'),
            weight:   g('weight'),
            price:    parseInt(g('price_retail'))     || 0,
            price_opt:parseInt(g('price_wholesale'))  || 0,
            price_pre:parseInt(g('price_preorder'))   || 0,
            price_pkg:parseInt(g('price_package'))    || 0,
            pkg_qty:  g('package_qty'),
            in_stock: g('in_stock') === 'true',
            rating:   parseInt(g('rating')) || 0,
            country:  g('country'),   standard:  g('standard'),
            pkg_type: g('package_type'), image: g('image')
        };

        document.title = `${p.name} — SportTime`;

        const inCart  = cartHas(p.id);
        const dis     = p.in_stock ? '' : ' disabled';
        const disCls  = p.in_stock ? '' : ' disabled';

        document.getElementById('product_wrapper').innerHTML = `
            <div class="prod_layout">
                <div class="prod_gallery">
                    <img src="./images/main-images/${p.image}" alt="${p.name}"
                        onerror="this.style.opacity=0.2">
                </div>
                <div class="prod_info">
                    <div class="prod_top_row">
                        <div class="prod_article"><span>Артикул:</span> ${p.article}</div>
                        <div class="prod_stars">${stars(p.rating)}</div>
                    </div>
                    <h1>${p.name}</h1>
                    <p class="prod_desc">${p.desc}</p>
                    <div class="prod_meta">
                        <div class="prod_meta_row"><span>Размер:</span> ${p.weight}</div>
                        <div class="prod_meta_row"><span>Бренд:</span>
                            ${p.brand}</div>
                        <div class="prod_meta_row"><span>Наличие:</span>
                            ${p.in_stock
                                ? '<b class="in_yes">Есть в наличии</b>'
                                : '<b class="in_no">Нет в наличии</b>'}</div>
                        <div class="prod_meta_row"><span>Цена:</span>
                            <b class="prod_price">${p.price.toLocaleString('ru')} BYN</b></div>
                        <div class="prod_meta_row"><span>Цена опт:</span>
                            <b class="prod_price">${p.price_opt.toLocaleString('ru')} BYN</b></div>
                    </div>
                    <div class="prod_prices_extra">
                        <div>Цена предзаказ: <b>${p.price_pre.toLocaleString('ru')} BYN</b></div>
                        <div>Цена упаковки: <b>${p.price_pkg.toLocaleString('ru')} BYN</b></div>
                    </div>
                    <div class="prod_actions">
                        <button id="btn_add" class="btn_cart_prod${disCls}"${dis}>
                            Добавить в корзину
                        </button>
                        <button id="btn_heart" class="btn_heart_prod${inCart ? ' active' : ''}">
                            ${heartSVG(inCart)}
                        </button>
                    </div>
                </div>
            </div>

            <div class="prod_tabs">
                <div class="prod_tab_btns">
                    <button class="prod_tab active" data-tab="chars">Характеристики</button>
                    <button class="prod_tab" data-tab="desc">Отзывы</button>
                </div>
                <div id="tab_chars" class="prod_tab_content active">
                    <table class="prod_chars_table">
                        <tr><td>Страна-производитель</td><td>${p.country}</td></tr>
                        <tr><td>Стандарт</td><td>${p.standard}</td></tr>
                        <tr><td>Количество в упаковке</td><td>${p.pkg_qty} шт.</td></tr>
                        <tr><td>Вид упаковки</td><td>${p.pkg_type}</td></tr>
                    </table>
                </div>
                <div id="tab_desc" class="prod_tab_content">
                    <p class="prod_tab_text">${p.desc}</p>
                </div>
            </div>`;

        document.getElementById('btn_add')?.addEventListener('click', function() {
            cartAdd({id: p.id, name: p.name, price: p.price, image: p.image, article: p.article});
            this.textContent = 'Добавлено';
            setTimeout(() => this.innerHTML = 'Добавить в корзину', 1500);
        });

        document.getElementById('btn_heart')?.addEventListener('click', function() {
            if (cartHas(p.id)) {
                cartRemove(p.id);
                this.classList.remove('active');
                this.innerHTML = heartSVG(false);
            } else {
                cartAdd({id: p.id, name: p.name, price: p.price, image: p.image, article: p.article});
                this.classList.add('active');
                this.innerHTML = heartSVG(true);
            }
        });

        document.querySelectorAll('.prod_tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.prod_tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.prod_tab_content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab_${btn.dataset.tab}`)?.classList.add('active');
            });
        });

    } catch(e) {
        showError('Ошибка загрузки: ' + e.message);
    }
});