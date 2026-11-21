(() => {
  'use strict';

  const STORAGE_KEY = 'altiplano_pos_state_v1';
  const WA_NUMBER = '59177398405';

  const INITIAL_PRODUCTS = [
    { id: 'p1', sku: 'FER-101', name: 'Taladro Percutor 650W', category: 'Ferretería', cost: 230, price: 340, stock: 8, minStock: 3, sold: 6 },
    { id: 'p2', sku: 'FER-102', name: 'Juego Llaves Combinadas 12 pzas', category: 'Ferretería', cost: 88, price: 135, stock: 14, minStock: 4, sold: 9 },
    { id: 'p3', sku: 'FER-103', name: 'Cinta Métrica 5m Reforzada', category: 'Ferretería', cost: 14, price: 25, stock: 2, minStock: 5, sold: 15 },
    { id: 'p4', sku: 'ILU-201', name: 'Foco LED 18W Luz Fría', category: 'Iluminación', cost: 11, price: 20, stock: 42, minStock: 10, sold: 34 },
    { id: 'p5', sku: 'ILU-202', name: 'Reflector LED Exterior 50W', category: 'Iluminación', cost: 48, price: 78, stock: 11, minStock: 4, sold: 11 },
    { id: 'p6', sku: 'ILU-203', name: 'Panel LED Embutido 24W', category: 'Iluminación', cost: 34, price: 55, stock: 0, minStock: 5, sold: 13 },
    { id: 'p7', sku: 'ELE-301', name: 'Toma Corriente Doble con Tierra', category: 'Eléctrico', cost: 13, price: 22, stock: 30, minStock: 8, sold: 19 },
    { id: 'p8', sku: 'ELE-302', name: 'Cable Eléctrico #12 (Metro)', category: 'Eléctrico', cost: 5.5, price: 9, stock: 120, minStock: 25, sold: 48 },
    { id: 'p9', sku: 'ELE-303', name: 'Térmico Bipolar 32A', category: 'Eléctrico', cost: 26, price: 42, stock: 3, minStock: 5, sold: 8 },
    { id: 'p10', sku: 'ACC-401', name: 'Guantes de Seguridad Nitrilo', category: 'Accesorios', cost: 12, price: 22, stock: 24, minStock: 6, sold: 17 }
  ];

  const INITIAL_MOVEMENTS = [
    { id: 'm1', time: '09:15', type: 'sale', method: 'Efectivo', concept: 'Venta #1041 · 4x Foco LED 18W, 1x Cinta Métrica 5m', amount: 105, profit: 47 },
    { id: 'm2', time: '10:40', type: 'sale', method: 'QR Simple', concept: 'Venta #1042 · 1x Taladro Percutor 650W', amount: 340, profit: 110 },
    { id: 'm3', time: '11:25', type: 'expense', method: 'Efectivo', concept: 'Compra de bolsas y pasajes entrega', amount: 35, profit: 0 },
    { id: 'm4', time: '12:10', type: 'sale', method: 'Efectivo', concept: 'Venta #1043 · 2x Reflector LED 50W, 1x Térmico 32A', amount: 198, profit: 76 }
  ];

  const INITIAL_WEEK = [
    { label: 'Vie', sales: 1120 },
    { label: 'Sáb', sales: 1680 },
    { label: 'Dom', sales: 540 },
    { label: 'Lun', sales: 1290 },
    { label: 'Mar', sales: 1410 },
    { label: 'Mié', sales: 1185 }
  ];

  function createDefaultState() {
    return {
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      movements: JSON.parse(JSON.stringify(INITIAL_MOVEMENTS)),
      weekHistory: JSON.parse(JSON.stringify(INITIAL_WEEK)),
      nextTicket: 1044
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.movements)) {
          return parsed;
        }
      }
    } catch (_) {}
    return createDefaultState();
  }

  let state = loadState();
  let activeModule = 'pos';
  let posCategory = 'Todos';
  let posQuery = '';
  let invFilter = 'all';
  let cart = [];
  let payMethod = 'Efectivo';
  let restockTargetId = null;

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function fmtBs(val) {
    const n = Number(val) || 0;
    return 'Bs ' + n.toLocaleString('es-BO', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
  }

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // Toast
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
  }

  // Navigation
  function setModule(mod) {
    activeModule = mod;
    document.querySelectorAll('[data-module-view]').forEach((el) => {
      el.hidden = el.dataset.moduleView !== mod;
    });
    document.querySelectorAll('[data-nav-mod]').forEach((btn) => {
      btn.setAttribute('aria-current', btn.dataset.navMod === mod ? 'page' : 'false');
    });
    renderAll();
  }

  document.querySelectorAll('[data-nav-mod]').forEach((btn) => {
    btn.addEventListener('click', () => setModule(btn.dataset.navMod));
  });

  // Reset demo data
  document.querySelectorAll('[data-reset-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state = createDefaultState();
      cart = [];
      saveState();
      renderAll();
      showToast('Datos demo restaurados');
    });
  });

  // =========================================================================
  // POS MODULE
  // =========================================================================
  function getCartQty(productId) {
    const item = cart.find((c) => c.id === productId);
    return item ? item.qty : 0;
  }

  function addToCart(productId) {
    const prod = state.products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) return;
    const current = getCartQty(productId);
    if (current >= prod.stock) {
      showToast(`Stock máximo disponible: ${prod.stock}`);
      return;
    }
    const existing = cart.find((c) => c.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: prod.id, qty: 1 });
    renderPOS();
  }

  function updateCartQty(productId, delta) {
    const idx = cart.findIndex((c) => c.id === productId);
    if (idx === -1) return;
    const prod = state.products.find((p) => p.id === productId);
    const next = cart[idx].qty + delta;
    if (next <= 0) {
      cart.splice(idx, 1);
    } else if (prod && next > prod.stock) {
      showToast(`Solo quedan ${prod.stock} en stock`);
      return;
    } else {
      cart[idx].qty = next;
    }
    renderPOS();
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const prod = state.products.find((p) => p.id === item.id);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  }

  function renderPOS() {
    const grid = document.getElementById('pos-products');
    if (!grid) return;

    const q = posQuery.trim().toLowerCase();
    const filtered = state.products.filter((p) => {
      const matchCat = posCategory === 'Todos' || p.category === posCategory;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    grid.innerHTML = filtered.map((p) => {
      const inCart = getCartQty(p.id);
      let badgeCls = 'stock-tag--ok';
      let badgeTxt = `Stock ${p.stock}`;
      if (p.stock === 0) { badgeCls = 'stock-tag--out'; badgeTxt = 'Agotado'; }
      else if (p.stock <= p.minStock) { badgeCls = 'stock-tag--low'; badgeTxt = `Bajo · ${p.stock}`; }

      return `
        <button type="button" class="prod-card" data-add-prod="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
          ${inCart > 0 ? `<span class="prod-in-cart tnum">${inCart}</span>` : ''}
          <div class="prod-card__top">
            <span class="prod-sku tnum">${p.sku}</span>
            <span class="stock-tag ${badgeCls} tnum">${badgeTxt}</span>
          </div>
          <div class="prod-name">${p.name}</div>
          <div class="prod-price tnum">${fmtBs(p.price)}</div>
        </button>
      `;
    }).join('') || '<div class="ticket-empty" style="grid-column:1/-1;">No se encontraron productos con ese filtro.</div>';

    grid.querySelectorAll('[data-add-prod]').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.dataset.addProd));
    });

    // Ticket items
    const listEl = document.getElementById('ticket-items');
    const total = getCartTotal();
    const totalEl = document.getElementById('ticket-total-val');
    const clearBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (totalEl) totalEl.textContent = fmtBs(total);
    if (clearBtn) clearBtn.hidden = cart.length === 0;
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      listEl.innerHTML = '<div class="ticket-empty">Toca cualquier producto para armar el ticket de venta.</div>';
    } else {
      listEl.innerHTML = cart.map((item) => {
        const p = state.products.find((pr) => pr.id === item.id);
        if (!p) return '';
        return `
          <div class="ticket-row">
            <div>
              <div class="ticket-row__name">${p.name}</div>
              <div class="ticket-row__sub tnum">${fmtBs(p.price)} c/u</div>
            </div>
            <div class="qty-ctrl">
              <button type="button" class="qty-btn" data-qty-dec="${p.id}" aria-label="Quitar uno">−</button>
              <span class="qty-val tnum">${item.qty}</span>
              <button type="button" class="qty-btn" data-qty-inc="${p.id}" aria-label="Sumar uno">+</button>
            </div>
            <div class="ticket-row__total tnum">${fmtBs(p.price * item.qty)}</div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('[data-qty-dec]').forEach((b) => b.addEventListener('click', () => updateCartQty(b.dataset.qtyDec, -1)));
      listEl.querySelectorAll('[data-qty-inc]').forEach((b) => b.addEventListener('click', () => updateCartQty(b.dataset.qtyInc, 1)));
    }

    updateChangeDisplay();
  }

  function updateChangeDisplay() {
    const total = getCartTotal();
    const paidInput = document.getElementById('cash-paid-input');
    const changeEl = document.getElementById('cash-change-val');
    const cashBox = document.getElementById('cash-pay-box');
    const qrBox = document.getElementById('qr-pay-box');

    if (cashBox) cashBox.hidden = payMethod !== 'Efectivo';
    if (qrBox) qrBox.hidden = payMethod !== 'QR Simple';

    if (!paidInput || !changeEl) return;
    const paid = parseFloat(paidInput.value);
    if (!total || isNaN(paid)) {
      changeEl.textContent = 'Bs 0';
      changeEl.classList.remove('is-short');
      return;
    }
    const diff = paid - total;
    if (diff < 0) {
      changeEl.textContent = `Falta ${fmtBs(Math.abs(diff))}`;
      changeEl.classList.add('is-short');
    } else {
      changeEl.textContent = fmtBs(diff);
      changeEl.classList.remove('is-short');
    }
  }

  document.getElementById('pos-search')?.addEventListener('input', (e) => {
    posQuery = e.target.value;
    renderPOS();
  });

  document.querySelectorAll('[data-pos-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      posCategory = btn.dataset.posCat;
      document.querySelectorAll('[data-pos-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderPOS();
    });
  });

  document.querySelectorAll('[data-pay-method]').forEach((btn) => {
    btn.addEventListener('click', () => {
      payMethod = btn.dataset.payMethod;
      document.querySelectorAll('[data-pay-method]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      updateChangeDisplay();
    });
  });

  document.getElementById('cash-paid-input')?.addEventListener('input', updateChangeDisplay);

  document.querySelectorAll('[data-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('cash-paid-input');
      if (!input) return;
      input.value = btn.dataset.bill === 'exact' ? getCartTotal() : btn.dataset.bill;
      updateChangeDisplay();
    });
  });

  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    cart = [];
    const input = document.getElementById('cash-paid-input');
    if (input) input.value = '';
    renderPOS();
  });

  // QR Modal
  document.getElementById('show-qr-btn')?.addEventListener('click', () => {
    const total = getCartTotal();
    document.getElementById('qr-amount-label').textContent = fmtBs(total);
    document.getElementById('qr-modal').showModal();
  });

  // Checkout & Emit Receipt
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) return;
    const total = getCartTotal();
    const paidInput = document.getElementById('cash-paid-input');
    let paid = total;
    let change = 0;

    if (payMethod === 'Efectivo' && paidInput && paidInput.value !== '') {
      paid = parseFloat(paidInput.value) || 0;
      if (paid < total) {
        showToast('El monto recibido es menor al total');
        return;
      }
      change = paid - total;
    }

    let profit = 0;
    const summaryParts = [];
    const receiptItems = [];

    cart.forEach((item) => {
      const prod = state.products.find((p) => p.id === item.id);
      if (!prod) return;
      prod.stock = Math.max(0, prod.stock - item.qty);
      prod.sold = (prod.sold || 0) + item.qty;
      profit += (prod.price - prod.cost) * item.qty;
      summaryParts.push(`${item.qty}x ${prod.name}`);
      receiptItems.push({ name: prod.name, qty: item.qty, subtotal: prod.price * item.qty });
    });

    const ticketNum = state.nextTicket++;
    const time = nowTime();

    state.movements.unshift({
      id: 'm' + Date.now(),
      time,
      type: 'sale',
      method: payMethod,
      concept: `Venta #${ticketNum} · ${summaryParts.join(', ')}`,
      amount: total,
      profit
    });

    saveState();

    // Build Receipt Modal
    const receiptBox = document.getElementById('receipt-content');
    receiptBox.innerHTML = `
      <div class="receipt-line"><strong>Comercial Altiplano</strong><span class="tnum">Recibo #${ticketNum}</span></div>
      <div class="receipt-line"><span>La Paz, Bolivia</span><span class="tnum">Hoy · ${time}</span></div>
      <hr style="border:0;border-block-start:1px dashed #CBD5E1;margin:0.25rem 0;">
      ${receiptItems.map((r) => `<div class="receipt-line"><span>${r.qty}x ${r.name}</span><span class="tnum">${fmtBs(r.subtotal)}</span></div>`).join('')}
      <hr style="border:0;border-block-start:1px dashed #CBD5E1;margin:0.25rem 0;">
      <div class="receipt-line"><strong>TOTAL</strong><strong class="tnum">${fmtBs(total)}</strong></div>
      <div class="receipt-line"><span>Método de pago</span><span>${payMethod}</span></div>
      ${payMethod === 'Efectivo' ? `<div class="receipt-line"><span>Recibido / Cambio</span><span class="tnum">${fmtBs(paid)} / ${fmtBs(change)}</span></div>` : ''}
    `;

    const waText = `Comprobante Comercial Altiplano · Recibo #${ticketNum} (${time})%0A` +
      receiptItems.map((r) => `• ${r.qty}x ${r.name}: ${fmtBs(r.subtotal)}`).join('%0A') +
      `%0ATotal: ${fmtBs(total)} (${payMethod}). ¡Gracias por su compra!`;
    document.getElementById('receipt-wa-btn').href = `https://wa.me/${WA_NUMBER}?text=${waText}`;

    cart = [];
    if (paidInput) paidInput.value = '';
    renderAll();
    document.getElementById('receipt-modal').showModal();
  });

  // =========================================================================
  // INVENTORY MODULE
  // =========================================================================
  function renderInventory() {
    const lowCount = state.products.filter((p) => p.stock <= p.minStock).length;
    document.querySelectorAll('[data-low-badge]').forEach((el) => {
      el.textContent = String(lowCount);
      el.hidden = lowCount === 0;
    });

    const totalValCost = state.products.reduce((s, p) => s + p.cost * p.stock, 0);
    const totalValSale = state.products.reduce((s, p) => s + p.price * p.stock, 0);
    const totalUnits = state.products.reduce((s, p) => s + p.stock, 0);

    const kpiCount = document.getElementById('inv-kpi-count');
    const kpiVal = document.getElementById('inv-kpi-value');
    const kpiLow = document.getElementById('inv-kpi-low');
    if (kpiCount) kpiCount.textContent = `${state.products.length} SKUs · ${totalUnits} uds.`;
    if (kpiVal) kpiVal.textContent = fmtBs(totalValSale);
    if (document.getElementById('inv-kpi-cost')) document.getElementById('inv-kpi-cost').textContent = `Costo: ${fmtBs(totalValCost)}`;
    if (kpiLow) kpiLow.textContent = String(lowCount);

    const tbody = document.getElementById('inv-tbody');
    if (!tbody) return;

    const list = state.products.filter((p) => {
      if (invFilter === 'low') return p.stock > 0 && p.stock <= p.minStock;
      if (invFilter === 'out') return p.stock === 0;
      return true;
    });

    tbody.innerHTML = list.map((p) => {
      const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
      let cls = 'stock-tag--ok';
      let label = `${p.stock} uds.`;
      if (p.stock === 0) { cls = 'stock-tag--out'; label = 'Agotado'; }
      else if (p.stock <= p.minStock) { cls = 'stock-tag--low'; label = `Bajo (${p.stock})`; }

      return `
        <tr>
          <td class="tnum"><strong>${p.sku}</strong></td>
          <td><strong>${p.name}</strong><div style="font-size:0.75rem;color:#64748B;">${p.category}</div></td>
          <td class="num-col tnum">${fmtBs(p.cost)}</td>
          <td class="num-col tnum"><strong>${fmtBs(p.price)}</strong></td>
          <td class="num-col tnum">${margin}%</td>
          <td><span class="stock-tag ${cls} tnum">${label}</span></td>
          <td class="num-col">
            <button type="button" class="btn btn--outline btn--sm" data-restock-id="${p.id}">+ Reponer</button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748B;padding:1.5rem;">Sin productos en este filtro.</td></tr>';

    tbody.querySelectorAll('[data-restock-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prod = state.products.find((p) => p.id === btn.dataset.restockId);
        if (!prod) return;
        restockTargetId = prod.id;
        document.getElementById('restock-prod-name').textContent = `${prod.name} (Stock actual: ${prod.stock})`;
        document.getElementById('restock-qty').value = '10';
        document.getElementById('restock-modal').showModal();
      });
    });
  }

  document.querySelectorAll('[data-inv-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      invFilter = btn.dataset.invFilter;
      document.querySelectorAll('[data-inv-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderInventory();
    });
  });

  document.querySelectorAll('[data-quick-restock]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('restock-qty').value = btn.dataset.quickRestock;
    });
  });

  document.getElementById('restock-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const qty = parseInt(document.getElementById('restock-qty').value, 10) || 0;
    const prod = state.products.find((p) => p.id === restockTargetId);
    if (!prod || qty <= 0) return;
    prod.stock += qty;
    saveState();
    document.getElementById('restock-modal').close();
    renderAll();
    showToast(`+${qty} unidades añadidas a ${prod.name}`);
  });

  document.getElementById('open-new-prod-btn')?.addEventListener('click', () => {
    document.getElementById('new-prod-form').reset();
    document.getElementById('new-prod-modal').showModal();
  });

  document.getElementById('new-prod-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prod = {
      id: 'p' + Date.now(),
      sku: String(fd.get('sku')).trim().toUpperCase(),
      name: String(fd.get('name')).trim(),
      category: String(fd.get('category')),
      cost: parseFloat(fd.get('cost')) || 0,
      price: parseFloat(fd.get('price')) || 0,
      stock: parseInt(fd.get('stock'), 10) || 0,
      minStock: parseInt(fd.get('minStock'), 10) || 3,
      sold: 0
    };
    state.products.unshift(prod);
    saveState();
    document.getElementById('new-prod-modal').close();
    renderAll();
    showToast(`Producto ${prod.sku} creado`);
  });

  // =========================================================================
  // CASH CONTROL MODULE
  // =========================================================================
  function getTodayMetrics() {
    let salesTotal = 0, cashIn = 0, qrIn = 0, expenses = 0, grossProfit = 0;
    state.movements.forEach((m) => {
      if (m.type === 'sale') {
        salesTotal += m.amount;
        grossProfit += m.profit || 0;
        if (m.method === 'Efectivo') cashIn += m.amount;
        else qrIn += m.amount;
      } else {
        expenses += m.amount;
      }
    });
    return {
      salesTotal,
      cashIn,
      qrIn,
      expenses,
      grossProfit,
      netBalance: salesTotal - expenses
    };
  }

  function renderCash() {
    const m = getTodayMetrics();
    document.getElementById('cash-sales').textContent = fmtBs(m.salesTotal);
    document.getElementById('cash-efectivo').textContent = fmtBs(m.cashIn);
    document.getElementById('cash-qr').textContent = fmtBs(m.qrIn);
    document.getElementById('cash-expenses').textContent = fmtBs(m.expenses);
    document.getElementById('cash-profit').textContent = fmtBs(m.grossProfit);
    document.getElementById('cash-net').textContent = fmtBs(m.netBalance);

    const tbody = document.getElementById('cash-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.movements.map((mv) => {
      const isSale = mv.type === 'sale';
      return `
        <tr>
          <td class="tnum">${mv.time}</td>
          <td><span class="stock-tag ${isSale ? 'stock-tag--ok' : 'stock-tag--out'}">${isSale ? 'Venta' : 'Gasto'}</span></td>
          <td>${mv.concept}</td>
          <td>${mv.method}</td>
          <td class="num-col tnum" style="font-weight:700;color:${isSale ? '#047857' : '#B91C1C'};">${isSale ? '+' : '−'}${fmtBs(mv.amount)}</td>
          <td class="num-col tnum" style="color:#475569;">${isSale ? fmtBs(mv.profit) : '—'}</td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('open-expense-btn')?.addEventListener('click', () => {
    document.getElementById('expense-form').reset();
    document.getElementById('expense-modal').showModal();
  });

  document.getElementById('expense-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = parseFloat(fd.get('amount')) || 0;
    if (amount <= 0) return;
    state.movements.unshift({
      id: 'e' + Date.now(),
      time: nowTime(),
      type: 'expense',
      method: String(fd.get('method')),
      concept: String(fd.get('concept')).trim(),
      amount,
      profit: 0
    });
    saveState();
    document.getElementById('expense-modal').close();
    renderAll();
    showToast('Gasto registrado en caja');
  });

  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    const header = ['Hora', 'Tipo', 'Método', 'Concepto', 'Monto (Bs)', 'Ganancia Bruta (Bs)'];
    const rows = state.movements.map((mv) => [
      mv.time,
      mv.type === 'sale' ? 'Venta' : 'Gasto',
      mv.method,
      `"${mv.concept.replace(/"/g, '""')}"`,
      mv.type === 'sale' ? mv.amount : -mv.amount,
      mv.profit || 0
    ]);
    const csv = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-altiplano-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cierre CSV descargado');
  });

  // =========================================================================
  // STATS MODULE
  // =========================================================================
  function renderStats() {
    const m = getTodayMetrics();
    const days = [...state.weekHistory, { label: 'Hoy', sales: m.salesTotal, today: true }];
    const maxSales = Math.max(...days.map((d) => d.sales), 1);

    const chart = document.getElementById('stats-bar-chart');
    if (chart) {
      chart.innerHTML = days.map((d) => {
        const pct = Math.max(8, Math.round((d.sales / maxSales) * 100));
        return `
          <div class="bar-col ${d.today ? 'bar-col--today' : ''}">
            <span class="bar-val tnum">${Math.round(d.sales)}</span>
            <div class="bar-fill" style="height: ${pct}%;" title="${d.label}: ${fmtBs(d.sales)}"></div>
            <span class="bar-label">${d.label}</span>
          </div>
        `;
      }).join('');
    }

    // Top 5 products
    const top5 = [...state.products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const maxSold = Math.max(...top5.map((p) => p.sold || 0), 1);
    const rankEl = document.getElementById('stats-top5');
    if (rankEl) {
      rankEl.innerHTML = top5.map((p, idx) => {
        const pct = Math.round(((p.sold || 0) / maxSold) * 100);
        return `
          <div>
            <div class="rank-item__top">
              <span><strong>${idx + 1}.</strong> ${p.name}</span>
              <span class="tnum"><strong>${p.sold || 0} uds.</strong> · ${fmtBs((p.sold || 0) * p.price)}</span>
            </div>
            <div class="rank-track"><div class="rank-bar" style="width:${pct}%;"></div></div>
          </div>
        `;
      }).join('');
    }

    // Cash vs QR Split
    const totalPay = m.cashIn + m.qrIn;
    const cashPct = totalPay > 0 ? Math.round((m.cashIn / totalPay) * 100) : 50;
    const qrPct = 100 - cashPct;
    document.getElementById('split-cash-bar').style.width = cashPct + '%';
    document.getElementById('split-qr-bar').style.width = qrPct + '%';
    document.getElementById('split-cash-label').textContent = `Efectivo: ${fmtBs(m.cashIn)} (${cashPct}%)`;
    document.getElementById('split-qr-label').textContent = `QR Simple: ${fmtBs(m.qrIn)} (${qrPct}%)`;
  }

  // Close dialog buttons
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dlg = btn.closest('dialog');
      if (dlg) dlg.close();
    });
  });

  document.querySelectorAll('dialog.pos-modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
  });

  function renderAll() {
    renderPOS();
    renderInventory();
    renderCash();
    renderStats();
  }

  renderAll();
})();
