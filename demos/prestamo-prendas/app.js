(() => {
  const STORAGE_BOLETAS = 'prendario_andino_boletas_v1';
  const STORAGE_LEDGER = 'prendario_andino_ledger_v1';
  const WA_DEFAULT = '59177398405';

  const TODAY = new Date('2026-11-20T12:00:00');

  function addDays(baseDate, days) {
    const d = new Date(baseDate.getTime());
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function formatDateEs(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[Number(m) - 1] || m} ${y}`;
  }

  function formatBs(n) {
    const val = Math.round(Number(n) || 0);
    const sign = val < 0 ? '-' : '';
    return `${sign}Bs ${Math.abs(val).toLocaleString('es-BO')}`;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalizePhone(raw) {
    const d = String(raw || '').replace(/\D/g, '');
    if (!d) return WA_DEFAULT;
    return d.startsWith('591') ? d : `591${d}`;
  }

  function monthlyInterest(boleta) {
    return Math.round((Number(boleta.capital) || 0) * ((Number(boleta.rate) || 8) / 100));
  }

  function qrSvg(size = 156) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 29 29" shape-rendering="crispEdges" role="img" aria-label="Código QR de boleta">
        <rect width="29" height="29" fill="#FFFFFF"/>
        <path fill="#0F172A" d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"/>
        <path fill="#0F172A" d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"/>
        <path fill="#0F172A" d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"/>
        <path fill="#0F172A" d="M10,1 h2 v2 h-2 z M14,1 h2 v2 h-2 z M18,1 h1 v3 h-1 z M10,4 h2 v2 h-2 z M13,4 h3 v2 h-3 z M17,5 h2 v2 h-2 z M1,10 h3 v2 h-3 z M5,10 h2 v2 h-2 z M9,10 h3 v2 h-3 z M14,10 h2 v3 h-2 z M18,10 h3 v2 h-3 z M23,10 h3 v2 h-3 z M1,14 h2 v2 h-2 z M5,13 h3 v3 h-3 z M10,14 h3 v2 h-3 z M15,14 h3 v2 h-3 z M20,13 h2 v3 h-2 z M24,14 h3 v2 h-3 z M10,17 h2 v2 h-2 z M14,17 h2 v2 h-2 z M18,17 h3 v2 h-3 z M23,17 h2 v3 h-2 z M10,21 h3 v2 h-3 z M15,21 h2 v2 h-2 z M19,21 h3 v2 h-3 z M24,21 h3 v2 h-3 z M10,25 h2 v3 h-2 z M14,24 h3 v3 h-3 z M19,25 h2 v2 h-2 z M23,24 h2 v3 h-2 z M26,25 h2 v3 h-2 z"/>
      </svg>
    `;
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read error'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('img error'));
        img.onload = () => {
          const max = 640;
          let { width, height } = img;
          if (width > max || height > max) {
            if (width >= height) {
              height = Math.round((height * max) / width);
              width = max;
            } else {
              width = Math.round((width * max) / height);
              height = max;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const STATUS_META = {
    vigente: { label: 'Vigente', cls: 'badge--vigente' },
    'por-vencer': { label: 'Por vencer', cls: 'badge--por-vencer' },
    vencida: { label: 'Vencida', cls: 'badge--vencida' },
    rescatada: { label: 'Rescatada', cls: 'badge--rescatada' },
    remate: { label: 'En remate', cls: 'badge--remate' },
    rematada: { label: 'Rematada', cls: 'badge--rematada' },
  };

  const TX_LABELS = {
    interes: 'Interés / Renovación',
    rescate: 'Rescate',
    remate: 'Venta de remate',
    desembolso: 'Desembolso préstamo',
    gasto: 'Gasto operativo',
  };

  const SEED_BOLETAS = [
    {
      code: 'BOL-2026-0141',
      clientName: 'Roxana Quispe',
      ci: '4821903 LP',
      phone: '77398405',
      category: 'Oro/Joyas',
      item: 'Joya de oro 18k (14g, cadena y dije)',
      appraisal: 3800,
      capital: 2400,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -12),
      dueDate: addDays(TODAY, 18),
      status: 'vigente',
      photo: '',
    },
    {
      code: 'BOL-2026-0142',
      clientName: 'Alejandro Torrez',
      ci: '6712345 LP',
      phone: '77398405',
      category: 'Celulares',
      item: 'iPhone 14 Pro 256GB (Negro, sin caja)',
      appraisal: 4500,
      capital: 2800,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -28),
      dueDate: addDays(TODAY, 2),
      status: 'por-vencer',
      photo: '',
    },
    {
      code: 'BOL-2026-0143',
      clientName: 'Fernando Chávez',
      ci: '8345120 EL ALTO',
      phone: '77398405',
      category: 'Laptops/Consolas',
      item: 'Laptop HP Core i7 16GB RAM + cargador',
      appraisal: 3200,
      capital: 1900,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -19),
      dueDate: addDays(TODAY, 11),
      status: 'vigente',
      photo: '',
    },
    {
      code: 'BOL-2026-0144',
      clientName: 'Héctor Mamani',
      ci: '5920184 LP',
      phone: '77398405',
      category: 'Herramientas/Otros',
      item: 'Taladro percutor Bosch GSB 16 en maletín',
      appraisal: 1150,
      capital: 650,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -34),
      dueDate: addDays(TODAY, -4),
      status: 'vencida',
      photo: '',
    },
    {
      code: 'BOL-2026-0145',
      clientName: 'Mónica Salazar',
      ci: '7045812 LP',
      phone: '77398405',
      category: 'Herramientas/Otros',
      item: 'TV Smart Samsung 50" 4K + control remoto',
      appraisal: 2100,
      capital: 1100,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -52),
      dueDate: addDays(TODAY, -22),
      status: 'remate',
      photo: '',
    },
    {
      code: 'BOL-2026-0146',
      clientName: 'Patricia Conde',
      ci: '4910221 CB',
      phone: '77398405',
      category: 'Oro/Joyas',
      item: 'Cadena de oro + anillo 18k (9.5g)',
      appraisal: 2600,
      capital: 1600,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -28),
      dueDate: addDays(TODAY, 2),
      status: 'por-vencer',
      photo: '',
    },
    {
      code: 'BOL-2026-0147',
      clientName: 'Rodrigo Villarroel',
      ci: '6129384 LP',
      phone: '77398405',
      category: 'Laptops/Consolas',
      item: 'Consola PlayStation 5 + 2 mandos DualSense',
      appraisal: 3700,
      capital: 2200,
      rate: 8,
      termDays: 30,
      createdAt: addDays(TODAY, -25),
      dueDate: addDays(TODAY, 5),
      status: 'rescatada',
      photo: '',
    },
  ];

  // 6 months realistic cashflow history (Jun 2026 - Nov 2026)
  const SEED_LEDGER = [
    { id: 'tx-1', date: '2026-11-18', month: '2026-11', type: 'rescate', direction: 'in', amount: 2376, method: 'QR Simple', desc: 'Rescate total BOL-2026-0147 (Consola PS5)' },
    { id: 'tx-2', date: '2026-11-15', month: '2026-11', type: 'interes', direction: 'in', amount: 420, method: 'Efectivo', desc: 'Renovaciones 30 días (boletas activas)' },
    { id: 'tx-3', date: '2026-11-12', month: '2026-11', type: 'remate', direction: 'in', amount: 1450, method: 'QR Simple', desc: 'Venta remate Reloj Seiko automático' },
    { id: 'tx-4', date: '2026-11-08', month: '2026-11', type: 'desembolso', direction: 'out', amount: 2400, method: 'Efectivo', desc: 'Desembolso BOL-2026-0141 (Joya oro 18k)' },
    { id: 'tx-5', date: '2026-11-04', month: '2026-11', type: 'gasto', direction: 'out', amount: 650, method: 'Efectivo', desc: 'Alquiler y seguridad local — Noviembre' },
    { id: 'tx-6', date: '2026-10-25', month: '2026-10', type: 'rescate', direction: 'in', amount: 3100, method: 'QR Simple', desc: 'Rescates cerrados Octubre' },
    { id: 'tx-7', date: '2026-10-18', month: '2026-10', type: 'interes', direction: 'in', amount: 1680, method: 'Efectivo', desc: 'Cobro intereses mensuales Octubre' },
    { id: 'tx-8', date: '2026-10-10', month: '2026-10', type: 'desembolso', direction: 'out', amount: 3900, method: 'Efectivo', desc: 'Nuevos préstamos colocados Octubre' },
    { id: 'tx-9', date: '2026-09-22', month: '2026-09', type: 'rescate', direction: 'in', amount: 2800, method: 'QR Simple', desc: 'Rescates cerrados Septiembre' },
    { id: 'tx-10', date: '2026-09-14', month: '2026-09', type: 'interes', direction: 'in', amount: 1520, method: 'Efectivo', desc: 'Intereses y renovaciones Septiembre' },
    { id: 'tx-11', date: '2026-09-09', month: '2026-09', type: 'desembolso', direction: 'out', amount: 3400, method: 'Efectivo', desc: 'Desembolsos préstamos Septiembre' },
    { id: 'tx-12', date: '2026-08-24', month: '2026-08', type: 'remate', direction: 'in', amount: 1950, method: 'QR Simple', desc: 'Remate prendas vencidas Agosto' },
    { id: 'tx-13', date: '2026-08-16', month: '2026-08', type: 'interes', direction: 'in', amount: 1410, method: 'Efectivo', desc: 'Intereses mensuales Agosto' },
    { id: 'tx-14', date: '2026-08-05', month: '2026-08', type: 'desembolso', direction: 'out', amount: 2950, method: 'Efectivo', desc: 'Desembolsos préstamos Agosto' },
    { id: 'tx-15', date: '2026-07-21', month: '2026-07', type: 'rescate', direction: 'in', amount: 2500, method: 'Efectivo', desc: 'Rescates Julio' },
    { id: 'tx-16', date: '2026-07-12', month: '2026-07', type: 'interes', direction: 'in', amount: 1380, method: 'QR Simple', desc: 'Intereses Julio' },
    { id: 'tx-17', date: '2026-07-04', month: '2026-07', type: 'desembolso', direction: 'out', amount: 3100, method: 'Efectivo', desc: 'Desembolsos Julio' },
    { id: 'tx-18', date: '2026-06-20', month: '2026-06', type: 'rescate', direction: 'in', amount: 2200, method: 'Efectivo', desc: 'Rescates Junio' },
    { id: 'tx-19', date: '2026-06-11', month: '2026-06', type: 'interes', direction: 'in', amount: 1290, method: 'QR Simple', desc: 'Intereses Junio' },
    { id: 'tx-20', date: '2026-06-03', month: '2026-06', type: 'desembolso', direction: 'out', amount: 2700, method: 'Efectivo', desc: 'Desembolsos Junio' },
  ];

  function loadState(key, seed) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return seed.map((x) => ({ ...x }));
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed.map((x) => ({ ...x }));
    } catch {
      return seed.map((x) => ({ ...x }));
    }
  }

  let boletas = loadState(STORAGE_BOLETAS, SEED_BOLETAS);
  let ledger = loadState(STORAGE_LEDGER, SEED_LEDGER);
  let activeView = 'resumen';
  let boletaFilter = 'all';
  let boletaQuery = '';
  let cashFilter = 'all';
  let selectedClientCode = 'BOL-2026-0142';
  let pendingPhoto = '';
  let toastTimer = null;

  const urlBoleta = new URLSearchParams(window.location.search).get('boleta');
  if (urlBoleta) {
    activeView = 'cliente';
    selectedClientCode = urlBoleta.trim().toUpperCase();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_BOLETAS, JSON.stringify(boletas));
      localStorage.setItem(STORAGE_LEDGER, JSON.stringify(ledger));
    } catch {
      showToast('Almacenamiento lleno: intenta sin foto');
    }
  }

  function addLedgerEntry({ type, direction, amount, method, desc }) {
    const todayIso = addDays(TODAY, 0);
    ledger.unshift({
      id: `tx-${Date.now()}`,
      date: todayIso,
      month: todayIso.slice(0, 7),
      type,
      direction,
      amount: Math.round(Number(amount) || 0),
      method: method || 'Efectivo',
      desc,
    });
    persist();
  }

  // DOM refs
  const views = {
    resumen: document.getElementById('view-resumen'),
    boletas: document.getElementById('view-boletas'),
    caja: document.getElementById('view-caja'),
    cliente: document.getElementById('view-cliente'),
  };

  const dashKpisEl = document.getElementById('dashboard-kpis');
  const monthlyChartHost = document.getElementById('monthly-chart-host');
  const chartTooltipEl = document.getElementById('chart-tooltip');
  const categoryChartHost = document.getElementById('category-chart-host');
  const dashAlertsEl = document.getElementById('dashboard-alerts');

  const boletaSearchEl = document.getElementById('boleta-search');
  const boletaFiltersEl = document.getElementById('boleta-filters');
  const boletasGridEl = document.getElementById('boletas-grid');

  const cashKpisEl = document.getElementById('cash-kpis');
  const cashMethodsEl = document.getElementById('cash-methods');
  const cashFiltersEl = document.getElementById('cash-filters');
  const ledgerTbodyEl = document.getElementById('ledger-tbody');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const openManualTxBtn = document.getElementById('open-manual-tx-btn');

  const clientLookupForm = document.getElementById('client-lookup-form');
  const clientBoletaInput = document.getElementById('client-boleta-input');
  const clientChipsEl = document.getElementById('client-chips');
  const clientBoletaHost = document.getElementById('client-boleta-host');

  const newBoletaDialog = document.getElementById('new-boleta-dialog');
  const newBoletaForm = document.getElementById('new-boleta-form');
  const nbCapital = document.getElementById('nb-capital');
  const nbRate = document.getElementById('nb-rate');
  const nbTerm = document.getElementById('nb-term');
  const nbPhoto = document.getElementById('nb-photo');
  const nbPhotoHost = document.getElementById('nb-photo-host');
  const calcIntEl = document.getElementById('calc-int');
  const calcTotalEl = document.getElementById('calc-total');
  const calcDueEl = document.getElementById('calc-due');

  const detailDialog = document.getElementById('boleta-detail-dialog');
  const detailTitleEl = document.getElementById('bd-title');
  const detailBodyEl = document.getElementById('bd-body');

  const manualTxDialog = document.getElementById('manual-tx-dialog');
  const manualTxForm = document.getElementById('manual-tx-form');

  const qrDialog = document.getElementById('qr-dialog');
  const qrTitleEl = document.getElementById('qr-title');
  const qrBodyEl = document.getElementById('qr-dialog-body');
  const qrFooterEl = document.getElementById('qr-dialog-footer');

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
    }, 2600);
  }

  function getBoletaUrl(code) {
    const u = new URL(window.location.href);
    u.searchParams.set('boleta', code);
    return u.toString();
  }

  function buildReminderWaHref(b) {
    const interest = monthlyInterest(b);
    const total = b.capital + interest;
    const msg = [
      `Hola ${b.clientName}, te escribimos de Comercial Prendario Andino (La Paz).`,
      `Te recordamos el estado de tu boleta ${b.code} (${b.item}), vencimiento ${formatDateEs(b.dueDate)}.`,
      `• Para renovar 30 días (solo interés): ${formatBs(interest)}`,
      `• Para rescatar hoy (capital + interés): ${formatBs(total)}`,
      `Consulta tu boleta aquí: ${getBoletaUrl(b.code)}`,
    ].join('\n');
    return `https://wa.me/${normalizePhone(b.phone)}?text=${encodeURIComponent(msg)}`;
  }

  // --- View Switcher ---
  function switchNav(target, clientCode) {
    activeView = target;
    for (const [k, el] of Object.entries(views)) {
      el.hidden = k !== target;
    }
    for (const btn of document.querySelectorAll('[data-nav]')) {
      if (btn.dataset.nav === target) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }
    if (target === 'cliente' && clientCode) {
      selectedClientCode = clientCode;
    }
    renderAll();
  }

  // --- 1. Render Dashboard (Resumen) ---
  function renderDashboard() {
    const activeStatuses = ['vigente', 'por-vencer', 'vencida', 'remate'];
    const activeBoletas = boletas.filter((b) => activeStatuses.includes(b.status));
    const placedCapital = activeBoletas.reduce((s, b) => s + b.capital, 0);

    const monthIncome = ledger
      .filter((t) => t.month === '2026-11' && t.direction === 'in' && (t.type === 'interes' || t.type === 'remate'))
      .reduce((s, t) => s + t.amount, 0);

    const totalIn = ledger.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = ledger.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
    const netCash = totalIn - totalOut;

    const dueSoonCount = boletas.filter((b) => b.status === 'por-vencer').length;
    const overdueCount = boletas.filter((b) => b.status === 'vencida' || b.status === 'remate').length;

    dashKpisEl.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-card__label">Capital colocado activo</span>
        <span class="kpi-card__val">${formatBs(placedCapital)}</span>
        <span class="kpi-card__foot">${activeBoletas.length} boletas en custodia</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Intereses y remates (mes)</span>
        <span class="kpi-card__val kpi-card__val--ok">${formatBs(monthIncome)}</span>
        <span class="kpi-card__foot">Noviembre 2026</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Balance neto de caja</span>
        <span class="kpi-card__val ${netCash >= 0 ? 'kpi-card__val--ok' : 'kpi-card__val--danger'}">${formatBs(netCash)}</span>
        <span class="kpi-card__foot">Ingresos menos egresos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Alertas de cartera</span>
        <span class="kpi-card__val ${overdueCount > 0 ? 'kpi-card__val--danger' : 'kpi-card__val--warn'}">${dueSoonCount + overdueCount}</span>
        <span class="kpi-card__foot">${dueSoonCount} por vencer · ${overdueCount} vencidas</span>
      </div>
    `;

    // Chart 1: 6-month Ingresos vs Desembolsos SVG
    const months = [
      { key: '2026-06', label: 'Jun' },
      { key: '2026-07', label: 'Jul' },
      { key: '2026-08', label: 'Ago' },
      { key: '2026-09', label: 'Sep' },
      { key: '2026-10', label: 'Oct' },
      { key: '2026-11', label: 'Nov' },
    ];
    const series = months.map((m) => {
      const inc = ledger.filter((t) => t.month === m.key && t.direction === 'in').reduce((s, t) => s + t.amount, 0);
      const out = ledger.filter((t) => t.month === m.key && t.direction === 'out').reduce((s, t) => s + t.amount, 0);
      return { ...m, inc, out, net: inc - out };
    });
    const maxVal = Math.max(1000, ...series.flatMap((s) => [s.inc, s.out]));
    const W = 460;
    const H = 180;
    const padB = 26;
    const padT = 12;
    const plotH = H - padB - padT;
    const colW = W / series.length;

    const barsSvg = series
      .map((s, idx) => {
        const x0 = idx * colW;
        const incH = Math.max(4, Math.round((s.inc / maxVal) * plotH));
        const outH = Math.max(4, Math.round((s.out / maxVal) * plotH));
        const barW = 16;
        const gap = 5;
        const groupX = x0 + (colW - (barW * 2 + gap)) / 2;
        return `
          <g class="chart-bar-group" tabindex="0" data-chart-month="${idx}" role="button" aria-label="${s.label}: Ingresos ${formatBs(s.inc)}, Desembolsos ${formatBs(s.out)}">
            <rect class="bar-bg" x="${x0 + 4}" y="${padT}" width="${colW - 8}" height="${plotH}" rx="6" fill="transparent"/>
            <rect x="${groupX}" y="${padT + plotH - incH}" width="${barW}" height="${incH}" rx="4" fill="#059669"/>
            <rect x="${groupX + barW + gap}" y="${padT + plotH - outH}" width="${barW}" height="${outH}" rx="4" fill="#94A3B8"/>
            <text x="${x0 + colW / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#64748B">${s.label}</text>
          </g>
        `;
      })
      .join('');

    monthlyChartHost.innerHTML = `
      <svg class="svg-chart" viewBox="0 0 ${W} ${H}" aria-label="Gráfico de flujo mensual en Bs">
        <line x1="0" y1="${padT + plotH}" x2="${W}" y2="${padT + plotH}" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="0" y1="${padT + plotH / 2}" x2="${W}" y2="${padT + plotH / 2}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3 3"/>
        ${barsSvg}
      </svg>
    `;

    const showMonthTip = (idx) => {
      const s = series[idx];
      if (!s) return;
      for (const g of monthlyChartHost.querySelectorAll('.chart-bar-group')) {
        g.classList.toggle('is-active', Number(g.dataset.chartMonth) === idx);
      }
      chartTooltipEl.innerHTML = `
        <strong>${s.label} 2026:</strong>
        <span>Ingresos: <strong style="color:#047857;">${formatBs(s.inc)}</strong></span>
        <span>Desembolsos: <strong>${formatBs(s.out)}</strong></span>
        <span>Neto: <strong>${formatBs(s.net)}</strong></span>
      `;
    };
    showMonthTip(series.length - 1);

    for (const g of monthlyChartHost.querySelectorAll('.chart-bar-group')) {
      const idx = Number(g.dataset.chartMonth);
      g.addEventListener('mouseenter', () => showMonthTip(idx));
      g.addEventListener('click', () => showMonthTip(idx));
      g.addEventListener('focus', () => showMonthTip(idx));
    }

    // Chart 2: Active portfolio by category
    const cats = [
      { id: 'Oro/Joyas', color: '#B45309' },
      { id: 'Celulares', color: '#0F172A' },
      { id: 'Laptops/Consolas', color: '#334155' },
      { id: 'Herramientas/Otros', color: '#64748B' },
    ];
    const totalActiveCap = Math.max(1, placedCapital);
    categoryChartHost.innerHTML = cats
      .map((cat) => {
        const cap = activeBoletas.filter((b) => b.category === cat.id).reduce((s, b) => s + b.capital, 0);
        const pct = Math.round((cap / totalActiveCap) * 100);
        return `
          <div class="cat-bar-row">
            <div class="cat-bar-top">
              <span class="cat-bar-name">${escapeHtml(cat.id)}</span>
              <span><span class="cat-bar-val">${formatBs(cap)}</span> <span class="cat-bar-pct">(${pct}%)</span></span>
            </div>
            <div class="cat-track">
              <div class="cat-fill" style="inline-size:${pct}%;background-color:${cat.color};"></div>
            </div>
          </div>
        `;
      })
      .join('');

    // Alerts panel
    const alerts = boletas.filter((b) => ['por-vencer', 'vencida', 'remate'].includes(b.status));
    if (alerts.length === 0) {
      dashAlertsEl.innerHTML = `<p class="view-sub">No hay boletas por vencer ni vencidas.</p>`;
    } else {
      dashAlertsEl.innerHTML = alerts
        .map((b) => {
          const st = STATUS_META[b.status];
          const interest = monthlyInterest(b);
          return `
            <div class="alert-row">
              <div>
                <p class="alert-row__title">
                  ${escapeHtml(b.code)} · ${escapeHtml(b.item)}
                  <span class="badge ${st.cls}">${st.label}</span>
                </p>
                <p class="alert-row__sub">
                  ${escapeHtml(b.clientName)} (${escapeHtml(b.ci)}) · Vence: ${formatDateEs(b.dueDate)} · Renovar: <strong>${formatBs(interest)}</strong> · Rescatar: <strong>${formatBs(b.capital + interest)}</strong>
                </p>
              </div>
              <div class="alert-row__actions">
                <a class="btn btn--wa" href="${escapeHtml(buildReminderWaHref(b))}" target="_blank" rel="noopener noreferrer">Cobrar / Avisar por WhatsApp</a>
                <button type="button" class="btn btn--secondary" data-open-boleta="${escapeHtml(b.code)}">Gestionar</button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  // --- 2. Render Boletas ---
  function renderBoletas() {
    const q = boletaQuery.trim().toLowerCase();
    const list = boletas.filter((b) => {
      const matchFilter =
        boletaFilter === 'all' ||
        (boletaFilter === 'remate' ? b.status === 'remate' || b.status === 'rematada' : b.status === boletaFilter);
      const matchQuery =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.ci.toLowerCase().includes(q) ||
        b.item.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });

    if (list.length === 0) {
      boletasGridEl.innerHTML = `<div class="panel"><p class="view-sub">No encontramos boletas con ese filtro.</p></div>`;
      return;
    }

    boletasGridEl.innerHTML = list
      .map((b) => {
        const st = STATUS_META[b.status] || STATUS_META.vigente;
        const interest = monthlyInterest(b);
        return `
          <article class="boleta-card">
            <div class="boleta-card__head">
              <div>
                <span class="boleta-code">${escapeHtml(b.code)} · ${escapeHtml(b.category)}</span>
                <h2 class="boleta-title">${escapeHtml(b.item)}</h2>
                <p class="boleta-client">${escapeHtml(b.clientName)} · CI ${escapeHtml(b.ci)}</p>
              </div>
              <span class="badge ${st.cls}">${st.label}</span>
            </div>

            <div class="boleta-metrics">
              <div class="metric-item"><span class="metric-item__label">Capital</span><span class="metric-item__val">${formatBs(b.capital)}</span></div>
              <div class="metric-item"><span class="metric-item__label">Interés (${b.rate}%)</span><span class="metric-item__val">${formatBs(interest)}</span></div>
              <div class="metric-item"><span class="metric-item__label">Vencimiento</span><span class="metric-item__val">${formatDateEs(b.dueDate)}</span></div>
            </div>

            <div class="boleta-card__foot">
              <button type="button" class="btn btn--primary" data-open-boleta="${escapeHtml(b.code)}">Operar boleta</button>
              <div style="display:flex;gap:0.375rem;">
                <button type="button" class="btn btn--secondary" data-view-client-boleta="${escapeHtml(b.code)}">Vista cliente</button>
                <a class="btn btn--ghost" href="${escapeHtml(buildReminderWaHref(b))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  // --- Boleta Operations Modal ---
  function openBoletaDetail(code) {
    const b = boletas.find((x) => x.code === code);
    if (!b) return;
    const st = STATUS_META[b.status];
    const interest = monthlyInterest(b);
    const totalRedeem = b.capital + interest;
    const isClosed = b.status === 'rescatada' || b.status === 'rematada';
    const canAuction = b.status === 'vencida' || b.status === 'remate';

    detailTitleEl.textContent = `${b.code} — ${b.clientName}`;
    detailBodyEl.innerHTML = `
      <div class="form-stack">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
          <div>
            <strong>${escapeHtml(b.item)}</strong>
            <p class="view-sub">${escapeHtml(b.category)} · CI ${escapeHtml(b.ci)} · Avalúo ${formatBs(b.appraisal)}</p>
          </div>
          <span class="badge ${st.cls}">${st.label}</span>
        </div>

        ${b.photo ? `<img class="pledge-photo" src="${escapeHtml(b.photo)}" alt="Foto de prenda ${escapeHtml(b.code)}">` : ''}

        <div class="calc-preview">
          <div class="metric-item"><span class="metric-item__label">Capital actual</span><span class="metric-item__val">${formatBs(b.capital)}</span></div>
          <div class="metric-item"><span class="metric-item__label">Interés (${b.rate}%)</span><span class="metric-item__val">${formatBs(interest)}</span></div>
          <div class="metric-item"><span class="metric-item__label">Vence</span><span class="metric-item__val">${formatDateEs(b.dueDate)}</span></div>
        </div>

        ${
          !isClosed
            ? `
            <div class="field">
              <label for="op-method">Método de cobro en caja</label>
              <select id="op-method">
                <option value="Efectivo">Efectivo</option>
                <option value="QR Simple">QR Simple</option>
              </select>
            </div>

            <div class="op-box">
              <p class="op-box__title">1. Renovar 30 días (pagar solo interés)</p>
              <p class="view-sub">Cobra ${formatBs(interest)}, registra el ingreso en caja y extiende el vencimiento 30 días.</p>
              <button type="button" class="btn btn--primary" id="op-renew-btn">Cobrar ${formatBs(interest)} y renovar +30 días</button>
            </div>

            <div class="op-box">
              <p class="op-box__title">2. Abono a capital + interés</p>
              <div class="form-grid-2">
                <div class="field">
                  <label for="op-abono-val">Abono al capital (Bs)</label>
                  <input id="op-abono-val" type="number" min="50" max="${Math.max(50, b.capital - 50)}" step="50" inputmode="numeric" value="${Math.min(500, Math.floor(b.capital / 2))}">
                </div>
                <div style="display:flex;align-items:flex-end;">
                  <button type="button" class="btn btn--secondary btn--full" id="op-abono-btn">Registrar abono</button>
                </div>
              </div>
            </div>

            <div class="op-box">
              <p class="op-box__title">3. Rescatar prenda (liquidación total)</p>
              <p class="view-sub">Cobra capital (${formatBs(b.capital)}) + interés (${formatBs(interest)}) = <strong>${formatBs(totalRedeem)}</strong>.</p>
              <button type="button" class="btn btn--ok" id="op-redeem-btn">Liquidar ${formatBs(totalRedeem)} y entregar prenda</button>
            </div>

            ${
              canAuction
                ? `
                <div class="op-box">
                  <p class="op-box__title">4. Vender prenda en remate</p>
                  <div class="form-grid-2">
                    <div class="field">
                      <label for="op-auction-val">Precio de venta final (Bs)</label>
                      <input id="op-auction-val" type="number" min="50" step="10" inputmode="numeric" value="${Math.round(b.capital * 1.4)}">
                    </div>
                    <div style="display:flex;align-items:flex-end;">
                      <button type="button" class="btn btn--primary btn--full" id="op-auction-btn">Registrar remate</button>
                    </div>
                  </div>
                </div>`
                : ''
            }
          `
            : `<div class="op-box"><p class="view-sub">Esta boleta ya fue cerrada (${st.label}). Puedes consultar su comprobante QR abajo.</p></div>`
        }

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <button type="button" class="btn btn--secondary" id="op-qr-btn">Ver comprobante / QR</button>
          <a class="btn btn--wa" href="${escapeHtml(buildReminderWaHref(b))}" target="_blank" rel="noopener noreferrer">Recordar por WhatsApp</a>
        </div>
      </div>
    `;

    const getMethod = () => document.getElementById('op-method')?.value || 'Efectivo';

    document.getElementById('op-renew-btn')?.addEventListener('click', () => {
      const m = getMethod();
      const base = b.dueDate > addDays(TODAY, 0) ? new Date(`${b.dueDate}T12:00:00`) : TODAY;
      b.dueDate = addDays(base, 30);
      b.status = 'vigente';
      addLedgerEntry({ type: 'interes', direction: 'in', amount: interest, method: m, desc: `Renovación 30d ${b.code} (${b.clientName})` });
      persist();
      renderAll();
      detailDialog.close();
      showToast(`Boleta ${b.code} renovada (+${formatBs(interest)} en caja)`);
    });

    document.getElementById('op-abono-btn')?.addEventListener('click', () => {
      const abono = Math.round(Number(document.getElementById('op-abono-val')?.value) || 0);
      if (abono <= 0 || abono >= b.capital) {
        showToast('Ingresa un abono menor al capital actual');
        return;
      }
      const m = getMethod();
      b.capital -= abono;
      b.dueDate = addDays(TODAY, 30);
      b.status = 'vigente';
      addLedgerEntry({ type: 'interes', direction: 'in', amount: interest, method: m, desc: `Interés en abono ${b.code}` });
      addLedgerEntry({ type: 'rescate', direction: 'in', amount: abono, method: m, desc: `Abono a capital ${b.code} (nuevo saldo ${formatBs(b.capital)})` });
      persist();
      renderAll();
      detailDialog.close();
      showToast(`Abono registrado. Nuevo capital: ${formatBs(b.capital)}`);
    });

    document.getElementById('op-redeem-btn')?.addEventListener('click', () => {
      const m = getMethod();
      b.status = 'rescatada';
      addLedgerEntry({ type: 'rescate', direction: 'in', amount: totalRedeem, method: m, desc: `Rescate total ${b.code} (${b.item})` });
      persist();
      renderAll();
      detailDialog.close();
      showToast(`Prenda rescatada (+${formatBs(totalRedeem)} en caja)`);
    });

    document.getElementById('op-auction-btn')?.addEventListener('click', () => {
      const sale = Math.round(Number(document.getElementById('op-auction-val')?.value) || 0);
      if (sale <= 0) return;
      const m = getMethod();
      const profit = sale - b.capital;
      b.status = 'rematada';
      addLedgerEntry({ type: 'remate', direction: 'in', amount: sale, method: m, desc: `Remate ${b.code} (${b.item}) · Utilidad ${formatBs(profit)}` });
      persist();
      renderAll();
      detailDialog.close();
      showToast(`Remate registrado: ${formatBs(sale)} (Utilidad ${formatBs(profit)})`);
    });

    document.getElementById('op-qr-btn')?.addEventListener('click', () => {
      detailDialog.close();
      openBoletaQrModal(b);
    });

    detailDialog.showModal();
  }

  function openBoletaQrModal(b) {
    const interest = monthlyInterest(b);
    const url = getBoletaUrl(b.code);
    qrTitleEl.textContent = `Boleta Digital ${b.code}`;
    qrBodyEl.innerHTML = `
      <div class="qr-card">
        <div>
          <strong>Comercial Prendario Andino</strong>
          <p class="view-sub">${escapeHtml(b.code)} · ${escapeHtml(b.clientName)} (CI ${escapeHtml(b.ci)})</p>
        </div>
        <div class="qr-frame">${qrSvg(160)}</div>
        <div class="calc-preview" style="inline-size:100%;">
          <div class="metric-item"><span class="metric-item__label">Capital</span><span class="metric-item__val">${formatBs(b.capital)}</span></div>
          <div class="metric-item"><span class="metric-item__label">Renovar</span><span class="metric-item__val">${formatBs(interest)}</span></div>
          <div class="metric-item"><span class="metric-item__label">Vence</span><span class="metric-item__val">${formatDateEs(b.dueDate)}</span></div>
        </div>
        <p class="qr-notice"><strong>Prenda en custodia:</strong> ${escapeHtml(b.item)}. Escanea este código para verificar vencimiento y montos actualizados.</p>
      </div>
    `;
    qrFooterEl.innerHTML = `
      <div class="form-stack" style="gap:0.5rem;">
        <a class="btn btn--wa btn--full" href="${escapeHtml(buildReminderWaHref(b))}" target="_blank" rel="noopener noreferrer">Enviar boleta por WhatsApp</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <button type="button" class="btn btn--secondary" onclick="window.print()">Imprimir</button>
          <button type="button" class="btn btn--ghost" data-close-dialog>Cerrar</button>
        </div>
      </div>
    `;
    qrDialog.showModal();
  }

  function openOfficialQrPayModal(b) {
    const interest = monthlyInterest(b);
    qrTitleEl.textContent = 'QR Simple oficial del comercial';
    qrBodyEl.innerHTML = `
      <div class="qr-card">
        <div>
          <strong>Comercial Prendario Andino — La Paz</strong>
          <p class="view-sub">Titular verificado: Prendario Andino SRL (Cuenta demo)</p>
        </div>
        <div class="qr-frame">${qrSvg(168)}</div>
        <p class="qr-notice"><strong>Renovación ${escapeHtml(b.code)}:</strong> ${formatBs(interest)} · <strong>Rescate total:</strong> ${formatBs(b.capital + interest)}. Verifica el titular antes de confirmar y envía tu comprobante por WhatsApp.</p>
      </div>
    `;
    qrFooterEl.innerHTML = `<button type="button" class="btn btn--secondary btn--full" data-close-dialog>Cerrar</button>`;
    qrDialog.showModal();
  }

  // --- 3. Render Flujo de Caja ---
  function renderCashflow() {
    const totalIn = ledger.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = ledger.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
    const net = totalIn - totalOut;

    const cashNet = ledger
      .filter((t) => t.method === 'Efectivo')
      .reduce((s, t) => s + (t.direction === 'in' ? t.amount : -t.amount), 0);
    const qrNet = ledger
      .filter((t) => t.method === 'QR Simple')
      .reduce((s, t) => s + (t.direction === 'in' ? t.amount : -t.amount), 0);

    cashKpisEl.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-card__label">Total Ingresos</span>
        <span class="kpi-card__val kpi-card__val--ok">${formatBs(totalIn)}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Total Desembolsos / Egresos</span>
        <span class="kpi-card__val kpi-card__val--danger">${formatBs(totalOut)}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__label">Flujo Neto</span>
        <span class="kpi-card__val ${net >= 0 ? 'kpi-card__val--ok' : 'kpi-card__val--danger'}">${formatBs(net)}</span>
      </div>
    `;

    cashMethodsEl.innerHTML = `
      <span class="method-chip">Saldo en <strong>Efectivo:</strong> ${formatBs(cashNet)}</span>
      <span class="method-chip">Saldo en <strong>QR Simple:</strong> ${formatBs(qrNet)}</span>
    `;

    const filtered = ledger.filter((t) => cashFilter === 'all' || t.type === cashFilter);
    ledgerTbodyEl.innerHTML = filtered
      .map(
        (t) => `
        <tr>
          <td class="tabular">${formatDateEs(t.date)}</td>
          <td>${escapeHtml(TX_LABELS[t.type] || t.type)}</td>
          <td>${escapeHtml(t.desc)}</td>
          <td>${escapeHtml(t.method)}</td>
          <td class="ledger-amount ${t.direction === 'in' ? 'ledger-amount--in' : 'ledger-amount--out'}">
            ${t.direction === 'in' ? '+' : '-'}${formatBs(t.amount)}
          </td>
        </tr>`
      )
      .join('');
  }

  function exportLedgerCsv() {
    const headers = ['Fecha', 'Tipo', 'Detalle', 'Metodo', 'Direccion', 'Monto_Bs'];
    const rows = ledger.map((t) => [
      t.date,
      TX_LABELS[t.type] || t.type,
      `"${String(t.desc).replaceAll('"', '""')}"`,
      t.method,
      t.direction === 'in' ? 'Ingreso' : 'Egreso',
      t.direction === 'in' ? t.amount : -t.amount,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'libro-caja-prendario-andino.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Libro diario exportado en CSV');
  }

  // --- 4. Render Vista Cliente ---
  function renderClientView() {
    clientBoletaInput.value = selectedClientCode;
    clientChipsEl.innerHTML = boletas
      .slice(0, 5)
      .map(
        (b) =>
          `<button type="button" class="pill-btn" data-pick-client-boleta="${escapeHtml(b.code)}" aria-pressed="${b.code === selectedClientCode}">${escapeHtml(b.code)}</button>`
      )
      .join('');

    const b = boletas.find((x) => x.code.toUpperCase() === selectedClientCode.toUpperCase());
    if (!b) {
      clientBoletaHost.innerHTML = `<div class="panel"><p class="view-sub">No encontramos la boleta <strong>${escapeHtml(selectedClientCode)}</strong>. Prueba con los códigos de ejemplo arriba.</p></div>`;
      return;
    }

    const st = STATUS_META[b.status];
    const interest = monthlyInterest(b);
    const total = b.capital + interest;
    const consultHref = `https://wa.me/${WA_DEFAULT}?text=${encodeURIComponent(`Hola Comercial Prendario Andino, consulto por mi boleta ${b.code} (${b.item}).`)}`;

    clientBoletaHost.innerHTML = `
      <article class="panel">
        <div class="boleta-card__head">
          <div>
            <span class="boleta-code">${escapeHtml(b.code)} · ${escapeHtml(b.category)}</span>
            <h2 class="boleta-title" style="font-size:1.125rem;">${escapeHtml(b.item)}</h2>
            <p class="boleta-client">Titular: ${escapeHtml(b.clientName)} · Vencimiento: <strong>${formatDateEs(b.dueDate)}</strong></p>
          </div>
          <span class="badge ${st.cls}">${st.label}</span>
        </div>

        ${b.photo ? `<img class="pledge-photo" src="${escapeHtml(b.photo)}" alt="Prenda en custodia">` : ''}

        <div class="option-cards">
          <div class="pay-option">
            <span class="pay-option__label">Renovar 30 días más (solo interés)</span>
            <span class="pay-option__amount">${formatBs(interest)}</span>
            <span class="pay-option__sub">Tasa mensual: ${b.rate}% sobre ${formatBs(b.capital)}</span>
          </div>
          <div class="pay-option">
            <span class="pay-option__label">Rescatar hoy (capital + interés)</span>
            <span class="pay-option__amount">${formatBs(total)}</span>
            <span class="pay-option__sub">Entrega inmediata en sucursal La Paz</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <button type="button" class="btn btn--secondary" id="client-qr-btn">Ver QR Simple oficial</button>
          <a class="btn btn--wa" href="${escapeHtml(consultHref)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
        </div>
      </article>
    `;

    document.getElementById('client-qr-btn')?.addEventListener('click', () => {
      openOfficialQrPayModal(b);
    });
  }

  function renderAll() {
    renderDashboard();
    renderBoletas();
    renderCashflow();
    renderClientView();
  }

  // --- New Boleta live calculator ---
  function updateCalcPreview() {
    const cap = Number(nbCapital.value) || 0;
    const rate = Number(nbRate.value) || 8;
    const days = Number(nbTerm.value) || 30;
    const interest = Math.round(cap * (rate / 100));
    calcIntEl.textContent = formatBs(interest);
    calcTotalEl.textContent = formatBs(cap + interest);
    calcDueEl.textContent = formatDateEs(addDays(TODAY, days));
  }

  // --- Global event wiring ---
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      switchNav(navBtn.dataset.nav);
      return;
    }
    if (e.target.closest('[data-open-new-boleta]')) {
      newBoletaForm.reset();
      pendingPhoto = '';
      nbPhotoHost.hidden = true;
      nbPhotoHost.innerHTML = '';
      updateCalcPreview();
      newBoletaDialog.showModal();
      return;
    }
    const openB = e.target.closest('[data-open-boleta]');
    if (openB) {
      openBoletaDetail(openB.dataset.openBoleta);
      return;
    }
    const viewClientB = e.target.closest('[data-view-client-boleta]');
    if (viewClientB) {
      switchNav('cliente', viewClientB.dataset.viewClientBoleta);
      return;
    }
    const pickClient = e.target.closest('[data-pick-client-boleta]');
    if (pickClient) {
      selectedClientCode = pickClient.dataset.pickClientBoleta;
      renderClientView();
      return;
    }
    const bFilter = e.target.closest('[data-bfilter]');
    if (bFilter) {
      boletaFilter = bFilter.dataset.bfilter;
      for (const b of boletaFiltersEl.querySelectorAll('[data-bfilter]')) {
        b.setAttribute('aria-pressed', String(b.dataset.bfilter === boletaFilter));
      }
      renderBoletas();
      return;
    }
    const cFilter = e.target.closest('[data-cfilter]');
    if (cFilter) {
      cashFilter = cFilter.dataset.cfilter;
      for (const b of cashFiltersEl.querySelectorAll('[data-cfilter]')) {
        b.setAttribute('aria-pressed', String(b.dataset.cfilter === cashFilter));
      }
      renderCashflow();
      return;
    }
    if (e.target.closest('[data-reset-demo]')) {
      boletas = SEED_BOLETAS.map((x) => ({ ...x }));
      ledger = SEED_LEDGER.map((x) => ({ ...x }));
      localStorage.removeItem(STORAGE_BOLETAS);
      localStorage.removeItem(STORAGE_LEDGER);
      selectedClientCode = 'BOL-2026-0142';
      renderAll();
      showToast('Datos de ejemplo restaurados');
      return;
    }
    if (e.target.closest('[data-close-dialog]')) {
      e.target.closest('dialog')?.close();
    }
  });

  boletaSearchEl.addEventListener('input', () => {
    boletaQuery = boletaSearchEl.value;
    renderBoletas();
  });

  nbCapital.addEventListener('input', updateCalcPreview);
  nbRate.addEventListener('input', updateCalcPreview);
  nbTerm.addEventListener('change', updateCalcPreview);

  nbPhoto.addEventListener('change', async () => {
    const f = nbPhoto.files?.[0];
    if (!f) return;
    try {
      pendingPhoto = await compressImage(f);
      nbPhotoHost.innerHTML = `<img class="pledge-photo" src="${escapeHtml(pendingPhoto)}" alt="Vista previa de prenda">`;
      nbPhotoHost.hidden = false;
    } catch {
      showToast('No se pudo cargar la foto');
    }
  });

  newBoletaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(newBoletaForm);
    const maxSeq = boletas.reduce((m, b) => Math.max(m, Number(b.code.split('-').pop()) || 140), 140);
    const code = `BOL-2026-${String(maxSeq + 1).padStart(4, '0')}`;
    const capital = Math.round(Number(fd.get('capital')) || 0);
    const termDays = Number(fd.get('termDays')) || 30;
    const method = String(fd.get('method') || 'Efectivo');

    const created = {
      code,
      clientName: String(fd.get('clientName') || '').trim(),
      ci: `${String(fd.get('ci') || '').trim()} ${String(fd.get('ciExt') || 'LP')}`,
      phone: String(fd.get('phone') || WA_DEFAULT).trim(),
      category: String(fd.get('category') || 'Oro/Joyas'),
      item: String(fd.get('item') || '').trim(),
      appraisal: Math.round(Number(fd.get('appraisal')) || capital * 1.5),
      capital,
      rate: Number(fd.get('rate')) || 8,
      termDays,
      createdAt: addDays(TODAY, 0),
      dueDate: addDays(TODAY, termDays),
      status: 'vigente',
      photo: pendingPhoto,
    };

    boletas.unshift(created);
    addLedgerEntry({
      type: 'desembolso',
      direction: 'out',
      amount: capital,
      method,
      desc: `Desembolso ${code} (${created.item})`,
    });
    persist();
    renderAll();
    newBoletaDialog.close();
    openBoletaQrModal(created);
  });

  openManualTxBtn.addEventListener('click', () => {
    manualTxForm.reset();
    manualTxDialog.showModal();
  });

  manualTxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(manualTxForm);
    const type = String(fd.get('type') || 'gasto');
    addLedgerEntry({
      type,
      direction: type === 'gasto' ? 'out' : 'in',
      amount: Number(fd.get('amount')) || 0,
      method: String(fd.get('method') || 'Efectivo'),
      desc: String(fd.get('desc') || '').trim(),
    });
    renderAll();
    manualTxDialog.close();
    showToast('Movimiento registrado en Flujo de Caja');
  });

  exportCsvBtn.addEventListener('click', exportLedgerCsv);

  clientLookupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    selectedClientCode = clientBoletaInput.value.trim().toUpperCase();
    renderClientView();
  });

  // Boot
  switchNav(activeView, selectedClientCode);
})();
