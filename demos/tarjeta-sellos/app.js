(() => {
  const STORAGE_KEY = 'cafe_altura_sellos_v1';
  const MAX_STAMPS = 8;

  const SEED_CUSTOMERS = [
    { phone: '70123456', name: 'Valeria', stamps: 6, redeemed: 1 },
    { phone: '71598765', name: 'Mateo', stamps: 8, redeemed: 2 },
    { phone: '76543210', name: 'Camila', stamps: 2, redeemed: 0 },
  ];

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function cloneSeed() {
    return SEED_CUSTOMERS.map((c) => ({ ...c }));
  }

  function loadCustomers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneSeed();
    } catch {
      return cloneSeed();
    }
  }

  function saveCustomers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch { /* ignore */ }
  }

  function qrMiniSvg() {
    return `
      <svg width="64" height="64" viewBox="0 0 29 29" shape-rendering="crispEdges" role="img" aria-label="Código QR de cliente">
        <rect width="29" height="29" fill="#FFFFFF"/>
        <path fill="#1C1917" d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"/>
        <path fill="#1C1917" d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"/>
        <path fill="#1C1917" d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"/>
        <path fill="#1C1917" d="M10,1 h2 v2 h-2 z M14,1 h2 v2 h-2 z M18,1 h1 v3 h-1 z M10,4 h2 v2 h-2 z M13,4 h3 v2 h-3 z M17,5 h2 v2 h-2 z M1,10 h3 v2 h-3 z M5,10 h2 v2 h-2 z M9,10 h3 v2 h-3 z M14,10 h2 v3 h-2 z M18,10 h3 v2 h-3 z M23,10 h3 v2 h-3 z M1,14 h2 v2 h-2 z M5,13 h3 v3 h-3 z M10,14 h3 v2 h-3 z M15,14 h3 v2 h-3 z M20,13 h2 v3 h-2 z M24,14 h3 v2 h-3 z M10,17 h2 v2 h-2 z M14,17 h2 v2 h-2 z M18,17 h3 v2 h-3 z M23,17 h2 v3 h-2 z M10,21 h3 v2 h-3 z M15,21 h2 v2 h-2 z M19,21 h3 v2 h-3 z M24,21 h3 v2 h-3 z M10,25 h2 v3 h-2 z M14,24 h3 v3 h-3 z M19,25 h2 v2 h-2 z M23,24 h2 v3 h-2 z M26,25 h2 v3 h-2 z"/>
      </svg>
    `;
  }

  function coffeeSealSvg() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
        <line x1="6" x2="6" y1="2" y2="4"/>
        <line x1="10" x2="10" y1="2" y2="4"/>
        <line x1="14" x2="14" y1="2" y2="4"/>
      </svg>
    `;
  }

  let customers = loadCustomers();
  let activeView = 'caja';
  let selectedPhone = customers[0].phone;
  let lastStampedIndex = -1;
  let toastTimer = null;

  const paramPhone = new URLSearchParams(window.location.search).get('cliente');
  if (paramPhone) {
    const clean = paramPhone.replace(/\D/g, '');
    const match = customers.find((c) => c.phone === clean);
    if (match) {
      activeView = 'cliente';
      selectedPhone = match.phone;
    }
  }

  const viewCajaEl = document.getElementById('view-caja');
  const viewClienteEl = document.getElementById('view-cliente');
  const newClientBtn = document.getElementById('open-new-client-btn');

  const phoneSearchForm = document.getElementById('phone-search-form');
  const phoneSearchInput = document.getElementById('phone-search-input');
  const cajaChipsEl = document.getElementById('caja-chips');
  const cashierCardHost = document.getElementById('cashier-card-host');

  const clientChipsEl = document.getElementById('client-chips');
  const clientCardHost = document.getElementById('client-card-host');

  const newClientDialog = document.getElementById('new-client-dialog');
  const newClientForm = document.getElementById('new-client-form');
  const resetBtn = document.getElementById('reset-demo-btn');

  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toast-msg');
  const toastLiveEl = document.getElementById('toast-live');

  function showToast(msg) {
    toastMsgEl.textContent = msg;
    if (typeof document.ariaNotify === 'function') document.ariaNotify(msg);
    else {
      toastLiveEl.textContent = '';
      requestAnimationFrame(() => { toastLiveEl.textContent = msg; });
    }
    if (typeof toastEl.showPopover === 'function') {
      try {
        if (toastEl.matches(':popover-open')) toastEl.hidePopover();
        toastEl.showPopover();
      } catch { /* ignore */ }
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (typeof toastEl.hidePopover === 'function' && toastEl.matches(':popover-open')) {
        toastEl.hidePopover();
      }
    }, 2400);
  }

  function getClientUrl(phone) {
    const url = new URL(window.location.href);
    url.searchParams.set('cliente', phone);
    return url.toString();
  }

  function buildCardWhatsAppUrl(c) {
    const remaining = Math.max(0, MAX_STAMPS - c.stamps);
    const statusLine =
      c.stamps >= MAX_STAMPS
        ? '¡Ya completaste tus 8 sellos y tienes tu café gratis listo para canjear!'
        : `Llevas ${c.stamps} de ${MAX_STAMPS} sellos (te faltan ${remaining} para tu café gratis).`;
    const msg = [
      `Hola ${c.name}, aquí tienes tu Tarjeta Digital de Sellos de Café Altura (Sopocachi):`,
      statusLine,
      getClientUrl(c.phone),
    ].join('\n');
    const waPhone = c.phone.startsWith('591') ? c.phone : `591${c.phone}`;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  }

  function switchView(view, phone) {
    activeView = view;
    viewCajaEl.hidden = view !== 'caja';
    viewClienteEl.hidden = view !== 'cliente';
    newClientBtn.hidden = view !== 'caja';

    for (const btn of document.querySelectorAll('[data-switch-view]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.switchView === view));
    }

    const url = new URL(window.location.href);
    if (view === 'cliente') {
      if (phone) selectedPhone = phone;
      url.searchParams.set('cliente', selectedPhone);
      renderClientView();
    } else {
      url.searchParams.delete('cliente');
      renderCajaView();
    }
    window.history.replaceState(null, '', url);
  }

  function renderChips(containerEl) {
    containerEl.innerHTML = `
      <span class="chips-label">Clientes:</span>
      ${customers
        .map(
          (c) =>
            `<button type="button" class="chip-btn" data-pick-phone="${escapeHtml(c.phone)}" aria-pressed="${c.phone === selectedPhone}">${escapeHtml(c.name)} · ${escapeHtml(c.phone)}</button>`
        )
        .join('')}
    `;
  }

  function renderCajaView() {
    renderChips(cajaChipsEl);
    phoneSearchInput.value = selectedPhone;

    const c = customers.find((item) => item.phone === selectedPhone);
    if (!c) {
      cashierCardHost.innerHTML = `
        <div class="cashier-card">
          <p class="customer-name">Cliente no registrado (${escapeHtml(selectedPhone)})</p>
          <p class="customer-phone">Puedes registrarlo en 5 segundos con el botón "+ Nuevo cliente".</p>
        </div>
      `;
      return;
    }

    const isReady = c.stamps >= MAX_STAMPS;
    const dotsHtml = Array.from({ length: MAX_STAMPS }, (_, i) => {
      const filled = i < c.stamps;
      const cls = isReady ? 'mini-dot mini-dot--ready' : filled ? 'mini-dot mini-dot--filled' : 'mini-dot';
      return `<span class="${cls}" aria-hidden="true"></span>`;
    }).join('');

    cashierCardHost.innerHTML = `
      <article class="cashier-card">
        <div class="cashier-head">
          <div>
            <h2 class="customer-name">${escapeHtml(c.name)}</h2>
            <p class="customer-phone">Celular: ${escapeHtml(c.phone)} · Premios canjeados: ${c.redeemed}</p>
          </div>
          <span class="progress-pill ${isReady ? 'progress-pill--ready' : ''}">
            ${isReady ? '¡Premio listo! 8 / 8' : `${c.stamps} / ${MAX_STAMPS} sellos`}
          </span>
        </div>

        <div class="mini-dots" aria-label="${c.stamps} de ${MAX_STAMPS} sellos">${dotsHtml}</div>

        <div class="cashier-actions">
          ${
            isReady
              ? `<button type="button" class="btn btn--reward btn--full" data-redeem-phone="${escapeHtml(c.phone)}">Canjear premio y reiniciar tarjeta</button>`
              : `<button type="button" class="btn btn--primary btn--full" data-add-stamp="${escapeHtml(c.phone)}">+ Sumar 1 sello</button>`
          }
          <div class="actions-2col">
            <a class="btn btn--secondary btn--sm" href="${escapeHtml(buildCardWhatsAppUrl(c))}" target="_blank" rel="noopener noreferrer">Enviar tarjeta por WhatsApp</a>
            <button type="button" class="btn btn--ghost btn--sm" data-open-client="${escapeHtml(c.phone)}">Ver como cliente</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderClientView() {
    renderChips(clientChipsEl);
    const c = customers.find((item) => item.phone === selectedPhone) || customers[0];
    selectedPhone = c.phone;

    const isReady = c.stamps >= MAX_STAMPS;
    const missing = Math.max(0, MAX_STAMPS - c.stamps);

    const slotsHtml = Array.from({ length: MAX_STAMPS }, (_, i) => {
      const filled = i < c.stamps;
      const isPop = i === lastStampedIndex;
      const cls = isReady
        ? `stamp-slot stamp-slot--reward ${isPop ? 'stamp-slot--pop' : ''}`
        : filled
          ? `stamp-slot stamp-slot--filled ${isPop ? 'stamp-slot--pop' : ''}`
          : 'stamp-slot';
      return `<div class="${cls}" aria-label="Sello ${i + 1}: ${filled ? 'completado' : 'pendiente'}">${filled ? coffeeSealSvg() : i + 1}</div>`;
    }).join('');

    lastStampedIndex = -1;

    clientCardHost.innerHTML = `
      <article class="stamp-card" aria-label="Tarjeta digital de sellos de ${escapeHtml(c.name)}">
        <div class="stamp-card__top">
          <div>
            <p class="stamp-card__brand">Café Altura</p>
            <p class="stamp-card__loc">Sopocachi · La Paz · 8 sellos = 1 café gratis</p>
          </div>
          <span class="stamp-card__count">${c.stamps}/${MAX_STAMPS}</span>
        </div>

        <div class="stamp-card__body">
          <div class="stamps-grid">${slotsHtml}</div>
          <p class="status-banner ${isReady ? 'status-banner--ready' : ''}">
            ${
              isReady
                ? '¡Premio disponible! Muestra esta pantalla en caja'
                : missing === 1
                  ? 'Te falta 1 sello para tu café gratis'
                  : `Te faltan ${missing} sellos para tu café gratis`
            }
          </p>
        </div>

        <div class="stamp-card__foot">
          <div class="client-id-meta">
            <span class="client-id-meta__label">Titular · N° de cliente</span>
            <span class="client-id-meta__val">${escapeHtml(c.name)} · ${escapeHtml(c.phone)}</span>
            <span class="client-id-meta__sub">Muestra este código en caja al pagar</span>
          </div>
          <div class="qr-mini">${qrMiniSvg()}</div>
        </div>
      </article>
    `;
  }

  // Events
  document.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-switch-view]');
    if (sw) {
      switchView(sw.dataset.switchView);
      return;
    }
    const pick = e.target.closest('[data-pick-phone]');
    if (pick) {
      selectedPhone = pick.dataset.pickPhone;
      if (activeView === 'caja') renderCajaView();
      else {
        const url = new URL(window.location.href);
        url.searchParams.set('cliente', selectedPhone);
        window.history.replaceState(null, '', url);
        renderClientView();
      }
      return;
    }
    const addStamp = e.target.closest('[data-add-stamp]');
    if (addStamp) {
      const c = customers.find((item) => item.phone === addStamp.dataset.addStamp);
      if (c && c.stamps < MAX_STAMPS) {
        c.stamps += 1;
        lastStampedIndex = c.stamps - 1;
        saveCustomers();
        renderCajaView();
        showToast(
          c.stamps >= MAX_STAMPS
            ? `¡${c.name} completó 8/8! Premio listo para canjear`
            : `Sello sumado a ${c.name} (${c.stamps}/${MAX_STAMPS})`
        );
      }
      return;
    }
    const redeem = e.target.closest('[data-redeem-phone]');
    if (redeem) {
      const c = customers.find((item) => item.phone === redeem.dataset.redeemPhone);
      if (c) {
        c.stamps = 0;
        c.redeemed += 1;
        saveCustomers();
        renderCajaView();
        showToast(`Premio canjeado para ${c.name}. Tarjeta reiniciada a 0/8`);
      }
      return;
    }
    const openClient = e.target.closest('[data-open-client]');
    if (openClient) {
      switchView('cliente', openClient.dataset.openClient);
      return;
    }
    if (e.target.closest('[data-close-dialog]')) {
      e.target.closest('dialog')?.close();
    }
  });

  phoneSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cleaned = phoneSearchInput.value.replace(/\D/g, '');
    if (cleaned) {
      selectedPhone = cleaned;
      renderCajaView();
    }
  });

  newClientBtn.addEventListener('click', () => {
    newClientForm.reset();
    newClientDialog.showModal();
  });

  newClientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(newClientForm);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').replace(/\D/g, '');
    if (!name || !phone) return;

    const existing = customers.find((c) => c.phone === phone);
    if (existing) {
      selectedPhone = existing.phone;
      showToast(`${existing.name} ya estaba registrado`);
    } else {
      customers.unshift({ phone, name, stamps: 1, redeemed: 0 });
      selectedPhone = phone;
      lastStampedIndex = 0;
      saveCustomers();
      showToast(`${name} registrado con 1/8 sello inicial`);
    }
    renderCajaView();
    newClientDialog.close();
  });

  resetBtn.addEventListener('click', () => {
    customers = cloneSeed();
    localStorage.removeItem(STORAGE_KEY);
    selectedPhone = customers[0].phone;
    renderCajaView();
    renderClientView();
    showToast('Datos de ejemplo restaurados');
  });

  if (activeView === 'cliente') {
    switchView('cliente', selectedPhone);
  } else {
    renderCajaView();
  }
})();
