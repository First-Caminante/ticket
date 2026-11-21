(() => {
  const STORAGE_PRODUCTS_KEY = 'norte_urbano_products_v1';
  const STORAGE_CART_KEY = 'norte_urbano_cart_v1';
  const WHATSAPP_NUMBER = '59177398405';

  const DEFAULT_PRODUCTS = [
    {
      id: 'polera-oversize-heavy',
      name: 'Polera Oversize Heavy 280g',
      category: 'poleras',
      price: 95,
      status: 'disponible',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro carbón', hex: '#18181B' },
        { name: 'Hueso', hex: '#E7E5E4' },
        { name: 'Oliva', hex: '#4D5D4E' },
      ],
      description: 'Algodón peruano peinado de 280g con caída estructurada y cuello grueso.',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'polera-boxy-esencial',
      name: 'Polera Boxy Fit Esencial',
      category: 'poleras',
      price: 85,
      status: 'disponible',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Blanco tiza', hex: '#F5F5F4' },
        { name: 'Grafito', hex: '#3F3F46' },
      ],
      description: 'Corte cuadrado moderno, ideal para capas con hoodies o chaquetas.',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'hoodie-heavyweight-andino',
      name: 'Hoodie Heavyweight Andino',
      category: 'abrigos',
      price: 210,
      status: 'ultimo',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Negro mate', hex: '#18181B' },
        { name: 'Piedra', hex: '#D6D3D1' },
        { name: 'Café expreso', hex: '#44362F' },
      ],
      description: 'Frisa gruesa de 420g pensada para las tardes frías de La Paz. Capucha doble.',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'chaqueta-bomber-urbana',
      name: 'Chaqueta Bomber Urbana',
      category: 'abrigos',
      price: 260,
      status: 'disponible',
      sizes: ['M', 'L', 'XL'],
      colors: [
        { name: 'Negro', hex: '#18181B' },
        { name: 'Musgo', hex: '#36493E' },
      ],
      description: 'Exterior rompevientos repelente al agua con forro térmico ligero y cierres metálicos.',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'hoodie-zip-minimal',
      name: 'Hoodie Zip-Up Minimal',
      category: 'abrigos',
      price: 225,
      status: 'agotado',
      sizes: ['S', 'M', 'L'],
      colors: [
        { name: 'Gris ceniza', hex: '#71717A' },
        { name: 'Negro', hex: '#18181B' },
      ],
      description: 'Cierre completo metálico, bolsillos profundos y ajuste relajado.',
      image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'gorra-dad-cap',
      name: 'Gorra Dad Cap Bordada',
      category: 'accesorios',
      price: 65,
      status: 'disponible',
      sizes: ['Única'],
      colors: [
        { name: 'Negro lavado', hex: '#27272A' },
        { name: 'Arena', hex: '#D6CBB8' },
        { name: 'Verde bosque', hex: '#1E3A2F' },
      ],
      description: 'Sarga de algodón lavado con hebilla metálica regulable y bordado frontal.',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'tote-bag-lona',
      name: 'Tote Bag Lona Cruda',
      category: 'accesorios',
      price: 45,
      status: 'disponible',
      sizes: ['Única'],
      colors: [
        { name: 'Crudo natural', hex: '#EAE6DF' },
        { name: 'Negro', hex: '#18181B' },
      ],
      description: 'Lona resistente de 14oz con bolsillo interno para celular y llaves.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bolso-crossbody-compacto',
      name: 'Bolso Crossbody Compacto',
      category: 'accesorios',
      price: 135,
      status: 'ultimo',
      sizes: ['Única'],
      colors: [
        { name: 'Negro', hex: '#18181B' },
        { name: 'Cemento', hex: '#A1A1AA' },
      ],
      description: 'Nylon impermeable con correa ajustable y compartimiento principal acolchado.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const DELIVERY_OPTIONS = [
    { id: 'tienda', label: 'Recoger en tienda (San Miguel)', cost: 0, costLabel: 'Gratis', placeholder: 'Ej. Paso hoy a las 17:00' },
    { id: 'teleferico', label: 'Entrega en estación Mi Teleférico', cost: 5, costLabel: 'Bs 5', placeholder: 'Ej. Línea Amarilla — Estación Sopocachi' },
    { id: 'delivery', label: 'Delivery a domicilio (La Paz)', cost: 12, costLabel: 'Bs 12', placeholder: 'Ej. Obrajes calle 14, edificio azul' },
    { id: 'interior', label: 'Envío al interior', cost: null, costLabel: 'Por coordinar', placeholder: 'Ej. Cochabamba — Terminal / flota' },
  ];

  const STATUS_LABELS = {
    disponible: 'Disponible',
    ultimo: 'Últimas unidades',
    agotado: 'Agotado',
  };

  let products = loadProducts();
  let cart = loadCart();
  let activeCategory = 'todo';
  let searchQuery = '';
  let deliveryId = 'teleferico';
  let customerName = '';
  let customerRef = '';
  let activeDetail = null;
  let toastTimer = null;

  const gridEl = document.getElementById('product-grid');
  const countEl = document.getElementById('catalog-count');
  const categoryRail = document.getElementById('category-rail');
  const searchToggle = document.getElementById('search-toggle');
  const searchDrawer = document.getElementById('search-drawer');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  const topbarCartBtn = document.getElementById('topbar-cart-btn');
  const topbarCartCount = document.getElementById('topbar-cart-count');
  const floatingCart = document.getElementById('floating-cart');
  const floatingCartBtn = document.getElementById('floating-cart-btn');
  const floatingCartCount = document.getElementById('floating-cart-count');
  const floatingCartTotal = document.getElementById('floating-cart-total');

  const productDialog = document.getElementById('product-dialog');
  const productDialogBody = document.getElementById('product-dialog-body');
  const detailTitleEl = document.getElementById('detail-title');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  const cartDialog = document.getElementById('cart-dialog');
  const cartDialogBody = document.getElementById('cart-dialog-body');
  const cartDialogFooter = document.getElementById('cart-dialog-footer');

  const qrDialog = document.getElementById('qr-dialog');
  const qrAmountBadge = document.getElementById('qr-amount-badge');

  const ownerDialog = document.getElementById('owner-dialog');
  const ownerOpenBtn = document.getElementById('owner-open-btn');
  const ownerList = document.getElementById('owner-list');
  const ownerResetBtn = document.getElementById('owner-reset-btn');

  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toast-message');
  const toastLiveEl = document.getElementById('toast-live');

  // --- Persistence helpers ---
  function cloneDefaults() {
    return DEFAULT_PRODUCTS.map((p) => ({
      ...p,
      sizes: [...p.sizes],
      colors: p.colors.map((c) => ({ ...c })),
    }));
  }

  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== DEFAULT_PRODUCTS.length) {
        return cloneDefaults();
      }
      return DEFAULT_PRODUCTS.map((def) => {
        const saved = parsed.find((item) => item.id === def.id);
        if (!saved) return { ...def };
        const price = Number(saved.price);
        const status = ['disponible', 'ultimo', 'agotado'].includes(saved.status)
          ? saved.status
          : def.status;
        return {
          ...def,
          price: Number.isFinite(price) && price > 0 ? Math.round(price) : def.price,
          status,
        };
      });
    } catch {
      return cloneDefaults();
    }
  }

  function saveProducts() {
    try {
      const compact = products.map(({ id, price, status }) => ({ id, price, status }));
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(compact));
    } catch {
      // Ignore storage quota errors in private browsing
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }

  function formatBs(amount) {
    return `Bs ${amount}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // --- Dialog helpers (top-layer exit + closedby fallback) ---
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
  }

  async function closeDialogSmooth(dialog) {
    if (!dialog.open) return;
    if (!supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => setTimeout(resolve, 350)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }
    dialog.close();
  }

  function wireDialogs() {
    const allDialogs = [productDialog, cartDialog, qrDialog, ownerDialog];
    const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

    for (const dialog of allDialogs) {
      dialog.addEventListener('cancel', (event) => {
        if (!supportsTopLayerExit()) {
          event.preventDefault();
          closeDialogSmooth(dialog);
        }
      });

      dialog.addEventListener('click', (event) => {
        if (event.target.closest('[data-close-dialog]')) {
          closeDialogSmooth(dialog);
        }
      });

      // Fallback light-dismiss for Safari / browsers without closedby="any"
      if (!supportsClosedBy) {
        let pressedOutside = false;
        const isOutside = (e) => {
          const r = dialog.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        dialog.addEventListener('pointerdown', (e) => {
          pressedOutside = isOutside(e);
        });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && isOutside(e)) {
            closeDialogSmooth(dialog);
          }
          pressedOutside = false;
        });
      }
    }
  }

  // --- Toast helper (popover="manual" + aria-live fallback) ---
  function showToast(message) {
    toastMsgEl.textContent = message;

    if (typeof document.ariaNotify === 'function') {
      document.ariaNotify(message);
    } else if (toastLiveEl) {
      toastLiveEl.textContent = '';
      requestAnimationFrame(() => {
        toastLiveEl.textContent = message;
      });
    }

    if (typeof toastEl.showPopover === 'function') {
      try {
        if (toastEl.matches(':popover-open')) {
          toastEl.hidePopover();
        }
        toastEl.showPopover();
      } catch {
        // Fallback ignored
      }
    }

    clearTimeout(toastTimer);
    const scheduleHide = () => {
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        if (toastEl.contains(document.activeElement)) {
          scheduleHide();
          return;
        }
        if (typeof toastEl.hidePopover === 'function' && toastEl.matches(':popover-open')) {
          toastEl.hidePopover();
        }
      }, 2600);
    };
    scheduleHide();
  }

  // --- Product Grid Rendering ---
  function getFilteredProducts() {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchCat = activeCategory === 'todo' || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  function renderGrid() {
    const list = getFilteredProducts();

    if (countEl) {
      countEl.textContent = list.length === 1 ? '1 prenda' : `${list.length} prendas`;
    }

    if (list.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__title">No encontramos prendas con ese filtro</p>
          <p class="empty-state__desc">Prueba con otro término o revisa todo el catálogo.</p>
          <button type="button" class="btn btn--secondary" id="clear-filters-btn">Ver todo el catálogo</button>
        </div>
      `;
      const clearBtn = document.getElementById('clear-filters-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          activeCategory = 'todo';
          searchQuery = '';
          searchInput.value = '';
          searchClear.hidden = true;
          syncCategoryPills();
          renderGrid();
        });
      }
      return;
    }

    gridEl.innerHTML = list
      .map((item, idx) => {
        const badgeHtml =
          item.status === 'ultimo'
            ? '<span class="stock-pill stock-pill--ultimo">Último</span>'
            : item.status === 'agotado'
              ? '<span class="stock-pill stock-pill--agotado">Agotado</span>'
              : '';

        const soldOutClass = item.status === 'agotado' ? 'product-card--soldout' : '';

        return `
          <article class="product-card ${soldOutClass}">
            <button type="button" class="product-card__btn" data-open-product="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}, ${formatBs(item.price)}">
              <div class="product-card__media">
                <img
                  class="product-card__img"
                  src="${escapeHtml(item.image)}"
                  alt="${escapeHtml(item.name)}"
                  loading="eager"
                  decoding="async"
                >
                <div class="product-card__fallback" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                  </svg>
                  <span class="product-card__fallback-label">Norte Urbano</span>
                </div>
                ${badgeHtml}
              </div>
              <div class="product-card__info">
                <h2 class="product-card__name">${escapeHtml(item.name)}</h2>
                <p class="product-card__price">${formatBs(item.price)}</p>
              </div>
            </button>
          </article>
        `;
      })
      .join('');

    // Attach clean image fallback listeners (never show broken icon)
    for (const img of gridEl.querySelectorAll('.product-card__img')) {
      img.addEventListener('error', () => {
        img.closest('.product-card__media')?.classList.add('is-fallback');
      });
    }
  }

  function syncCategoryPills() {
    for (const btn of categoryRail.querySelectorAll('[data-cat]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.cat === activeCategory));
    }
  }

  // --- Product Detail Sheet ---
  function openProductDetail(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    activeDetail = {
      productId: product.id,
      size: product.sizes[0],
      color: product.colors[0].name,
      qty: 1,
    };

    renderProductDetail();
    productDialog.showModal();
  }

  function renderProductDetail() {
    if (!activeDetail) return;
    const product = products.find((p) => p.id === activeDetail.productId);
    if (!product) return;

    detailTitleEl.textContent = product.name;
    const isSoldOut = product.status === 'agotado';

    productDialogBody.innerHTML = `
      <div class="detail-layout">
        <div class="detail-media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" id="detail-img">
          <div class="product-card__fallback" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
            </svg>
            <span class="product-card__fallback-label">Norte Urbano</span>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-header">
            <div class="detail-meta-row">
              <span class="detail-price">${formatBs(product.price)}</span>
              <span class="detail-status detail-status--${product.status}">${STATUS_LABELS[product.status]}</span>
            </div>
            <p class="detail-desc">${escapeHtml(product.description)}</p>
          </div>

          <div class="option-group">
            <p class="option-label">Talla: <span>${escapeHtml(activeDetail.size)}</span></p>
            <div class="size-row" role="group" aria-label="Elegir talla">
              ${product.sizes
                .map(
                  (size) => `
                  <button type="button" class="size-btn" data-select-size="${escapeHtml(size)}" aria-pressed="${size === activeDetail.size}" ${isSoldOut ? 'disabled' : ''}>
                    ${escapeHtml(size)}
                  </button>`
                )
                .join('')}
            </div>
          </div>

          <div class="option-group">
            <p class="option-label">Color: <span>${escapeHtml(activeDetail.color)}</span></p>
            <div class="color-row" role="group" aria-label="Elegir color">
              ${product.colors
                .map(
                  (c) => `
                  <button type="button" class="color-btn" data-select-color="${escapeHtml(c.name)}" aria-pressed="${c.name === activeDetail.color}" ${isSoldOut ? 'disabled' : ''}>
                    <span class="color-swatch" style="background-color: ${escapeHtml(c.hex)};" aria-hidden="true"></span>
                    ${escapeHtml(c.name)}
                  </button>`
                )
                .join('')}
            </div>
          </div>

          <div class="qty-row">
            <span class="option-label">Cantidad</span>
            <div class="stepper">
              <button type="button" class="stepper__btn" data-detail-qty="-1" aria-label="Restar cantidad" ${isSoldOut || activeDetail.qty <= 1 ? 'disabled' : ''}>−</button>
              <span class="stepper__val">${activeDetail.qty}</span>
              <button type="button" class="stepper__btn" data-detail-qty="1" aria-label="Sumar cantidad" ${isSoldOut || activeDetail.qty >= 10 ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const detailImg = document.getElementById('detail-img');
    if (detailImg) {
      detailImg.addEventListener('error', () => {
        detailImg.closest('.detail-media')?.classList.add('is-fallback');
      });
    }

    if (isSoldOut) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Agotado por el momento';
    } else {
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = `Agregar al carrito · ${formatBs(product.price * activeDetail.qty)}`;
    }
  }

  // --- Cart Logic & Checkout ---
  function getCartMetrics() {
    let itemCount = 0;
    let subtotal = 0;
    const enriched = [];

    for (const entry of cart) {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) continue;
      const lineTotal = product.price * entry.qty;
      itemCount += entry.qty;
      subtotal += lineTotal;
      enriched.push({ ...entry, product, lineTotal });
    }

    const delivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryId) || DELIVERY_OPTIONS[0];
    const total = delivery.cost === null ? subtotal : subtotal + delivery.cost;

    return { enriched, itemCount, subtotal, delivery, total };
  }

  function syncCartIndicators() {
    const { itemCount, subtotal } = getCartMetrics();

    topbarCartCount.textContent = String(itemCount);
    topbarCartCount.hidden = itemCount === 0;

    floatingCartCount.textContent = String(itemCount);
    floatingCartTotal.textContent = formatBs(subtotal);
    floatingCart.hidden = itemCount === 0;
  }

  function addActiveDetailToCart() {
    if (!activeDetail) return;
    const product = products.find((p) => p.id === activeDetail.productId);
    if (!product || product.status === 'agotado') return;

    const existing = cart.find(
      (c) =>
        c.productId === product.id &&
        c.size === activeDetail.size &&
        c.color === activeDetail.color
    );

    if (existing) {
      existing.qty += activeDetail.qty;
    } else {
      cart.push({
        key: `${product.id}__${activeDetail.size}__${activeDetail.color}`,
        productId: product.id,
        size: activeDetail.size,
        color: activeDetail.color,
        qty: activeDetail.qty,
      });
    }

    saveCart();
    syncCartIndicators();
    const summaryLabel = `${product.name} (${activeDetail.size})`;
    closeDialogSmooth(productDialog).then(() => {
      showToast(`Agregado: ${summaryLabel}`);
    });
  }

  function buildOrderText() {
    const { enriched, subtotal, delivery, total } = getCartMetrics();
    const lines = [
      'Hola Norte Urbano, quiero hacer este pedido:',
      '',
    ];

    for (const item of enriched) {
      lines.push(
        `• ${item.qty}x ${item.product.name} (Talla ${item.size}, ${item.color}) — ${formatBs(item.lineTotal)}`
      );
    }

    lines.push('');
    lines.push(`Subtotal: ${formatBs(subtotal)}`);
    lines.push(`Entrega: ${delivery.label} (${delivery.costLabel})`);
    lines.push(
      delivery.cost === null
        ? `Total estimado: ${formatBs(total)} + envío por coordinar`
        : `Total: ${formatBs(total)}`
    );

    if (customerName.trim()) {
      lines.push(`Nombre: ${customerName.trim()}`);
    }
    if (customerRef.trim()) {
      lines.push(`Referencia / zona: ${customerRef.trim()}`);
    }

    return lines.join('\n');
  }

  function buildWhatsAppUrl() {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderText())}`;
  }

  function renderCartDialog() {
    const { enriched, subtotal, delivery, total } = getCartMetrics();

    if (enriched.length === 0) {
      cartDialogBody.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__title">Tu carrito está vacío</p>
          <p class="empty-state__desc">Toca cualquier prenda del catálogo para elegir talla y color.</p>
        </div>
      `;
      cartDialogFooter.innerHTML = `
        <button type="button" class="btn btn--secondary btn--full" data-close-dialog>Explorar catálogo</button>
      `;
      return;
    }

    const activeDelivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryId) || DELIVERY_OPTIONS[0];

    cartDialogBody.innerHTML = `
      <div class="cart-items">
        ${enriched
          .map(
            (item) => `
            <div class="cart-item">
              <img class="cart-item__thumb" src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}">
              <div class="cart-item__meta">
                <p class="cart-item__name">${escapeHtml(item.product.name)}</p>
                <p class="cart-item__variant">Talla ${escapeHtml(item.size)} · ${escapeHtml(item.color)}</p>
                <p class="cart-item__price">${formatBs(item.lineTotal)}</p>
              </div>
              <div class="stepper stepper--sm">
                <button type="button" class="stepper__btn" data-cart-qty="${escapeHtml(item.key)}" data-delta="-1" aria-label="Quitar uno de ${escapeHtml(item.product.name)}">−</button>
                <span class="stepper__val">${item.qty}</span>
                <button type="button" class="stepper__btn" data-cart-qty="${escapeHtml(item.key)}" data-delta="1" aria-label="Agregar uno de ${escapeHtml(item.product.name)}">+</button>
              </div>
            </div>`
          )
          .join('')}
      </div>

      <fieldset class="checkout-section">
        <legend class="checkout-section__title">Modalidad de entrega</legend>
        <div class="delivery-list">
          ${DELIVERY_OPTIONS.map(
            (opt) => `
            <label class="delivery-opt">
              <span class="delivery-opt__left">
                <input type="radio" name="delivery-mode" value="${opt.id}" ${opt.id === deliveryId ? 'checked' : ''}>
                <span>${escapeHtml(opt.label)}</span>
              </span>
              <span class="delivery-opt__cost">${escapeHtml(opt.costLabel)}</span>
            </label>`
          ).join('')}
        </div>
      </fieldset>

      <div class="checkout-section">
        <p class="checkout-section__title">Datos para coordinar (opcional)</p>
        <div class="form-grid">
          <div class="field">
            <label for="checkout-name">Tu nombre</label>
            <input id="checkout-name" type="text" autocomplete="name" placeholder="Ej. Camila Rojas" value="${escapeHtml(customerName)}">
          </div>
          <div class="field">
            <label for="checkout-ref">Zona / estación / referencia</label>
            <input id="checkout-ref" type="text" placeholder="${escapeHtml(activeDelivery.placeholder)}" value="${escapeHtml(customerRef)}">
          </div>
        </div>
      </div>
    `;

    const totalText =
      delivery.cost === null ? `${formatBs(total)} + envío` : formatBs(total);

    cartDialogFooter.innerHTML = `
      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatBs(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Entrega</span>
          <span>${escapeHtml(delivery.costLabel)}</span>
        </div>
        <div class="summary-row summary-row--total">
          <span>Total</span>
          <span>${totalText}</span>
        </div>
      </div>
      <div class="checkout-actions">
        <a class="btn btn--wa btn--full" id="wa-send-link" href="${escapeHtml(buildWhatsAppUrl())}" target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          Enviar pedido por WhatsApp
        </a>
        <div class="checkout-secondary">
          <button type="button" class="btn btn--secondary" id="open-qr-btn">Ver QR Simple oficial</button>
          <button type="button" class="btn btn--ghost" id="copy-order-btn">Copiar texto del pedido</button>
        </div>
      </div>
    `;

    // Sync WhatsApp href when optional text fields change
    const nameInput = document.getElementById('checkout-name');
    const refInput = document.getElementById('checkout-ref');
    const waLink = document.getElementById('wa-send-link');

    const refreshWaHref = () => {
      if (waLink) waLink.href = buildWhatsAppUrl();
    };

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        customerName = nameInput.value;
        refreshWaHref();
      });
    }

    if (refInput) {
      refInput.addEventListener('input', () => {
        customerRef = refInput.value;
        refreshWaHref();
      });
    }
  }

  function openCartDialog() {
    renderCartDialog();
    cartDialog.showModal();
  }

  function openQrDialog() {
    const { delivery, total } = getCartMetrics();
    qrAmountBadge.textContent =
      delivery.cost === null
        ? `Total del pedido: ${formatBs(total)} + envío`
        : `Total del pedido: ${formatBs(total)}`;
    qrDialog.showModal();
  }

  async function copyOrderText() {
    const text = buildOrderText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const copyBtn = document.getElementById('copy-order-btn');
    if (copyBtn) {
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Texto copiado';
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1600);
    }
  }

  // --- Owner Mode (localStorage) ---
  function renderOwnerList() {
    ownerList.innerHTML = products
      .map(
        (item) => `
        <div class="owner-row" data-owner-id="${escapeHtml(item.id)}">
          <div class="owner-row__top">
            <span class="owner-row__name">${escapeHtml(item.name)}</span>
            <label class="owner-price-wrap">
              <span>Bs</span>
              <input
                type="number"
                class="owner-price-input"
                min="1"
                max="9999"
                step="1"
                inputmode="numeric"
                value="${item.price}"
                data-owner-price="${escapeHtml(item.id)}"
                aria-label="Precio en Bs de ${escapeHtml(item.name)}"
              >
            </label>
          </div>
          <div class="status-segment" role="group" aria-label="Estado de ${escapeHtml(item.name)}">
            <button type="button" class="status-seg-btn" data-owner-status="${escapeHtml(item.id)}" data-status="disponible" aria-pressed="${item.status === 'disponible'}">Disponible</button>
            <button type="button" class="status-seg-btn" data-owner-status="${escapeHtml(item.id)}" data-status="ultimo" aria-pressed="${item.status === 'ultimo'}">Último</button>
            <button type="button" class="status-seg-btn" data-owner-status="${escapeHtml(item.id)}" data-status="agotado" aria-pressed="${item.status === 'agotado'}">Agotado</button>
          </div>
        </div>`
      )
      .join('');
  }

  // --- Event wiring ---
  categoryRail.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cat]');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    syncCategoryPills();
    btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    renderGrid();
  });

  searchToggle.addEventListener('click', () => {
    const opening = searchDrawer.hidden;
    searchDrawer.hidden = !opening;
    searchToggle.setAttribute('aria-expanded', String(opening));
    if (opening) {
      searchInput.focus();
    } else if (searchQuery) {
      searchQuery = '';
      searchInput.value = '';
      searchClear.hidden = true;
      renderGrid();
    }
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    searchClear.hidden = searchQuery.length === 0;
    renderGrid();
  });

  searchClear.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    searchClear.hidden = true;
    searchInput.focus();
    renderGrid();
  });

  gridEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-product]');
    if (!trigger) return;
    openProductDetail(trigger.dataset.openProduct);
  });

  productDialogBody.addEventListener('click', (event) => {
    const sizeBtn = event.target.closest('[data-select-size]');
    if (sizeBtn && activeDetail) {
      activeDetail.size = sizeBtn.dataset.selectSize;
      renderProductDetail();
      return;
    }

    const colorBtn = event.target.closest('[data-select-color]');
    if (colorBtn && activeDetail) {
      activeDetail.color = colorBtn.dataset.selectColor;
      renderProductDetail();
      return;
    }

    const qtyBtn = event.target.closest('[data-detail-qty]');
    if (qtyBtn && activeDetail) {
      const next = activeDetail.qty + Number(qtyBtn.dataset.detailQty);
      if (next >= 1 && next <= 10) {
        activeDetail.qty = next;
        renderProductDetail();
      }
    }
  });

  addToCartBtn.addEventListener('click', addActiveDetailToCart);
  topbarCartBtn.addEventListener('click', openCartDialog);
  floatingCartBtn.addEventListener('click', openCartDialog);

  cartDialogBody.addEventListener('click', (event) => {
    const qtyBtn = event.target.closest('[data-cart-qty]');
    if (!qtyBtn) return;
    const key = qtyBtn.dataset.cartQty;
    const delta = Number(qtyBtn.dataset.delta);
    const idx = cart.findIndex((c) => c.key === key);
    if (idx === -1) return;

    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    }
    saveCart();
    syncCartIndicators();
    renderCartDialog();
  });

  cartDialogBody.addEventListener('change', (event) => {
    const radio = event.target.closest('input[name="delivery-mode"]');
    if (!radio) return;
    deliveryId = radio.value;
    renderCartDialog();
  });

  cartDialogFooter.addEventListener('click', (event) => {
    if (event.target.closest('#open-qr-btn')) {
      openQrDialog();
      return;
    }
    if (event.target.closest('#copy-order-btn')) {
      copyOrderText();
    }
  });

  ownerOpenBtn.addEventListener('click', () => {
    renderOwnerList();
    ownerDialog.showModal();
  });

  ownerList.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-owner-status]');
    if (!btn) return;
    const product = products.find((p) => p.id === btn.dataset.ownerStatus);
    if (!product) return;

    product.status = btn.dataset.status;
    saveProducts();
    renderOwnerList();
    renderGrid();
  });

  ownerList.addEventListener('change', (event) => {
    const input = event.target.closest('[data-owner-price]');
    if (!input) return;
    const product = products.find((p) => p.id === input.dataset.ownerPrice);
    if (!product) return;

    const val = Math.round(Number(input.value));
    if (Number.isFinite(val) && val > 0) {
      product.price = val;
      saveProducts();
      renderGrid();
      syncCartIndicators();
    } else {
      input.value = String(product.price);
    }
  });

  ownerResetBtn.addEventListener('click', () => {
    products = cloneDefaults();
    localStorage.removeItem(STORAGE_PRODUCTS_KEY);
    renderOwnerList();
    renderGrid();
    syncCartIndicators();
  });

  // Boot
  wireDialogs();
  renderGrid();
  syncCartIndicators();
})();
