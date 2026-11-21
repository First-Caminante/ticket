(() => {
  'use strict';

  const WA_NUMBER = '59177398405';
  const STYLE_KEY = 'etc_landing_ventas_style_v1';
  const COOKIE_KEY = 'etc_landing_ventas_cookies_v1';

  const BUSINESS_META = {
    editorial: { name: 'Clínica Dental Aura (Calacoto, La Paz)', title: 'Clínica Dental Aura · Editorial Lujo | etc' },
    bento: { name: 'Nexo Seguridad & Domótica (La Paz)', title: 'Nexo Seguridad & Domótica · Bento Tech | etc' },
    kinetic: { name: 'Kora Fitness Studio (Sopocachi, La Paz)', title: 'Kora Fitness Studio · Bold Kinetic | etc' },
    ropa: { name: 'Atelier Altura · Moda Urbana (La Paz)', title: 'Atelier Altura · Lookbook Ropa | etc' },
    tenis: { name: 'Kinetic Kicks LPZ · Sneakers (La Paz)', title: 'Kinetic Kicks LPZ · Tenis Drop | etc' },
    veterinario: { name: 'VitalPet Clínica Veterinaria (San Miguel, La Paz)', title: 'VitalPet · Veterinaria | etc' },
    comida: { name: 'Brasa & Humo · Smash Burgers (La Paz)', title: 'Brasa & Humo · Comida | etc' },
    pasteleria: { name: 'Maison Sucre · Pastelería de Autor (Calacoto)', title: 'Maison Sucre · Pastelería | etc' },
    electronica: { name: 'Volt Store Bolivia · Tecnología Original (La Paz)', title: 'Volt Store · Electrónica | etc' }
  };

  let activeStyle = 'editorial';

  const styleButtons = Array.from(document.querySelectorAll('[data-style-btn]'));
  const views = {};
  Object.keys(BUSINESS_META).forEach((key) => {
    views[key] = document.getElementById(`view-${key}`);
  });

  function initScrollReveals(container) {
    if (!container) return;
    // Replay hero stagger animations smoothly on style switch
    container.querySelectorAll('[data-stagger]').forEach((el, idx) => {
      el.style.setProperty('--stagger-i', String(idx));
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  function setStyle(style, pushParam = true) {
    if (!views[style]) style = 'editorial';
    activeStyle = style;
    document.body.dataset.activeStyle = style;
    document.title = BUSINESS_META[style].title;

    Object.entries(views).forEach(([key, el]) => {
      if (el) el.hidden = key !== style;
    });

    styleButtons.forEach((btn) => {
      const selected = btn.dataset.styleBtn === style;
      btn.setAttribute('aria-selected', String(selected));
      if (selected) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    try { localStorage.setItem(STYLE_KEY, style); } catch (_) {}

    if (pushParam && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('estilo', style);
      window.history.replaceState({}, '', url);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    initScrollReveals(views[style]);
  }

  styleButtons.forEach((btn) => {
    btn.addEventListener('click', () => setStyle(btn.dataset.styleBtn));
  });

  const params = new URLSearchParams(window.location.search);
  const initialStyle = params.get('estilo') || (() => {
    try { return localStorage.getItem(STYLE_KEY); } catch (_) { return null; }
  })() || 'editorial';
  setStyle(initialStyle, false);

  function formatBs(amount) {
    return 'Bs ' + Number(amount).toLocaleString('es-BO');
  }

  // =========================================================================
  // Interactive Quoter in Bs (Estilo 2: Nexo Seguridad)
  // =========================================================================
  const quoterInputs = Array.from(document.querySelectorAll('[data-quoter-item]'));
  const quoterTotalEl = document.getElementById('quoter-total');
  const quoterSummaryEl = document.getElementById('quoter-summary-text');
  const quoterWaBtn = document.getElementById('quoter-wa-btn');

  function updateQuoter() {
    const selected = quoterInputs.filter((el) => el.checked);
    const total = selected.reduce((sum, el) => sum + Number(el.dataset.price || 0), 0);
    const names = selected.map((el) => el.dataset.name);

    if (quoterTotalEl) quoterTotalEl.textContent = formatBs(total);
    if (quoterSummaryEl) {
      quoterSummaryEl.textContent = selected.length
        ? `${selected.length} ${selected.length === 1 ? 'ítem seleccionado' : 'ítems seleccionados'} · Instalación estimada en 24h en La Paz.`
        : 'Selecciona al menos un módulo para calcular tu estimado en bolivianos.';
    }
    if (quoterWaBtn) {
      const msg = selected.length
        ? `Hola Nexo Seguridad, armé este paquete estimado (${formatBs(total)}): ${names.join(', ')}. Quiero solicitar una cotización formal.`
        : 'Hola Nexo Seguridad, quiero solicitar una cotización personalizada de cámaras o domótica en La Paz.';
      quoterWaBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
  }
  quoterInputs.forEach((input) => input.addEventListener('change', updateQuoter));
  updateQuoter();

  // =========================================================================
  // Interactive Size Picker (Estilo 4: Atelier Altura — Ropa)
  // =========================================================================
  document.querySelectorAll('[data-ropa-card]').forEach((card) => {
    const itemName = card.dataset.ropaName;
    const itemPrice = card.dataset.ropaPrice;
    const link = card.querySelector('[data-ropa-link]');
    const btns = Array.from(card.querySelectorAll('[data-ropa-size]'));

    function sync(size) {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ropaSize === size)));
      if (link) {
        const msg = `Hola Atelier Altura, quiero pedir ${itemName} en talla ${size} (${itemPrice}).`;
        link.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      }
    }

    btns.forEach((b) => b.addEventListener('click', () => sync(b.dataset.ropaSize)));
    sync('M');
  });

  // =========================================================================
  // Interactive Sneaker Drop Selector (Estilo 5: Kinetic Kicks — Tenis)
  // =========================================================================
  const TENIS_MODELS = {
    apex: {
      name: 'Apex Carbon Runner',
      price: 490,
      spec: 'Placa de carbono · Peso ultraligero 215g · Stock inmediato en La Paz',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
    },
    court: {
      name: 'Court Low Retro',
      price: 380,
      spec: 'Cuero sintético premium · Suela cosida · Ideal uso diario',
      img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    },
    trail: {
      name: 'Trail Illimani GTX',
      price: 540,
      spec: 'Agarre todoterreno · Repelente al agua · Amortiguación reactiva',
      img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    }
  };
  let activeTenisModel = 'apex';
  let activeTenisSize = '41';

  function updateTenis() {
    const m = TENIS_MODELS[activeTenisModel];
    const nameEl = document.getElementById('tenis-selected-name');
    const priceEl = document.getElementById('tenis-selected-price');
    const specEl = document.getElementById('tenis-selected-spec');
    const imgEl = document.getElementById('tenis-hero-img');
    const ctaEl = document.getElementById('tenis-wa-cta');

    if (nameEl) nameEl.textContent = m.name;
    if (priceEl) priceEl.textContent = formatBs(m.price);
    if (specEl) specEl.textContent = m.spec;
    if (imgEl && imgEl.src !== m.img) {
      imgEl.style.opacity = '0.35';
      imgEl.src = m.img;
      imgEl.alt = m.name;
      imgEl.onload = () => { imgEl.style.opacity = '1'; };
    }
    if (ctaEl) {
      const msg = `Hola Kinetic Kicks LPZ, quiero apartar ${m.name} en talla EU ${activeTenisSize} (${formatBs(m.price)}).`;
      ctaEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      ctaEl.textContent = `Apartar talla EU ${activeTenisSize} por WhatsApp`;
    }
  }

  document.querySelectorAll('[data-tenis-model]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTenisModel = btn.dataset.tenisModel;
      document.querySelectorAll('[data-tenis-model]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      updateTenis();
    });
  });

  document.querySelectorAll('[data-tenis-eu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTenisSize = btn.dataset.tenisEu;
      document.querySelectorAll('[data-tenis-eu]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      updateTenis();
    });
  });
  updateTenis();

  // =========================================================================
  // Interactive Pet Toggle (Estilo 6: VitalPet — Veterinario)
  // =========================================================================
  const vetCta = document.getElementById('vet-wa-cta');
  document.querySelectorAll('[data-vet-pet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pet = btn.dataset.vetPet;
      document.querySelectorAll('[data-vet-pet]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (vetCta) {
        const msg = `Hola VitalPet, quiero agendar una consulta para mi ${pet} en San Miguel.`;
        vetCta.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
        vetCta.textContent = `Agendar cita para mi ${pet} por WhatsApp`;
      }
    });
  });

  // =========================================================================
  // Interactive Cake Builder (Estilo 8: Maison Sucre — Pastelería)
  // =========================================================================
  let cakeSizeLabel = '20 porciones';
  let cakePrice = 240;
  let cakeFlavor = 'Frutos Rojos & Vainilla';

  function updateCake() {
    const priceEl = document.getElementById('pastel-live-price');
    const summaryEl = document.getElementById('pastel-live-summary');
    const ctaEl = document.getElementById('pastel-wa-cta');
    if (priceEl) priceEl.textContent = formatBs(cakePrice);
    if (summaryEl) summaryEl.textContent = `Torta de ${cakeSizeLabel} · Sabor ${cakeFlavor}`;
    if (ctaEl) {
      const msg = `Hola Maison Sucre, quiero encargar una torta de ${cakeSizeLabel}, sabor ${cakeFlavor} (${formatBs(cakePrice)}).`;
      ctaEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
  }

  document.querySelectorAll('[data-cake-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cakeSizeLabel = btn.dataset.cakeSize;
      cakePrice = Number(btn.dataset.cakePrice || 240);
      document.querySelectorAll('[data-cake-size]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      updateCake();
    });
  });

  document.querySelectorAll('[data-cake-flavor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cakeFlavor = btn.dataset.cakeFlavor;
      document.querySelectorAll('[data-cake-flavor]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      updateCake();
    });
  });
  updateCake();

  // =========================================================================
  // Legal Modals (<dialog>)
  // =========================================================================
  const modal = document.getElementById('lp-legal-modal');
  const modalTitle = document.getElementById('lp-modal-title');
  const modalBody = document.getElementById('lp-modal-body');

  function getLegalContent(docKey) {
    const biz = BUSINESS_META[activeStyle].name;
    if (docKey === 'privacidad') {
      return {
        title: 'Política de Privacidad',
        html: `
          <p><strong>${biz}</strong> respeta la privacidad de sus visitantes y clientes.</p>
          <h3>1. Datos recopilados</h3>
          <p>Esta página no solicita contraseñas ni almacena datos bancarios. Cuando presionas un botón de WhatsApp para escribir al <strong>+591 77398405</strong>, compartes tu consulta de forma voluntaria para recibir atención comercial.</p>
          <h3>2. Finalidad</h3>
          <p>La información enviada se usa exclusivamente para agendar citas, coordinar pedidos o enviar cotizaciones en bolivianos.</p>
          <h3>3. Estándar incluido</h3>
          <p>Este sitio forma parte del Centro de Demos de <strong>etc</strong> y muestra la base legal incluida en cada entrega.</p>
        `
      };
    }
    if (docKey === 'terminos') {
      return {
        title: 'Términos de Uso',
        html: `
          <p>El uso de la página comercial de <strong>${biz}</strong> implica la aceptación de estos lineamientos básicos.</p>
          <h3>1. Precios y stock referenciales</h3>
          <p>Los precios publicados en bolivianos (Bs) y la disponibilidad de productos, tallas u horarios se confirman al momento del pedido por WhatsApp oficial (+591 77398405).</p>
          <h3>2. Propiedad del contenido</h3>
          <p>Diseño, estructura y código de demostración elaborados por <strong>etc · Soluciones Digitales</strong> en La Paz, Bolivia.</p>
        `
      };
    }
    return {
      title: 'Aviso de Cookies y Almacenamiento Local',
      html: `
        <p>Este sitio utiliza únicamente almacenamiento local esencial del navegador (<code>localStorage</code>).</p>
        <h3>1. Uso técnico</h3>
        <p>Guardamos tu preferencia de rubro/estilo visual y la confirmación de este aviso para no volver a mostrarlo.</p>
        <h3>2. Cero rastreadores publicitarios</h3>
        <p>No instalamos cookies de terceros ni píxeles invasivos de seguimiento en esta demostración.</p>
      `
    };
  }

  function openLegal(docKey) {
    if (!modal) return;
    const doc = getLegalContent(docKey);
    modalTitle.textContent = doc.title;
    modalBody.innerHTML = doc.html;
    modal.showModal();
  }

  document.querySelectorAll('[data-lp-legal]').forEach((btn) => {
    btn.addEventListener('click', () => openLegal(btn.dataset.lpLegal));
  });

  document.querySelectorAll('[data-lp-close]').forEach((btn) => {
    btn.addEventListener('click', () => modal && modal.close());
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }

  // =========================================================================
  // Discreet Cookie Banner
  // =========================================================================
  const cookieEl = document.getElementById('lp-cookie');
  const cookieAccept = document.getElementById('lp-cookie-accept');

  try {
    if (cookieEl && !localStorage.getItem(COOKIE_KEY)) {
      cookieEl.hidden = false;
    }
  } catch (_) {}

  if (cookieAccept && cookieEl) {
    cookieAccept.addEventListener('click', () => {
      cookieEl.hidden = true;
      try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch (_) {}
    });
  }
})();
