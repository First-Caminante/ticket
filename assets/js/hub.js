(() => {
  const COOKIE_KEY = 'etc_cookie_consent_v1';

  // --- 1. Demos Category Filter ---
  const filterBar = document.querySelector('[data-filter-bar]');
  const grid = document.querySelector('[data-demo-grid]');
  const resultsMeta = document.querySelector('[data-results-count]');

  if (filterBar && grid) {
    const buttons = Array.from(filterBar.querySelectorAll('[data-filter]'));
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function applyFilter(selectedCategory) {
      let visibleCount = 0;
      for (const card of cards) {
        const matches =
          selectedCategory === 'all' || card.dataset.category === selectedCategory;
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      }

      for (const button of buttons) {
        const isSelected = button.dataset.filter === selectedCategory;
        button.setAttribute('aria-pressed', String(isSelected));
        if (isSelected) {
          button.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
          });
        }
      }

      if (resultsMeta) {
        resultsMeta.textContent = visibleCount === 1 ? '1 demo' : `${visibleCount} demos`;
      }
    }

    function selectCategory(category, syncUrl = true) {
      const valid = buttons.some((b) => b.dataset.filter === category);
      const target = valid ? category : 'all';
      const run = () => applyFilter(target);

      if (syncUrl && 'startViewTransition' in document && !reducedMotion.matches) {
        document.startViewTransition(run);
      } else {
        run();
      }

      if (syncUrl && 'history' in window) {
        const url = new URL(window.location.href);
        if (target === 'all') url.searchParams.delete('cat');
        else url.searchParams.set('cat', target);
        window.history.replaceState(null, '', url);
      }
    }

    filterBar.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button || button.getAttribute('aria-pressed') === 'true') return;
      selectCategory(button.dataset.filter, true);
    });

    const initialCat = new URLSearchParams(window.location.search).get('cat');
    if (initialCat) selectCategory(initialCat, false);
  }

  // --- 2. Legal Modals (<dialog>) ---
  const legalModal = document.getElementById('legal-modal');
  const legalTitle = document.getElementById('legal-modal-title');
  const legalBody = document.getElementById('legal-modal-body');

  const LEGAL_DOCS = {
    privacidad: {
      title: 'Política de Privacidad y Protección de Datos',
      html: `
        <p>En <strong>etc</strong> (La Paz, Bolivia) respetamos la privacidad de quienes visitan este sitio y prueban nuestras demostraciones interactivas.</p>
        <h3>1. Datos recopilados</h3>
        <p>Este sitio y sus demos funcionan de manera 100% estática en tu navegador. No recolectamos ni almacenamos datos personales en servidores externos. Los datos que ingreses durante una prueba (productos, órdenes o clientes de ejemplo) se guardan únicamente en el almacenamiento local (<code>localStorage</code>) de tu propio dispositivo.</p>
        <h3>2. Contacto por WhatsApp</h3>
        <p>Cuando decides escribirnos al <strong>+591 77398405</strong> mediante WhatsApp, la comunicación se rige por tu interacción voluntaria con nuestro canal de atención comercial para responder consultas o cotizaciones.</p>
        <h3>3. Control del usuario</h3>
        <p>Puedes eliminar en cualquier momento los datos guardados en las demos usando el botón «Restaurar datos demo» o limpiando el almacenamiento de tu navegador.</p>
      `,
    },
    terminos: {
      title: 'Términos y Condiciones de Uso',
      html: `
        <p>El acceso y uso del portal oficial y Centro de Demos de <strong>etc</strong> se rigen por los presentes términos aplicables a servicios digitales desarrollados en Bolivia.</p>
        <h3>1. Naturaleza de las demostraciones</h3>
        <p>Las micro-aplicaciones disponibles en la sección de Demos son entornos interactivos de muestra con negocios, precios en Bolivianos (Bs) y códigos QR de ejemplo. No procesan pagos reales ni generan obligaciones comerciales reales.</p>
        <h3>2. Contratación de proyectos</h3>
        <p>Cada proyecto a medida se acuerda mediante cotización escrita en Bolivianos (Bs), especificando alcance, plazo de entrega, dominio/hosting y condiciones de soporte.</p>
        <h3>3. Propiedad intelectual</h3>
        <p>La marca <strong>etc</strong>, su identidad visual y el código base de las demostraciones pertenecen a <strong>etc</strong>. Al contratar un desarrollo a medida, el cliente recibe los derechos de uso acordados para su negocio.</p>
      `,
    },
    cookies: {
      title: 'Política de Cookies y Almacenamiento Local',
      html: `
        <p>Este sitio prioriza la velocidad y la privacidad: <strong>no utiliza cookies publicitarias ni rastreadores de terceros</strong>.</p>
        <h3>1. Almacenamiento técnico esencial</h3>
        <p>Utilizamos exclusivamente <code>localStorage</code> del navegador para recordar tu aceptación de este aviso y para permitir que las demostraciones interactivas guarden cambios en vivo (carrito, inventario, boletas o sellos) en tu propio equipo.</p>
        <h3>2. Cómo desactivarlo</h3>
        <p>Puedes borrar o bloquear el almacenamiento local desde la configuración de tu navegador en cualquier momento sin afectar la lectura informativa de esta página.</p>
      `,
    },
  };

  function openLegal(docKey) {
    const doc = LEGAL_DOCS[docKey];
    if (!doc || !legalModal) return;
    legalTitle.textContent = doc.title;
    legalBody.innerHTML = doc.html;
    legalModal.showModal();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-legal]');
    if (trigger) {
      openLegal(trigger.dataset.legal);
      return;
    }
    if (e.target.closest('[data-close-legal]')) {
      legalModal?.close();
    }
  });

  // Fallback light-dismiss for Safari
  if (legalModal && !('closedBy' in HTMLDialogElement.prototype)) {
    let outsideDown = false;
    const isOut = (e) => {
      const r = legalModal.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    legalModal.addEventListener('pointerdown', (e) => { outsideDown = isOut(e); });
    legalModal.addEventListener('pointerup', (e) => {
      if (outsideDown && isOut(e)) legalModal.close();
      outsideDown = false;
    });
  }

  // --- 3. Discreet Cookie Notice (localStorage) ---
  const cookieNotice = document.getElementById('cookie-notice');
  const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

  if (cookieNotice && cookieAcceptBtn) {
    let accepted = false;
    try {
      accepted = localStorage.getItem(COOKIE_KEY) === 'accepted';
    } catch { /* ignore */ }

    if (!accepted) {
      cookieNotice.hidden = false;
    }

    cookieAcceptBtn.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_KEY, 'accepted');
      } catch { /* ignore */ }
      cookieNotice.hidden = true;
    });
  }

  // --- 4. Zen Enso Scroll Fallback (for browsers without CSS scroll()) ---
  const ensoMark = document.getElementById('enso-scroll-mark');
  const navEnso = document.querySelector('.brand-lockup__enso');
  const supportsScrollTimeline = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'scroll()');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (ensoMark && !supportsScrollTimeline && !reduceMotion) {
    let ticking = false;
    const updateEnso = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const x = Math.cos(p * Math.PI * 2) * 22;
      const y = -8 + Math.sin(p * Math.PI * 1.5) * 10;
      const rot = p * 320;
      const scale = 1.02 + Math.sin(p * Math.PI) * 0.16;
      ensoMark.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      if (navEnso) navEnso.style.transform = `rotate(${(p * 360).toFixed(1)}deg)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateEnso);
      }
    }, { passive: true });
    updateEnso();
  }
})();
