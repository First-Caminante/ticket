(() => {
  const WHATSAPP_NUMBER = '59177398405';

  const LA_PAZ_ZONES = [
    { id: 'sopocachi', label: 'Sopocachi', cost: 10 },
    { id: 'miraflores', label: 'Miraflores', cost: 10 },
    { id: 'centro', label: 'Centro / El Prado', cost: 10 },
    { id: 'san-miguel', label: 'San Miguel / Calacoto', cost: 12 },
    { id: 'obrajes', label: 'Obrajes', cost: 12 },
  ];

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatBs(n) {
    return `Bs ${n}`;
  }

  function initMenuQR(config) {
    const STORAGE_MENU_KEY = `menu_qr_items_${config.id}_v1`;
    const STORAGE_CART_KEY = `menu_qr_cart_${config.id}_v1`;

    function cloneDefaults() {
      return config.items.map((item) => ({
        ...item,
        soldOut: Boolean(item.soldOut),
      }));
    }

    function loadItems() {
      try {
        const raw = localStorage.getItem(STORAGE_MENU_KEY);
        if (!raw) return cloneDefaults();
        const saved = JSON.parse(raw);
        if (!Array.isArray(saved)) return cloneDefaults();
        return config.items.map((def) => {
          const match = saved.find((s) => s.id === def.id);
          if (!match) return { ...def, soldOut: Boolean(def.soldOut) };
          const price = Number(match.price);
          return {
            ...def,
            price: Number.isFinite(price) && price > 0 ? Math.round(price) : def.price,
            soldOut: Boolean(match.soldOut),
          };
        });
      } catch {
        return cloneDefaults();
      }
    }

    function saveItems() {
      try {
        const compact = items.map(({ id, price, soldOut }) => ({ id, price, soldOut }));
        localStorage.setItem(STORAGE_MENU_KEY, JSON.stringify(compact));
      } catch {
        // Ignore storage errors
      }
    }

    function loadCart() {
      try {
        const raw = localStorage.getItem(STORAGE_CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function saveCart() {
      try {
        localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
      } catch {
        // Ignore storage errors
      }
    }

    let items = loadItems();
    let cart = loadCart();
    let activeCategory = 'all';
    let activeDishState = null;
    let fulfillmentMode = config.fulfillmentModes[0].id;
    let selectedZone = LA_PAZ_ZONES[0].id;
    let tableNumber = '';
    let pickupDate = '';
    let pickupTime = '';
    let customerName = '';
    let deliveryAddress = '';
    let toastTimer = null;

    // Render App Shell
    const root = document.getElementById('menu-app');
    root.innerHTML = `
      <a href="#carta" class="skip-link visually-hidden">Ir a la carta</a>

      <header class="topbar">
        <div class="container topbar__inner">
          <div class="topbar__left">
            <a href="../../" class="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 12H5"/>
                <path d="m12 19-7-7 7-7"/>
              </svg>
              Demos
            </a>
            <span class="topbar__divider" aria-hidden="true"></span>
            <span class="topbar__brand">${escapeHtml(config.name)}</span>
          </div>
          <button type="button" class="topbar__cart-btn" id="topbar-cart-btn" aria-label="Ver pedido">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="cart-badge" id="topbar-cart-count" hidden>0</span>
          </button>
        </div>
      </header>

      <section class="venue-header">
        <div class="container venue-header__row">
          <h1 class="venue-title">${escapeHtml(config.name)}</h1>
          <p class="venue-meta">${escapeHtml(config.subtitle)}</p>
          <div class="venue-pills">
            <span class="venue-pill">${escapeHtml(config.badge)}</span>
            <span class="venue-pill venue-pill--neutral">${escapeHtml(config.zoneInfo)}</span>
          </div>
        </div>
      </section>

      <main id="carta" class="menu-main" tabindex="-1">
        <div class="container">
          <div class="category-rail" role="group" aria-label="Categorías del menú" id="category-rail">
            <button type="button" class="cat-pill" data-cat="all" aria-pressed="true">Todo</button>
            ${config.categories
              .map(
                (cat) =>
                  `<button type="button" class="cat-pill" data-cat="${escapeHtml(cat.id)}" aria-pressed="false">${escapeHtml(cat.label)}</button>`
              )
              .join('')}
          </div>

          <div class="menu-sections" id="menu-sections"></div>
        </div>
      </main>

      <div class="floating-cart" id="floating-cart" hidden>
        <button type="button" class="floating-cart__btn" id="floating-cart-btn">
          <span class="floating-cart__left">
            <span class="floating-cart__pill" id="floating-cart-count">0</span>
            <span>Ver mi pedido</span>
          </span>
          <span class="floating-cart__total" id="floating-cart-total">Bs 0</span>
        </button>
      </div>

      <footer class="menu-footer">
        <div class="container menu-footer__inner">
          <span class="menu-footer__note">${escapeHtml(config.name)} · Menú QR con pedido directo a WhatsApp</span>
          <button type="button" class="owner-trigger" id="owner-open-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Modo dueño (Demo)
          </button>
        </div>
      </footer>

      <!-- 1. Dish Customization Sheet -->
      <dialog class="sheet" id="dish-dialog" closedby="any" aria-labelledby="dish-dialog-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="dish-dialog-title">Personalizar pedido</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body" id="dish-dialog-body"></div>
        <div class="sheet__footer">
          <button type="button" class="btn btn--cta btn--full" id="dish-add-btn">Agregar al pedido</button>
        </div>
      </dialog>

      <!-- 2. Cart & Checkout Sheet -->
      <dialog class="sheet" id="cart-dialog" closedby="any" aria-labelledby="cart-dialog-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="cart-dialog-title">Tu pedido</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar carrito">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body" id="cart-dialog-body"></div>
        <div class="sheet__footer" id="cart-dialog-footer"></div>
      </dialog>

      <!-- 3. QR Simple Oficial Modal -->
      <dialog class="sheet sheet--narrow" id="qr-dialog" closedby="any" aria-labelledby="qr-dialog-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="qr-dialog-title">QR Simple oficial</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar QR">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body">
          <div class="qr-card">
            <div>
              <span class="qr-merchant__name">${escapeHtml(config.name)} — La Paz</span>
              <span class="qr-merchant__sub">Titular: ${escapeHtml(config.qrHolder)}</span>
            </div>
            <span class="qr-amount" id="qr-amount-badge">Total: Bs 0</span>
            <div class="qr-frame">
              <svg width="176" height="176" viewBox="0 0 29 29" shape-rendering="crispEdges" role="img" aria-label="Código QR Simple de ejemplo">
                <rect width="29" height="29" fill="#FFFFFF"/>
                <path fill="#111111" d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"/>
                <path fill="#111111" d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"/>
                <path fill="#111111" d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"/>
                <path fill="#111111" d="M10,1 h2 v2 h-2 z M14,1 h2 v2 h-2 z M18,1 h1 v3 h-1 z M10,4 h2 v2 h-2 z M13,4 h3 v2 h-3 z M17,5 h2 v2 h-2 z M11,8 h3 v1 h-3 z M16,8 h2 v1 h-2 z M1,10 h3 v2 h-3 z M5,10 h2 v2 h-2 z M9,10 h3 v2 h-3 z M14,10 h2 v3 h-2 z M18,10 h3 v2 h-3 z M23,10 h3 v2 h-3 z M1,14 h2 v2 h-2 z M5,13 h3 v3 h-3 z M10,14 h3 v2 h-3 z M15,14 h3 v2 h-3 z M20,13 h2 v3 h-2 z M24,14 h3 v2 h-3 z M1,17 h3 v2 h-3 z M6,17 h2 v2 h-2 z M10,17 h2 v2 h-2 z M14,17 h2 v2 h-2 z M18,17 h3 v2 h-3 z M23,17 h2 v3 h-2 z M26,17 h2 v2 h-2 z M10,21 h3 v2 h-3 z M15,21 h2 v2 h-2 z M19,21 h3 v2 h-3 z M24,21 h3 v2 h-3 z M10,25 h2 v3 h-2 z M14,24 h3 v3 h-3 z M19,25 h2 v2 h-2 z M23,24 h2 v3 h-2 z M26,25 h2 v3 h-2 z"/>
              </svg>
            </div>
            <p class="qr-notice"><strong>Aviso de seguridad:</strong> Verifica el nombre del titular antes de confirmar tu pago y envía el comprobante por WhatsApp.</p>
          </div>
        </div>
        <div class="sheet__footer">
          <button type="button" class="btn btn--secondary btn--full" data-close-dialog>Cerrar</button>
        </div>
      </dialog>

      <!-- 4. Owner Mode Sheet -->
      <dialog class="sheet" id="owner-dialog" closedby="any" aria-labelledby="owner-dialog-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="owner-dialog-title">Modo dueño — Control del día</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar modo dueño">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body">
          <p class="owner-intro">Apaga un plato agotado en 1 toque o actualiza precios en Bs. Se guarda en este navegador al instante.</p>
          <div class="owner-list" id="owner-list"></div>
        </div>
        <div class="sheet__footer owner-footer">
          <button type="button" class="btn btn--ghost" id="owner-reset-btn">Restaurar demo</button>
          <button type="button" class="btn btn--cta" data-close-dialog>Ver carta</button>
        </div>
      </dialog>

      <!-- Toast -->
      <div class="toast-region" role="region" aria-label="Notificaciones">
        <div id="toast" class="toast" popover="manual">
          <span id="toast-msg"></span>
          <button type="button" class="toast__close" popovertarget="toast" popovertargetaction="hide" aria-label="Cerrar aviso">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div id="toast-live" class="visually-hidden" aria-live="polite"></div>
      </div>
    `;

    const sectionsEl = document.getElementById('menu-sections');
    const categoryRail = document.getElementById('category-rail');
    const topbarCartBtn = document.getElementById('topbar-cart-btn');
    const topbarCartCount = document.getElementById('topbar-cart-count');
    const floatingCart = document.getElementById('floating-cart');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const floatingCartCount = document.getElementById('floating-cart-count');
    const floatingCartTotal = document.getElementById('floating-cart-total');

    const dishDialog = document.getElementById('dish-dialog');
    const dishDialogTitle = document.getElementById('dish-dialog-title');
    const dishDialogBody = document.getElementById('dish-dialog-body');
    const dishAddBtn = document.getElementById('dish-add-btn');

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
    const toastMsgEl = document.getElementById('toast-msg');
    const toastLiveEl = document.getElementById('toast-live');

    // Dialog exit + closedby fallback
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
        const anims = dialog.getAnimations({ subtree: true });
        if (anims.length > 0) {
          await Promise.race([
            Promise.allSettled(anims.map((a) => a.finished)),
            new Promise((r) => setTimeout(r, 320)),
          ]);
        }
        if (!dialog.hasAttribute('data-closing')) return;
        dialog.removeAttribute('data-closing');
      }
      dialog.close();
    }

    function wireDialogs() {
      const dialogs = [dishDialog, cartDialog, qrDialog, ownerDialog];
      const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

      for (const d of dialogs) {
        d.addEventListener('cancel', (e) => {
          if (!supportsTopLayerExit()) {
            e.preventDefault();
            closeDialogSmooth(d);
          }
        });
        d.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-dialog]')) {
            closeDialogSmooth(d);
          }
        });
        if (!supportsClosedBy) {
          let outsideDown = false;
          const isOut = (e) => {
            const r = d.getBoundingClientRect();
            return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          };
          d.addEventListener('pointerdown', (e) => { outsideDown = isOut(e); });
          d.addEventListener('pointerup', (e) => {
            if (outsideDown && isOut(e)) closeDialogSmooth(d);
            outsideDown = false;
          });
        }
      }
    }

    function showToast(msg) {
      toastMsgEl.textContent = msg;
      if (typeof document.ariaNotify === 'function') {
        document.ariaNotify(msg);
      } else {
        toastLiveEl.textContent = '';
        requestAnimationFrame(() => { toastLiveEl.textContent = msg; });
      }
      if (typeof toastEl.showPopover === 'function') {
        try {
          if (toastEl.matches(':popover-open')) toastEl.hidePopover();
          toastEl.showPopover();
        } catch {
          // Ignore
        }
      }
      clearTimeout(toastTimer);
      const schedule = () => {
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          if (toastEl.contains(document.activeElement)) {
            schedule();
            return;
          }
          if (typeof toastEl.hidePopover === 'function' && toastEl.matches(':popover-open')) {
            toastEl.hidePopover();
          }
        }, 2400);
      };
      schedule();
    }

    // Menu rendering
    function renderMenu() {
      const visibleCategories =
        activeCategory === 'all'
          ? config.categories
          : config.categories.filter((c) => c.id === activeCategory);

      sectionsEl.innerHTML = visibleCategories
        .map((cat) => {
          const catItems = items.filter((item) => item.category === cat.id);
          if (catItems.length === 0) return '';
          return `
            <section aria-labelledby="cat-${escapeHtml(cat.id)}">
              <h2 class="menu-section__title" id="cat-${escapeHtml(cat.id)}">${escapeHtml(cat.label)}</h2>
              <div class="dish-grid">
                ${catItems
                  .map((item) => {
                    const pricePrefix = item.priceFrom ? 'Desde ' : '';
                    const tagHtml = item.soldOut
                      ? '<span class="dish-tag dish-tag--soldout">Agotado</span>'
                      : item.tag
                        ? `<span class="dish-tag dish-tag--highlight">${escapeHtml(item.tag)}</span>`
                        : '';
                    const hintHtml =
                      !item.soldOut && item.modifiers && item.modifiers.length > 0
                        ? '<span class="dish-card__hint">Personalizable</span>'
                        : '';
                    return `
                      <article class="dish-card ${item.soldOut ? 'dish-card--soldout' : ''}">
                        <button type="button" class="dish-card__btn" data-open-dish="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}, ${pricePrefix}${formatBs(item.price)}">
                          <div class="dish-card__info">
                            <div class="dish-card__top">
                              <h3 class="dish-card__name">${escapeHtml(item.name)}</h3>
                              ${tagHtml}
                            </div>
                            <p class="dish-card__desc">${escapeHtml(item.description)}</p>
                            <div class="dish-card__price-row">
                              <span class="dish-card__price">${pricePrefix}${formatBs(item.price)}</span>
                              ${hintHtml}
                            </div>
                          </div>
                          <div class="dish-card__media">
                            <img class="dish-card__img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="eager" decoding="async">
                            <div class="dish-card__fallback" aria-hidden="true">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                              </svg>
                            </div>
                          </div>
                        </button>
                      </article>
                    `;
                  })
                  .join('')}
              </div>
            </section>
          `;
        })
        .join('');

      for (const img of sectionsEl.querySelectorAll('.dish-card__img')) {
        img.addEventListener('error', () => {
          img.closest('.dish-card__media')?.classList.add('is-fallback');
        });
      }
    }

    // Dish Customization Sheet
    function computeDishUnitPrice(item, state) {
      let total = item.price;
      for (const mod of item.modifiers || []) {
        if (mod.type === 'radio') {
          const picked = mod.options.find((o) => o.id === state.selections[mod.id]);
          if (picked && picked.delta) total += picked.delta;
        } else if (mod.type === 'checkbox') {
          const pickedIds = state.selections[mod.id] || [];
          for (const opt of mod.options) {
            if (pickedIds.includes(opt.id) && opt.delta) total += opt.delta;
          }
        }
      }
      return total;
    }

    function openDishSheet(itemId) {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const selections = {};
      for (const mod of item.modifiers || []) {
        if (mod.type === 'radio') {
          selections[mod.id] = mod.options[0].id;
        } else if (mod.type === 'checkbox') {
          selections[mod.id] = [];
        } else if (mod.type === 'text') {
          selections[mod.id] = '';
        }
      }

      activeDishState = { itemId: item.id, qty: 1, selections };
      renderDishSheet();
      dishDialog.showModal();
    }

    function renderDishSheet() {
      if (!activeDishState) return;
      const item = items.find((i) => i.id === activeDishState.itemId);
      if (!item) return;

      dishDialogTitle.textContent = item.name;
      const unitPrice = computeDishUnitPrice(item, activeDishState);

      const modsHtml = (item.modifiers || [])
        .map((mod) => {
          if (mod.type === 'radio') {
            return `
              <fieldset class="mod-group">
                <div class="mod-group__head">
                  <legend class="mod-group__title">${escapeHtml(mod.label)}</legend>
                  <span class="mod-badge ${mod.required ? 'mod-badge--req' : ''}">${mod.required ? 'Obligatorio' : 'Opcional'}</span>
                </div>
                <div class="mod-options">
                  ${mod.options
                    .map((opt) => {
                      const checked = activeDishState.selections[mod.id] === opt.id;
                      const deltaLabel = opt.delta > 0 ? `+Bs ${opt.delta}` : 'Incluido';
                      return `
                        <label class="mod-opt">
                          <span class="mod-opt__left">
                            <input type="radio" name="mod-${escapeHtml(mod.id)}" value="${escapeHtml(opt.id)}" data-mod-radio="${escapeHtml(mod.id)}" ${checked ? 'checked' : ''} ${item.soldOut ? 'disabled' : ''}>
                            <span>${escapeHtml(opt.label)}</span>
                          </span>
                          <span class="mod-opt__delta">${deltaLabel}</span>
                        </label>
                      `;
                    })
                    .join('')}
                </div>
              </fieldset>
            `;
          }

          if (mod.type === 'checkbox') {
            const selectedArr = activeDishState.selections[mod.id] || [];
            return `
              <fieldset class="mod-group">
                <div class="mod-group__head">
                  <legend class="mod-group__title">${escapeHtml(mod.label)}</legend>
                  <span class="mod-badge">Opcional</span>
                </div>
                <div class="mod-options">
                  ${mod.options
                    .map((opt) => {
                      const checked = selectedArr.includes(opt.id);
                      const deltaLabel = opt.delta > 0 ? `+Bs ${opt.delta}` : 'Gratis';
                      return `
                        <label class="mod-opt">
                          <span class="mod-opt__left">
                            <input type="checkbox" value="${escapeHtml(opt.id)}" data-mod-check="${escapeHtml(mod.id)}" ${checked ? 'checked' : ''} ${item.soldOut ? 'disabled' : ''}>
                            <span>${escapeHtml(opt.label)}</span>
                          </span>
                          <span class="mod-opt__delta">${deltaLabel}</span>
                        </label>
                      `;
                    })
                    .join('')}
                </div>
              </fieldset>
            `;
          }

          if (mod.type === 'text') {
            return `
              <div class="mod-group field">
                <div class="mod-group__head">
                  <label class="mod-group__title" for="mod-text-${escapeHtml(mod.id)}">${escapeHtml(mod.label)}</label>
                  <span class="mod-badge">Opcional</span>
                </div>
                <input
                  id="mod-text-${escapeHtml(mod.id)}"
                  type="text"
                  maxlength="60"
                  placeholder="${escapeHtml(mod.placeholder || '')}"
                  value="${escapeHtml(activeDishState.selections[mod.id] || '')}"
                  data-mod-text="${escapeHtml(mod.id)}"
                  ${item.soldOut ? 'disabled' : ''}
                >
              </div>
            `;
          }
          return '';
        })
        .join('');

      dishDialogBody.innerHTML = `
        <div class="dish-hero">
          <img class="dish-hero__img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          <div>
            <p class="dish-hero__desc">${escapeHtml(item.description)}</p>
            <p class="dish-hero__price">${formatBs(unitPrice)}</p>
          </div>
        </div>
        ${modsHtml}
        <div class="qty-row">
          <span class="mod-group__title">Cantidad</span>
          <div class="stepper">
            <button type="button" class="stepper__btn" data-dish-qty="-1" aria-label="Restar cantidad" ${item.soldOut || activeDishState.qty <= 1 ? 'disabled' : ''}>−</button>
            <span class="stepper__val">${activeDishState.qty}</span>
            <button type="button" class="stepper__btn" data-dish-qty="1" aria-label="Sumar cantidad" ${item.soldOut || activeDishState.qty >= 12 ? 'disabled' : ''}>+</button>
          </div>
        </div>
      `;

      if (item.soldOut) {
        dishAddBtn.disabled = true;
        dishAddBtn.textContent = 'Agotado por hoy';
      } else {
        dishAddBtn.disabled = false;
        dishAddBtn.textContent = `Agregar al pedido · ${formatBs(unitPrice * activeDishState.qty)}`;
      }
    }

    function summarizeModifiers(item, selections) {
      const parts = [];
      for (const mod of item.modifiers || []) {
        if (mod.type === 'radio') {
          const opt = mod.options.find((o) => o.id === selections[mod.id]);
          if (opt) parts.push(`${mod.shortLabel || mod.label}: ${opt.label}`);
        } else if (mod.type === 'checkbox') {
          const picked = (selections[mod.id] || [])
            .map((id) => mod.options.find((o) => o.id === id)?.label)
            .filter(Boolean);
          if (picked.length > 0) parts.push(`${mod.shortLabel || mod.label}: ${picked.join(', ')}`);
        } else if (mod.type === 'text') {
          const text = (selections[mod.id] || '').trim();
          if (text) parts.push(`${mod.shortLabel || mod.label}: "${text}"`);
        }
      }
      return parts.join(' · ');
    }

    function addActiveDishToCart() {
      if (!activeDishState) return;
      const item = items.find((i) => i.id === activeDishState.itemId);
      if (!item || item.soldOut) return;

      const unitPrice = computeDishUnitPrice(item, activeDishState);
      const summary = summarizeModifiers(item, activeDishState.selections);
      const key = `${item.id}__${summary}`;

      const existing = cart.find((c) => c.key === key);
      if (existing) {
        existing.qty += activeDishState.qty;
        existing.unitPrice = unitPrice;
      } else {
        cart.push({
          key,
          itemId: item.id,
          name: item.name,
          summary,
          unitPrice,
          qty: activeDishState.qty,
        });
      }

      saveCart();
      syncCartBadges();
      const dishName = item.name;
      closeDialogSmooth(dishDialog).then(() => {
        showToast(`Agregado: ${dishName}`);
      });
    }

    // Cart & Checkout
    function getCartTotals() {
      let count = 0;
      let subtotal = 0;
      for (const entry of cart) {
        count += entry.qty;
        subtotal += entry.unitPrice * entry.qty;
      }
      const mode = config.fulfillmentModes.find((m) => m.id === fulfillmentMode) || config.fulfillmentModes[0];
      const zoneObj = LA_PAZ_ZONES.find((z) => z.id === selectedZone) || LA_PAZ_ZONES[0];
      const deliveryCost = mode.id === 'delivery' ? zoneObj.cost : 0;
      return { count, subtotal, mode, zoneObj, deliveryCost, total: subtotal + deliveryCost };
    }

    function syncCartBadges() {
      const { count, subtotal } = getCartTotals();
      topbarCartCount.textContent = String(count);
      topbarCartCount.hidden = count === 0;
      floatingCartCount.textContent = String(count);
      floatingCartTotal.textContent = formatBs(subtotal);
      floatingCart.hidden = count === 0;
    }

    function buildWhatsAppText() {
      const { subtotal, mode, zoneObj, deliveryCost, total } = getCartTotals();
      const lines = [`Hola ${config.name}, quiero hacer este pedido:`, ''];

      for (const entry of cart) {
        const lineTotal = entry.unitPrice * entry.qty;
        lines.push(`• ${entry.qty}x ${entry.name} — ${formatBs(lineTotal)}`);
        if (entry.summary) {
          lines.push(`  (${entry.summary})`);
        }
      }

      lines.push('');
      lines.push(`Modalidad: ${mode.label}`);
      if (mode.id === 'mesa' && tableNumber.trim()) {
        lines.push(`N° de mesa: ${tableNumber.trim()}`);
      }
      if (mode.id === 'encargo' && (pickupDate || pickupTime)) {
        lines.push(`Fecha / hora de encargo: ${pickupDate || 'Por confirmar'} ${pickupTime || ''}`.trim());
      }
      if (mode.id === 'delivery') {
        lines.push(`Zona (La Paz): ${zoneObj.label} (+Bs ${zoneObj.cost})`);
        if (deliveryAddress.trim()) {
          lines.push(`Dirección / referencia: ${deliveryAddress.trim()}`);
        }
      }
      if (customerName.trim()) {
        lines.push(`Nombre: ${customerName.trim()}`);
      }

      lines.push('');
      lines.push(`Subtotal: ${formatBs(subtotal)}`);
      if (deliveryCost > 0) {
        lines.push(`Delivery: ${formatBs(deliveryCost)}`);
      }
      lines.push(`Total: ${formatBs(total)}`);
      return lines.join('\n');
    }

    function buildWhatsAppUrl() {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppText())}`;
    }

    function renderCartDialog() {
      const { count, subtotal, mode, zoneObj, deliveryCost, total } = getCartTotals();

      if (count === 0) {
        cartDialogBody.innerHTML = `
          <div class="empty-state">
            <p class="empty-state__title">Tu pedido está vacío</p>
            <p class="empty-state__desc">Toca cualquier plato de la carta para agregarlo.</p>
          </div>
        `;
        cartDialogFooter.innerHTML = `<button type="button" class="btn btn--secondary btn--full" data-close-dialog>Ver la carta</button>`;
        return;
      }

      let extraFieldsHtml = '';
      if (mode.id === 'mesa') {
        extraFieldsHtml = `
          <div class="form-grid form-grid--2">
            <div class="field">
              <label for="f-mesa">N° de mesa</label>
              <input id="f-mesa" type="text" inputmode="numeric" placeholder="Ej. 4" value="${escapeHtml(tableNumber)}">
            </div>
            <div class="field">
              <label for="f-name">Tu nombre (opcional)</label>
              <input id="f-name" type="text" autocomplete="name" placeholder="Ej. Andrea" value="${escapeHtml(customerName)}">
            </div>
          </div>
        `;
      } else if (mode.id === 'encargo') {
        extraFieldsHtml = `
          <div class="form-grid form-grid--2">
            <div class="field">
              <label for="f-date">Fecha de recojo</label>
              <input id="f-date" type="date" value="${escapeHtml(pickupDate)}">
            </div>
            <div class="field">
              <label for="f-time">Hora aproximada</label>
              <input id="f-time" type="time" value="${escapeHtml(pickupTime)}">
            </div>
          </div>
          <div class="field">
            <label for="f-name">Tu nombre (opcional)</label>
            <input id="f-name" type="text" autocomplete="name" placeholder="Ej. Lucía Mendoza" value="${escapeHtml(customerName)}">
          </div>
        `;
      } else if (mode.id === 'delivery') {
        extraFieldsHtml = `
          <fieldset class="checkout-block" style="border-block-start:0;padding-block-start:0;margin-block-start:0.25rem;">
            <legend class="checkout-block__title">Zona de entrega en La Paz</legend>
            <div class="mod-options">
              ${LA_PAZ_ZONES.map(
                (z) => `
                <label class="mod-opt">
                  <span class="mod-opt__left">
                    <input type="radio" name="lp-zone" value="${z.id}" ${z.id === selectedZone ? 'checked' : ''}>
                    <span>${escapeHtml(z.label)}</span>
                  </span>
                  <span class="mod-opt__delta">+Bs ${z.cost}</span>
                </label>`
              ).join('')}
            </div>
          </fieldset>
          <div class="form-grid form-grid--2">
            <div class="field">
              <label for="f-name">Tu nombre (opcional)</label>
              <input id="f-name" type="text" autocomplete="name" placeholder="Ej. Carlos" value="${escapeHtml(customerName)}">
            </div>
            <div class="field">
              <label for="f-addr">Calle / referencia</label>
              <input id="f-addr" type="text" autocomplete="street-address" placeholder="Ej. Av. Arce esq. Campos" value="${escapeHtml(deliveryAddress)}">
            </div>
          </div>
        `;
      } else {
        extraFieldsHtml = `
          <div class="field">
            <label for="f-name">Tu nombre (opcional)</label>
            <input id="f-name" type="text" autocomplete="name" placeholder="Ej. Diego" value="${escapeHtml(customerName)}">
          </div>
        `;
      }

      cartDialogBody.innerHTML = `
        <div class="cart-items">
          ${cart
            .map(
              (entry) => `
              <div class="cart-item">
                <div>
                  <p class="cart-item__name">${escapeHtml(entry.name)}</p>
                  ${entry.summary ? `<p class="cart-item__mods">${escapeHtml(entry.summary)}</p>` : ''}
                  <p class="cart-item__price">${formatBs(entry.unitPrice * entry.qty)}</p>
                </div>
                <div class="stepper stepper--sm">
                  <button type="button" class="stepper__btn" data-cart-key="${escapeHtml(entry.key)}" data-delta="-1" aria-label="Quitar uno">−</button>
                  <span class="stepper__val">${entry.qty}</span>
                  <button type="button" class="stepper__btn" data-cart-key="${escapeHtml(entry.key)}" data-delta="1" aria-label="Agregar uno">+</button>
                </div>
              </div>`
            )
            .join('')}
        </div>

        <fieldset class="checkout-block">
          <legend class="checkout-block__title">Modalidad de pedido</legend>
          <div class="mod-options">
            ${config.fulfillmentModes
              .map(
                (m) => `
                <label class="mod-opt">
                  <span class="mod-opt__left">
                    <input type="radio" name="fulfillment-mode" value="${m.id}" ${m.id === fulfillmentMode ? 'checked' : ''}>
                    <span>${escapeHtml(m.label)}</span>
                  </span>
                  <span class="mod-opt__delta">${escapeHtml(m.hint)}</span>
                </label>`
              )
              .join('')}
          </div>
        </fieldset>

        <div class="checkout-block">
          ${extraFieldsHtml}
        </div>
      `;

      cartDialogFooter.innerHTML = `
        <div class="summary-box">
          <div class="summary-row"><span>Subtotal</span><span>${formatBs(subtotal)}</span></div>
          ${
            deliveryCost > 0
              ? `<div class="summary-row"><span>Delivery (${escapeHtml(zoneObj.label)})</span><span>${formatBs(deliveryCost)}</span></div>`
              : ''
          }
          <div class="summary-row summary-row--total"><span>Total</span><span>${formatBs(total)}</span></div>
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
            <button type="button" class="btn btn--ghost" id="copy-order-btn">Copiar pedido</button>
          </div>
        </div>
      `;

      const syncWa = () => {
        const wa = document.getElementById('wa-send-link');
        if (wa) wa.href = buildWhatsAppUrl();
      };

      document.getElementById('f-mesa')?.addEventListener('input', (e) => { tableNumber = e.target.value; syncWa(); });
      document.getElementById('f-date')?.addEventListener('change', (e) => { pickupDate = e.target.value; syncWa(); });
      document.getElementById('f-time')?.addEventListener('change', (e) => { pickupTime = e.target.value; syncWa(); });
      document.getElementById('f-name')?.addEventListener('input', (e) => { customerName = e.target.value; syncWa(); });
      document.getElementById('f-addr')?.addEventListener('input', (e) => { deliveryAddress = e.target.value; syncWa(); });
    }

    async function copyOrder() {
      const text = buildWhatsAppText();
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
      const btn = document.getElementById('copy-order-btn');
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = 'Pedido copiado';
        setTimeout(() => { btn.textContent = prev; }, 1600);
      }
    }

    // Owner Mode
    function renderOwnerList() {
      ownerList.innerHTML = items
        .map(
          (item) => `
          <div class="owner-row">
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
            <button
              type="button"
              class="soldout-toggle"
              data-owner-soldout="${escapeHtml(item.id)}"
              aria-pressed="${item.soldOut}"
            >${item.soldOut ? 'Agotado' : 'Disponible'}</button>
          </div>`
        )
        .join('');
    }

    // Events
    categoryRail.addEventListener('click', (e) => {
      const pill = e.target.closest('[data-cat]');
      if (!pill) return;
      activeCategory = pill.dataset.cat;
      for (const b of categoryRail.querySelectorAll('[data-cat]')) {
        b.setAttribute('aria-pressed', String(b.dataset.cat === activeCategory));
      }
      pill.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      renderMenu();
    });

    sectionsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-dish]');
      if (!btn) return;
      openDishSheet(btn.dataset.openDish);
    });

    dishDialogBody.addEventListener('change', (e) => {
      if (!activeDishState) return;
      const radio = e.target.closest('[data-mod-radio]');
      if (radio) {
        activeDishState.selections[radio.dataset.modRadio] = radio.value;
        renderDishSheet();
        return;
      }
      const check = e.target.closest('[data-mod-check]');
      if (check) {
        const modId = check.dataset.modCheck;
        const arr = new Set(activeDishState.selections[modId] || []);
        if (check.checked) arr.add(check.value);
        else arr.delete(check.value);
        activeDishState.selections[modId] = Array.from(arr);
        renderDishSheet();
      }
    });

    dishDialogBody.addEventListener('input', (e) => {
      const textInput = e.target.closest('[data-mod-text]');
      if (textInput && activeDishState) {
        activeDishState.selections[textInput.dataset.modText] = textInput.value;
      }
    });

    dishDialogBody.addEventListener('click', (e) => {
      const qtyBtn = e.target.closest('[data-dish-qty]');
      if (!qtyBtn || !activeDishState) return;
      const next = activeDishState.qty + Number(qtyBtn.dataset.dishQty);
      if (next >= 1 && next <= 12) {
        activeDishState.qty = next;
        renderDishSheet();
      }
    });

    dishAddBtn.addEventListener('click', addActiveDishToCart);

    const openCart = () => {
      renderCartDialog();
      cartDialog.showModal();
    };
    topbarCartBtn.addEventListener('click', openCart);
    floatingCartBtn.addEventListener('click', openCart);

    cartDialogBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-key]');
      if (!btn) return;
      const idx = cart.findIndex((c) => c.key === btn.dataset.cartKey);
      if (idx === -1) return;
      cart[idx].qty += Number(btn.dataset.delta);
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      saveCart();
      syncCartBadges();
      renderCartDialog();
    });

    cartDialogBody.addEventListener('change', (e) => {
      const modeInput = e.target.closest('input[name="fulfillment-mode"]');
      if (modeInput) {
        fulfillmentMode = modeInput.value;
        renderCartDialog();
        return;
      }
      const zoneInput = e.target.closest('input[name="lp-zone"]');
      if (zoneInput) {
        selectedZone = zoneInput.value;
        renderCartDialog();
      }
    });

    cartDialogFooter.addEventListener('click', (e) => {
      if (e.target.closest('#open-qr-btn')) {
        const { total } = getCartTotals();
        qrAmountBadge.textContent = `Total del pedido: ${formatBs(total)}`;
        qrDialog.showModal();
        return;
      }
      if (e.target.closest('#copy-order-btn')) {
        copyOrder();
      }
    });

    ownerOpenBtn.addEventListener('click', () => {
      renderOwnerList();
      ownerDialog.showModal();
    });

    ownerList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-owner-soldout]');
      if (!btn) return;
      const item = items.find((i) => i.id === btn.dataset.ownerSoldout);
      if (!item) return;
      item.soldOut = !item.soldOut;
      saveItems();
      renderOwnerList();
      renderMenu();
    });

    ownerList.addEventListener('change', (e) => {
      const input = e.target.closest('[data-owner-price]');
      if (!input) return;
      const item = items.find((i) => i.id === input.dataset.ownerPrice);
      if (!item) return;
      const val = Math.round(Number(input.value));
      if (Number.isFinite(val) && val > 0) {
        item.price = val;
        saveItems();
        renderMenu();
      } else {
        input.value = String(item.price);
      }
    });

    ownerResetBtn.addEventListener('click', () => {
      items = cloneDefaults();
      localStorage.removeItem(STORAGE_MENU_KEY);
      renderOwnerList();
      renderMenu();
    });

    wireDialogs();
    renderMenu();
    syncCartBadges();
  }

  window.initMenuQR = initMenuQR;
})();
