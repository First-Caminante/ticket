(() => {
  const DEFAULT_WA_NUMBER = '59177398405';

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatBs(n) {
    return `Bs ${Math.max(0, Math.round(Number(n) || 0))}`;
  }

  function nowLabel() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `Hoy · ${hh}:${mm}`;
  }

  function normalizeWaPhone(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return DEFAULT_WA_NUMBER;
    if (digits.startsWith('591')) return digits;
    if (digits.length === 8) return `591${digits}`;
    return digits;
  }

  function qrSvgMarkup(size = 168) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 29 29" shape-rendering="crispEdges" role="img" aria-label="Código QR de seguimiento">
        <rect width="29" height="29" fill="#FFFFFF"/>
        <path fill="#111111" d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"/>
        <path fill="#111111" d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"/>
        <path fill="#111111" d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"/>
        <path fill="#111111" d="M10,1 h2 v2 h-2 z M14,1 h2 v2 h-2 z M18,1 h1 v3 h-1 z M10,4 h2 v2 h-2 z M13,4 h3 v2 h-3 z M17,5 h2 v2 h-2 z M11,8 h3 v1 h-3 z M16,8 h2 v1 h-2 z M1,10 h3 v2 h-3 z M5,10 h2 v2 h-2 z M9,10 h3 v2 h-3 z M14,10 h2 v3 h-2 z M18,10 h3 v2 h-3 z M23,10 h3 v2 h-3 z M1,14 h2 v2 h-2 z M5,13 h3 v3 h-3 z M10,14 h3 v2 h-3 z M15,14 h3 v2 h-3 z M20,13 h2 v3 h-2 z M24,14 h3 v2 h-3 z M1,17 h3 v2 h-3 z M6,17 h2 v2 h-2 z M10,17 h2 v2 h-2 z M14,17 h2 v2 h-2 z M18,17 h3 v2 h-3 z M23,17 h2 v3 h-2 z M26,17 h2 v2 h-2 z M10,21 h3 v2 h-3 z M15,21 h2 v2 h-2 z M19,21 h3 v2 h-3 z M24,21 h3 v2 h-3 z M10,25 h2 v3 h-2 z M14,24 h3 v3 h-3 z M19,25 h2 v2 h-2 z M23,24 h2 v3 h-2 z M26,25 h2 v3 h-2 z"/>
      </svg>
    `;
  }

  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Imagen no válida'));
        img.onload = () => {
          const maxSide = 640;
          let { width, height } = img;
          if (width > maxSide || height > maxSide) {
            if (width >= height) {
              height = Math.round((height * maxSide) / width);
              width = maxSide;
            } else {
              width = Math.round((width * maxSide) / height);
              height = maxSide;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function initTracker(config) {
    const STORAGE_KEY = `tracker_orders_${config.id}_v1`;
    const STATES = config.states; // 5 ordered states: recibido, proceso, espera, listo, entregado

    function cloneSeed() {
      return config.seedOrders.map((o) => ({ ...o }));
    }

    function loadOrders() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return cloneSeed();
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneSeed();
      } catch {
        return cloneSeed();
      }
    }

    function saveOrders() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch {
        showToast('Almacenamiento lleno: intenta sin foto o restaura la demo');
      }
    }

    let orders = loadOrders();
    let activeView = 'taller';
    let activeFilter = 'all';
    let selectedClientOrderNum = String(orders[0]?.number || '');
    let pendingPhotoDataUrl = '';
    let toastTimer = null;

    // Check URL param ?orden=418
    const urlOrderParam = new URLSearchParams(window.location.search).get('orden');
    if (urlOrderParam) {
      const cleaned = urlOrderParam.replace(/\D/g, '');
      if (cleaned) {
        activeView = 'cliente';
        selectedClientOrderNum = cleaned;
      }
    }

    const root = document.getElementById('tracker-app');
    root.innerHTML = `
      <a href="#workspace" class="skip-link visually-hidden">Ir al contenido principal</a>

      <header class="topbar">
        <div class="container topbar__inner">
          <div class="topbar__left">
            <a href="../../" class="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
              </svg>
              Demos
            </a>
            <span class="topbar__divider" aria-hidden="true"></span>
            <span class="topbar__brand">${escapeHtml(config.name)}</span>
          </div>
          <button type="button" class="topbar__cta" id="new-order-btn">+ Nueva orden</button>
        </div>
      </header>

      <section class="shop-header">
        <div class="container shop-header__grid">
          <div>
            <h1 class="shop-title">${escapeHtml(config.name)}</h1>
            <p class="shop-meta">${escapeHtml(config.subtitle)} · ${escapeHtml(config.hours)}</p>
          </div>
          <div class="mode-switch" role="group" aria-label="Cambiar vista">
            <button type="button" class="mode-switch__btn" data-switch-view="taller" aria-pressed="${activeView === 'taller'}">Vista Taller (Dueño)</button>
            <button type="button" class="mode-switch__btn" data-switch-view="cliente" aria-pressed="${activeView === 'cliente'}">Vista Cliente (Seguimiento)</button>
          </div>
        </div>
      </section>

      <main id="workspace" class="tracker-main" tabindex="-1">
        <div class="container">
          <!-- VISTA TALLER -->
          <section class="view-panel" id="view-taller" ${activeView === 'taller' ? '' : 'hidden'}>
            <div class="kpi-strip" id="kpi-strip"></div>

            <div class="toolbar-row">
              <div class="filter-pills" role="group" aria-label="Filtrar órdenes por estado" id="status-filters">
                <button type="button" class="pill-btn" data-filter="all" aria-pressed="true">Todas</button>
                <button type="button" class="pill-btn" data-filter="proceso" aria-pressed="false">En proceso</button>
                <button type="button" class="pill-btn" data-filter="listo" aria-pressed="false">Listas</button>
                <button type="button" class="pill-btn" data-filter="entregado" aria-pressed="false">Entregadas</button>
              </div>
            </div>

            <div class="orders-grid" id="orders-grid"></div>
          </section>

          <!-- VISTA CLIENTE -->
          <section class="view-panel" id="view-cliente" ${activeView === 'cliente' ? '' : 'hidden'}>
            <div class="client-shell">
              <div class="search-box">
                <form class="search-form" id="client-search-form">
                  <label for="client-order-input" class="visually-hidden">Número de orden</label>
                  <input
                    id="client-order-input"
                    type="text"
                    inputmode="numeric"
                    placeholder="Ingresa tu N° de orden (ej. ${escapeHtml(config.seedOrders[0].number)})"
                    value="${escapeHtml(selectedClientOrderNum)}"
                    enterkeyhint="search"
                  >
                  <button type="submit" class="btn btn--primary">Buscar</button>
                </form>
                <div class="quick-chips" id="client-chips"></div>
              </div>

              <div id="client-result"></div>
            </div>
          </section>
        </div>
      </main>

      <footer class="tracker-footer">
        <div class="container tracker-footer__inner">
          <span class="footer-note">${escapeHtml(config.name)} · Seguimiento de órdenes con Ticket QR</span>
          <button type="button" class="reset-link" id="reset-demo-btn">Restaurar datos demo</button>
        </div>
      </footer>

      <!-- Modal 1: Nueva Orden -->
      <dialog class="sheet" id="new-order-dialog" closedby="any" aria-labelledby="new-order-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="new-order-title">Registrar nueva orden</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body">
          <form class="form-stack" id="new-order-form">
            <div class="form-grid-2">
              <div class="field">
                <label for="no-client">Nombre del cliente *</label>
                <input id="no-client" name="client" type="text" required autocomplete="name" placeholder="Ej. Rodrigo Mamani">
              </div>
              <div class="field">
                <label for="no-phone">WhatsApp (+591)</label>
                <input id="no-phone" name="phone" type="tel" inputmode="tel" placeholder="77398405">
              </div>
            </div>

            <div class="field">
              <label for="no-item">${escapeHtml(config.fields.itemLabel)} *</label>
              <input id="no-item" name="item" type="text" required placeholder="${escapeHtml(config.fields.itemPlaceholder)}">
            </div>

            <div class="field">
              <label for="no-work">${escapeHtml(config.fields.workLabel)} *</label>
              <textarea id="no-work" name="work" required placeholder="${escapeHtml(config.fields.workPlaceholder)}"></textarea>
            </div>

            <div class="form-grid-2">
              <div class="field">
                <label for="no-extra">${escapeHtml(config.fields.extraLabel)}</label>
                <input id="no-extra" name="extra" type="text" placeholder="${escapeHtml(config.fields.extraPlaceholder)}">
              </div>
              <div class="field">
                <label for="no-eta">Entrega estimada</label>
                <input id="no-eta" name="eta" type="text" placeholder="Ej. Hoy 18:00">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="field">
                <label for="no-total">Total (Bs) *</label>
                <input id="no-total" name="total" type="number" min="0" step="1" inputmode="numeric" required placeholder="150">
              </div>
              <div class="field">
                <label for="no-deposit">Adelanto (Bs)</label>
                <input id="no-deposit" name="deposit" type="number" min="0" step="1" inputmode="numeric" value="0">
              </div>
            </div>

            <div class="balance-preview">
              <span>Saldo pendiente calculado</span>
              <strong id="no-balance-preview">Bs 0</strong>
            </div>

            <div class="field photo-upload-box">
              <label for="no-photo">Foto de recepción (opcional)</label>
              <input id="no-photo" type="file" accept="image/*" capture="environment">
              <div class="photo-preview-wrap" id="no-photo-preview-wrap" hidden>
                <img id="no-photo-preview" class="order-thumb" alt="Vista previa de recepción">
                <button type="button" class="btn btn--ghost btn--sm" id="no-photo-clear">Quitar foto</button>
              </div>
            </div>
          </form>
        </div>
        <div class="sheet__footer">
          <button type="submit" form="new-order-form" class="btn btn--primary btn--full">Guardar y generar Ticket QR</button>
        </div>
      </dialog>

      <!-- Modal 2: Ticket QR Generado -->
      <dialog class="sheet sheet--narrow" id="ticket-dialog" closedby="any" aria-labelledby="ticket-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="ticket-title">Ticket QR generado</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body" id="ticket-dialog-body"></div>
        <div class="sheet__footer" id="ticket-dialog-footer"></div>
      </dialog>

      <!-- Modal 3: QR Simple Oficial del Taller -->
      <dialog class="sheet sheet--narrow" id="qr-pay-dialog" closedby="any" aria-labelledby="qr-pay-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <div class="sheet__header">
          <h2 class="sheet__title" id="qr-pay-title">QR Simple del taller</h2>
          <button type="button" class="sheet__close" data-close-dialog aria-label="Cerrar QR">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet__body">
          <div class="qr-card">
            <div>
              <strong>${escapeHtml(config.name)}</strong>
              <p class="shop-meta">Titular: ${escapeHtml(config.qrHolder)}</p>
            </div>
            <span class="status-badge status-badge--proceso tabular" id="qr-pay-amount">Saldo: Bs 0</span>
            <div class="qr-frame">${qrSvgMarkup(176)}</div>
            <p class="qr-notice"><strong>Aviso de seguridad:</strong> Verifica el nombre del titular antes de transferir y envía el comprobante por WhatsApp indicando tu N° de orden.</p>
          </div>
        </div>
        <div class="sheet__footer">
          <button type="button" class="btn btn--secondary btn--full" data-close-dialog>Cerrar</button>
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

    // DOM refs
    const viewTallerEl = document.getElementById('view-taller');
    const viewClienteEl = document.getElementById('view-cliente');
    const newOrderBtn = document.getElementById('new-order-btn');
    const kpiStripEl = document.getElementById('kpi-strip');
    const filtersEl = document.getElementById('status-filters');
    const ordersGridEl = document.getElementById('orders-grid');

    const clientSearchForm = document.getElementById('client-search-form');
    const clientOrderInput = document.getElementById('client-order-input');
    const clientChipsEl = document.getElementById('client-chips');
    const clientResultEl = document.getElementById('client-result');

    const newOrderDialog = document.getElementById('new-order-dialog');
    const newOrderForm = document.getElementById('new-order-form');
    const totalInput = document.getElementById('no-total');
    const depositInput = document.getElementById('no-deposit');
    const balancePreview = document.getElementById('no-balance-preview');
    const photoInput = document.getElementById('no-photo');
    const photoPreviewWrap = document.getElementById('no-photo-preview-wrap');
    const photoPreviewImg = document.getElementById('no-photo-preview');
    const photoClearBtn = document.getElementById('no-photo-clear');

    const ticketDialog = document.getElementById('ticket-dialog');
    const ticketBody = document.getElementById('ticket-dialog-body');
    const ticketFooter = document.getElementById('ticket-dialog-footer');

    const qrPayDialog = document.getElementById('qr-pay-dialog');
    const qrPayAmount = document.getElementById('qr-pay-amount');
    const resetDemoBtn = document.getElementById('reset-demo-btn');

    const toastEl = document.getElementById('toast');
    const toastMsgEl = document.getElementById('toast-msg');
    const toastLiveEl = document.getElementById('toast-live');

    // Dialog exit + closedby fallback
    let supportsDisplayTransition;
    function canTransitionDisplay() {
      if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
      if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
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
      const dialogs = [newOrderDialog, ticketDialog, qrPayDialog];
      const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;
      for (const d of dialogs) {
        d.addEventListener('cancel', (e) => {
          if (!supportsTopLayerExit()) {
            e.preventDefault();
            closeDialogSmooth(d);
          }
        });
        d.addEventListener('click', (e) => {
          if (e.target.closest('[data-close-dialog]')) closeDialogSmooth(d);
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
      toastTimer = setTimeout(() => {
        if (typeof toastEl.hidePopover === 'function' && toastEl.matches(':popover-open')) {
          toastEl.hidePopover();
        }
      }, 2400);
    }

    async function copyToClipboard(text, successMsg) {
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
      showToast(successMsg);
    }

    // Helpers for states & messages
    function getStateMeta(stateId) {
      return STATES.find((s) => s.id === stateId) || STATES[0];
    }

    function getOrderBalance(order) {
      return Math.max(0, (Number(order.total) || 0) - (Number(order.deposit) || 0));
    }

    function getTrackingUrl(orderNumber) {
      const url = new URL(window.location.href);
      url.searchParams.set('orden', String(orderNumber));
      return url.toString();
    }

    function buildNotifyMessage(order) {
      const st = getStateMeta(order.status);
      const balance = getOrderBalance(order);
      const trackUrl = getTrackingUrl(order.number);
      const lines = [
        `Hola ${order.client}, te escribimos de ${config.name}.`,
        `Tu orden #${order.number} (${order.item}) se encuentra: ${st.label}.`,
      ];
      if (order.status === 'listo') {
        lines.push(
          balance > 0
            ? `Ya puedes pasar a recogerla. Saldo pendiente: ${formatBs(balance)}.`
            : 'Ya puedes pasar a recogerla (saldo cancelado).'
        );
      } else {
        lines.push(`Trabajo: ${order.work}.`);
        if (balance > 0) lines.push(`Saldo pendiente: ${formatBs(balance)}.`);
      }
      lines.push(`Horario: ${config.hours}.`);
      lines.push(`Seguimiento en vivo: ${trackUrl}`);
      return lines.join('\n');
    }

    function buildTicketMessage(order) {
      const balance = getOrderBalance(order);
      return [
        `Hola ${order.client}, aquí tienes tu comprobante digital de ${config.name}:`,
        `Orden: #${order.number}`,
        `${config.fields.itemLabel}: ${order.item}`,
        `${config.fields.workLabel}: ${order.work}`,
        `Total: ${formatBs(order.total)} · Adelanto: ${formatBs(order.deposit)} · Saldo: ${formatBs(balance)}`,
        order.eta ? `Entrega estimada: ${order.eta}` : '',
        `Sigue el estado en vivo aquí: ${getTrackingUrl(order.number)}`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    function switchView(view, orderNum) {
      activeView = view;
      viewTallerEl.hidden = view !== 'taller';
      viewClienteEl.hidden = view !== 'cliente';
      newOrderBtn.hidden = view !== 'taller';

      for (const btn of root.querySelectorAll('[data-switch-view]')) {
        btn.setAttribute('aria-pressed', String(btn.dataset.switchView === view));
      }

      const url = new URL(window.location.href);
      if (view === 'cliente') {
        if (orderNum) selectedClientOrderNum = String(orderNum);
        clientOrderInput.value = selectedClientOrderNum;
        url.searchParams.set('orden', selectedClientOrderNum);
        renderClientView();
      } else {
        url.searchParams.delete('orden');
        renderTallerView();
      }
      window.history.replaceState(null, '', url);
    }

    // Render Vista Taller
    function renderTallerView() {
      const activeCount = orders.filter((o) => o.status !== 'entregado').length;
      const readyCount = orders.filter((o) => o.status === 'listo').length;
      const receivable = orders
        .filter((o) => o.status !== 'entregado')
        .reduce((sum, o) => sum + getOrderBalance(o), 0);

      kpiStripEl.innerHTML = `
        <div class="kpi-card">
          <span class="kpi-card__label">Activas</span>
          <span class="kpi-card__value">${activeCount}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-card__label">Listas</span>
          <span class="kpi-card__value kpi-card__value--ready">${readyCount}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-card__label">Por cobrar</span>
          <span class="kpi-card__value">${formatBs(receivable)}</span>
        </div>
      `;

      const filtered = orders.filter((o) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'proceso') return ['recibido', 'proceso', 'espera'].includes(o.status);
        return o.status === activeFilter;
      });

      if (filtered.length === 0) {
        ordersGridEl.innerHTML = `
          <div class="empty-state">
            <p class="empty-state__title">No hay órdenes en este estado</p>
            <p class="empty-state__desc">Cambia el filtro o registra una nueva orden arriba.</p>
          </div>
        `;
        return;
      }

      ordersGridEl.innerHTML = filtered
        .map((order) => {
          const st = getStateMeta(order.status);
          const idx = STATES.findIndex((s) => s.id === order.status);
          const nextState = idx >= 0 && idx < STATES.length - 1 ? STATES[idx + 1] : null;
          const balance = getOrderBalance(order);
          const waHref = `https://wa.me/${normalizeWaPhone(order.phone)}?text=${encodeURIComponent(buildNotifyMessage(order))}`;

          return `
            <article class="order-card">
              <div class="order-card__head">
                <div>
                  <span class="order-num">Orden #${escapeHtml(order.number)} · ${escapeHtml(order.updatedAt)}</span>
                  <h2 class="order-item-title">${escapeHtml(order.item)}</h2>
                  <p class="order-client">${escapeHtml(order.client)}${order.eta ? ` · Est. ${escapeHtml(order.eta)}` : ''}</p>
                </div>
                <span class="status-badge status-badge--${escapeHtml(order.status)}">
                  <span class="status-dot" aria-hidden="true"></span>
                  ${escapeHtml(st.label)}
                </span>
              </div>

              <div class="order-card__photo-row">
                ${order.photo ? `<img class="order-thumb" src="${escapeHtml(order.photo)}" alt="Foto de recepción orden ${escapeHtml(order.number)}">` : ''}
                <div class="order-card__detail">
                  <p>${escapeHtml(order.work)}</p>
                  ${order.extra ? `<p class="order-card__extra">${escapeHtml(config.fields.extraShort)}: ${escapeHtml(order.extra)}</p>` : ''}
                </div>
              </div>

              <div class="money-bar">
                <div class="money-cell">
                  <span class="money-cell__label">Total</span>
                  <span class="money-cell__val">${formatBs(order.total)}</span>
                </div>
                <div class="money-cell">
                  <span class="money-cell__label">Adelanto</span>
                  <span class="money-cell__val">${formatBs(order.deposit)}</span>
                </div>
                <div class="money-cell">
                  <span class="money-cell__label">Saldo</span>
                  <span class="money-cell__val ${balance > 0 ? 'money-cell__val--due' : ''}">${formatBs(balance)}</span>
                </div>
              </div>

              <div class="order-card__controls">
                <div class="status-control-row">
                  <select class="status-select" data-change-status="${escapeHtml(order.number)}" aria-label="Cambiar estado de orden ${escapeHtml(order.number)}">
                    ${STATES.map(
                      (s) =>
                        `<option value="${s.id}" ${s.id === order.status ? 'selected' : ''}>${escapeHtml(s.label)}</option>`
                    ).join('')}
                  </select>
                  ${
                    nextState
                      ? `<button type="button" class="btn btn--primary btn--sm" data-advance-order="${escapeHtml(order.number)}" data-next-status="${nextState.id}">Pasar a ${escapeHtml(nextState.shortLabel)}</button>`
                      : `<span class="order-num">Cerrada</span>`
                  }
                </div>

                <div class="card-actions-row">
                  <a class="btn btn--wa btn--sm" href="${escapeHtml(waHref)}" target="_blank" rel="noopener noreferrer">Avisar por WhatsApp</a>
                  <button type="button" class="btn btn--ghost btn--sm" data-copy-msg="${escapeHtml(order.number)}">Copiar mensaje</button>
                  <button type="button" class="btn btn--secondary btn--sm" data-view-client="${escapeHtml(order.number)}">Ver como cliente</button>
                </div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    // Render Vista Cliente
    function renderClientView() {
      const chips = orders.slice(0, 6);
      clientChipsEl.innerHTML = `
        <span class="quick-chips__label">Órdenes de prueba:</span>
        ${chips
          .map(
            (o) =>
              `<button type="button" class="chip-btn" data-pick-order="${escapeHtml(o.number)}" aria-pressed="${String(o.number) === String(selectedClientOrderNum)}">#${escapeHtml(o.number)}</button>`
          )
          .join('')}
      `;

      const order = orders.find((o) => String(o.number) === String(selectedClientOrderNum).replace(/\D/g, ''));
      if (!order) {
        clientResultEl.innerHTML = `
          <div class="empty-state">
            <p class="empty-state__title">No encontramos la orden #${escapeHtml(selectedClientOrderNum || '—')}</p>
            <p class="empty-state__desc">Verifica el número en tu ticket o toca uno de los códigos activos arriba.</p>
          </div>
        `;
        return;
      }

      const st = getStateMeta(order.status);
      const currentIndex = STATES.findIndex((s) => s.id === order.status);
      const balance = getOrderBalance(order);
      const consultText = `Hola ${config.name}, consulto por mi orden #${order.number} (${order.item}).`;
      const consultHref = `https://wa.me/${DEFAULT_WA_NUMBER}?text=${encodeURIComponent(consultText)}`;

      clientResultEl.innerHTML = `
        <article class="track-card">
          <div class="track-head">
            <div>
              <span class="order-num">Orden #${escapeHtml(order.number)}</span>
              <h2 class="order-item-title">${escapeHtml(order.item)}</h2>
              <p class="track-updated">Última actualización: ${escapeHtml(order.updatedAt)}</p>
            </div>
            <span class="status-badge status-badge--${escapeHtml(order.status)}">
              <span class="status-dot" aria-hidden="true"></span>
              ${escapeHtml(st.label)}
            </span>
          </div>

          <ol class="stepper-list" aria-label="Progreso de la orden">
            ${STATES.map((step, i) => {
              const cls =
                i < currentIndex
                  ? 'step-item step-item--done'
                  : i === currentIndex
                    ? 'step-item step-item--current'
                    : 'step-item';
              const icon =
                i < currentIndex
                  ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
                  : '';
              return `
                <li class="${cls}" ${i === currentIndex ? 'aria-current="step"' : ''}>
                  <span class="step-dot" aria-hidden="true">${icon}</span>
                  <div class="step-text">
                    <p class="step-title">${escapeHtml(step.label)}</p>
                    ${i === currentIndex ? `<p class="step-sub">${escapeHtml(step.clientHint)}</p>` : ''}
                  </div>
                </li>
              `;
            }).join('')}
          </ol>

          <div class="track-details">
            <div class="detail-pair">
              <span class="detail-pair__label">Cliente</span>
              <span class="detail-pair__val">${escapeHtml(order.client)}</span>
            </div>
            <div class="detail-pair">
              <span class="detail-pair__label">${escapeHtml(config.fields.workLabel)}</span>
              <span class="detail-pair__val">${escapeHtml(order.work)}</span>
            </div>
            ${
              order.extra
                ? `<div class="detail-pair"><span class="detail-pair__label">${escapeHtml(config.fields.extraShort)}</span><span class="detail-pair__val">${escapeHtml(order.extra)}</span></div>`
                : ''
            }
            <div class="detail-pair">
              <span class="detail-pair__label">Entrega estimada</span>
              <span class="detail-pair__val">${escapeHtml(order.eta || 'Por confirmar')}</span>
            </div>
          </div>

          ${order.photo ? `<img class="track-photo" src="${escapeHtml(order.photo)}" alt="Foto de recepción de la orden ${escapeHtml(order.number)}">` : ''}

          <div class="money-bar">
            <div class="money-cell">
              <span class="money-cell__label">Total</span>
              <span class="money-cell__val">${formatBs(order.total)}</span>
            </div>
            <div class="money-cell">
              <span class="money-cell__label">Adelanto</span>
              <span class="money-cell__val">${formatBs(order.deposit)}</span>
            </div>
            <div class="money-cell">
              <span class="money-cell__label">Saldo pendiente</span>
              <span class="money-cell__val ${balance > 0 ? 'money-cell__val--due' : ''}">${formatBs(balance)}</span>
            </div>
          </div>

          <div class="track-actions">
            <button type="button" class="btn btn--secondary" data-open-shop-qr="${balance}">Ver QR Simple del taller</button>
            <a class="btn btn--wa" href="${escapeHtml(consultHref)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
          </div>
        </article>
      `;
    }

    function openGeneratedTicket(order) {
      const trackUrl = getTrackingUrl(order.number);
      const waHref = `https://wa.me/${normalizeWaPhone(order.phone)}?text=${encodeURIComponent(buildTicketMessage(order))}`;

      ticketBody.innerHTML = `
        <div class="qr-card">
          <div>
            <strong>Orden #${escapeHtml(order.number)} · ${escapeHtml(order.item)}</strong>
            <p class="shop-meta">${escapeHtml(order.client)} · Saldo: ${formatBs(getOrderBalance(order))}</p>
          </div>
          <div class="qr-frame">${qrSvgMarkup(168)}</div>
          <p class="qr-url">${escapeHtml(trackUrl)}</p>
        </div>
      `;

      ticketFooter.innerHTML = `
        <div class="form-stack" style="gap:0.5rem;">
          <a class="btn btn--wa btn--full" href="${escapeHtml(waHref)}" target="_blank" rel="noopener noreferrer">Enviar ticket por WhatsApp</a>
          <div class="track-actions">
            <button type="button" class="btn btn--secondary" id="ticket-copy-url">Copiar enlace</button>
            <button type="button" class="btn btn--ghost" id="ticket-open-client">Ver como cliente</button>
          </div>
        </div>
      `;

      document.getElementById('ticket-copy-url')?.addEventListener('click', () => {
        copyToClipboard(trackUrl, 'Enlace de seguimiento copiado');
      });
      document.getElementById('ticket-open-client')?.addEventListener('click', () => {
        closeDialogSmooth(ticketDialog).then(() => switchView('cliente', order.number));
      });

      ticketDialog.showModal();
    }

    // Event bindings
    root.addEventListener('click', (e) => {
      const switchBtn = e.target.closest('[data-switch-view]');
      if (switchBtn) {
        switchView(switchBtn.dataset.switchView);
        return;
      }

      const filterBtn = e.target.closest('[data-filter]');
      if (filterBtn) {
        activeFilter = filterBtn.dataset.filter;
        for (const b of filtersEl.querySelectorAll('[data-filter]')) {
          b.setAttribute('aria-pressed', String(b.dataset.filter === activeFilter));
        }
        renderTallerView();
        return;
      }

      const advanceBtn = e.target.closest('[data-advance-order]');
      if (advanceBtn) {
        const num = advanceBtn.dataset.advanceOrder;
        const nextStatus = advanceBtn.dataset.nextStatus;
        const ord = orders.find((o) => String(o.number) === String(num));
        if (ord) {
          ord.status = nextStatus;
          ord.updatedAt = nowLabel();
          saveOrders();
          renderTallerView();
          showToast(`Orden #${ord.number} actualizada a ${getStateMeta(nextStatus).label}`);
        }
        return;
      }

      const copyMsgBtn = e.target.closest('[data-copy-msg]');
      if (copyMsgBtn) {
        const ord = orders.find((o) => String(o.number) === String(copyMsgBtn.dataset.copyMsg));
        if (ord) copyToClipboard(buildNotifyMessage(ord), 'Mensaje copiado');
        return;
      }

      const viewClientBtn = e.target.closest('[data-view-client]');
      if (viewClientBtn) {
        switchView('cliente', viewClientBtn.dataset.viewClient);
        return;
      }

      const pickChip = e.target.closest('[data-pick-order]');
      if (pickChip) {
        selectedClientOrderNum = pickChip.dataset.pickOrder;
        clientOrderInput.value = selectedClientOrderNum;
        const url = new URL(window.location.href);
        url.searchParams.set('orden', selectedClientOrderNum);
        window.history.replaceState(null, '', url);
        renderClientView();
        return;
      }

      const openQrBtn = e.target.closest('[data-open-shop-qr]');
      if (openQrBtn) {
        qrPayAmount.textContent = `Saldo pendiente: ${formatBs(openQrBtn.dataset.openShopQr)}`;
        qrPayDialog.showModal();
      }
    });

    ordersGridEl.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-change-status]');
      if (!sel) return;
      const ord = orders.find((o) => String(o.number) === String(sel.dataset.changeStatus));
      if (!ord) return;
      ord.status = sel.value;
      ord.updatedAt = nowLabel();
      saveOrders();
      renderTallerView();
      showToast(`Orden #${ord.number}: ${getStateMeta(ord.status).label}`);
    });

    clientSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      selectedClientOrderNum = clientOrderInput.value.replace(/\D/g, '');
      const url = new URL(window.location.href);
      if (selectedClientOrderNum) url.searchParams.set('orden', selectedClientOrderNum);
      window.history.replaceState(null, '', url);
      renderClientView();
    });

    newOrderBtn.addEventListener('click', () => {
      newOrderForm.reset();
      pendingPhotoDataUrl = '';
      photoPreviewWrap.hidden = true;
      balancePreview.textContent = 'Bs 0';
      newOrderDialog.showModal();
    });

    const syncBalancePreview = () => {
      const t = Number(totalInput.value) || 0;
      const d = Number(depositInput.value) || 0;
      balancePreview.textContent = formatBs(Math.max(0, t - d));
    };
    totalInput.addEventListener('input', syncBalancePreview);
    depositInput.addEventListener('input', syncBalancePreview);

    photoInput.addEventListener('change', async () => {
      const file = photoInput.files?.[0];
      if (!file) return;
      try {
        pendingPhotoDataUrl = await compressImageFile(file);
        photoPreviewImg.src = pendingPhotoDataUrl;
        photoPreviewWrap.hidden = false;
      } catch {
        showToast('No se pudo procesar la foto');
      }
    });

    photoClearBtn.addEventListener('click', () => {
      pendingPhotoDataUrl = '';
      photoInput.value = '';
      photoPreviewWrap.hidden = true;
    });

    newOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(newOrderForm);
      const maxNum = orders.reduce((m, o) => Math.max(m, Number(o.number) || 0), 100);
      const created = {
        number: maxNum + 1,
        client: String(fd.get('client') || '').trim(),
        phone: String(fd.get('phone') || '').trim() || DEFAULT_WA_NUMBER,
        item: String(fd.get('item') || '').trim(),
        work: String(fd.get('work') || '').trim(),
        extra: String(fd.get('extra') || '').trim(),
        eta: String(fd.get('eta') || '').trim() || 'Por confirmar',
        total: Math.max(0, Math.round(Number(fd.get('total')) || 0)),
        deposit: Math.max(0, Math.round(Number(fd.get('deposit')) || 0)),
        status: 'recibido',
        updatedAt: nowLabel(),
        photo: pendingPhotoDataUrl,
      };
      orders.unshift(created);
      selectedClientOrderNum = String(created.number);
      saveOrders();
      renderTallerView();
      closeDialogSmooth(newOrderDialog).then(() => {
        openGeneratedTicket(created);
      });
    });

    resetDemoBtn.addEventListener('click', () => {
      orders = cloneSeed();
      localStorage.removeItem(STORAGE_KEY);
      selectedClientOrderNum = String(orders[0].number);
      renderTallerView();
      renderClientView();
      showToast('Datos de ejemplo restaurados');
    });

    wireDialogs();
    if (activeView === 'cliente') {
      newOrderBtn.hidden = true;
      renderClientView();
    } else {
      renderTallerView();
    }
  }

  window.initTracker = initTracker;
})();
