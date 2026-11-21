(() => {
  const STORAGE_KEY = 'patitas_del_sur_pets_v1';
  const WA_CLINIC = '59177398405';

  const SEED_PETS = [
    {
      id: 'max',
      code: 'PS-101',
      name: 'Max',
      species: 'Perro',
      breed: 'Mestizo',
      age: '3 años',
      weight: '14.5 kg',
      tutor: 'Carla M.',
      phone: '77398405',
      vaccines: [
        { name: 'Antirrábica', applied: '23 Nov 2025', nextDue: 'En 3 días', status: 'pronto', statusLabel: 'Próximo refuerzo (en 3 días)' },
        { name: 'Séxtuple Canina', applied: '14 Ago 2026', nextDue: '14 Ago 2027', status: 'al-dia', statusLabel: 'Al día' },
        { name: 'Desparasitación interna', applied: '02 Oct 2026', nextDue: '02 Ene 2027', status: 'al-dia', statusLabel: 'Al día' },
      ],
    },
    {
      id: 'luna',
      code: 'PS-102',
      name: 'Luna',
      species: 'Gata',
      breed: 'Siamés',
      age: '1 año',
      weight: '3.8 kg',
      tutor: 'Diego R.',
      phone: '77398405',
      vaccines: [
        { name: 'Triple Felina', applied: '10 Sep 2026', nextDue: '10 Sep 2027', status: 'al-dia', statusLabel: 'Al día' },
        { name: 'Desparasitación', applied: '15 Ago 2026', nextDue: 'Hace 5 días', status: 'vencida', statusLabel: 'Vencida (hace 5 días)' },
      ],
    },
    {
      id: 'rocky',
      code: 'PS-103',
      name: 'Rocky',
      species: 'Perro',
      breed: 'Golden Retriever',
      age: '5 años',
      weight: '31 kg',
      tutor: 'Sofía P.',
      phone: '77398405',
      vaccines: [
        { name: 'Antirrábica', applied: '05 Jun 2026', nextDue: '05 Jun 2027', status: 'al-dia', statusLabel: 'Al día' },
        { name: 'Séxtuple Canina', applied: '05 Jun 2026', nextDue: '05 Jun 2027', status: 'al-dia', statusLabel: 'Al día' },
        { name: 'Desparasitación', applied: '18 Oct 2026', nextDue: '18 Ene 2027', status: 'al-dia', statusLabel: 'Al día' },
      ],
    },
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
    return SEED_PETS.map((p) => ({ ...p, vaccines: p.vaccines.map((v) => ({ ...v })) }));
  }

  function loadPets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneSeed();
    } catch {
      return cloneSeed();
    }
  }

  function savePets() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch {
      // Ignore storage errors
    }
  }

  function normalizePhone(raw) {
    const d = String(raw || '').replace(/\D/g, '');
    if (!d) return WA_CLINIC;
    return d.startsWith('591') ? d : `591${d}`;
  }

  function qrSvg(size = 86) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 29 29" shape-rendering="crispEdges" role="img" aria-label="Código QR de identificación de mascota">
        <rect width="29" height="29" fill="#FFFFFF"/>
        <path fill="#111827" d="M1,1 h7 v7 h-7 z M2,2 v5 h5 v-5 z M3,3 h3 v3 h-3 z"/>
        <path fill="#111827" d="M21,1 h7 v7 h-7 z M22,2 v5 h5 v-5 z M23,3 h3 v3 h-3 z"/>
        <path fill="#111827" d="M1,21 h7 v7 h-7 z M2,22 v5 h5 v-5 z M3,23 h3 v3 h-3 z"/>
        <path fill="#111827" d="M10,1 h2 v2 h-2 z M14,1 h2 v2 h-2 z M18,1 h1 v3 h-1 z M10,4 h2 v2 h-2 z M13,4 h3 v2 h-3 z M17,5 h2 v2 h-2 z M1,10 h3 v2 h-3 z M5,10 h2 v2 h-2 z M9,10 h3 v2 h-3 z M14,10 h2 v3 h-2 z M18,10 h3 v2 h-3 z M23,10 h3 v2 h-3 z M1,14 h2 v2 h-2 z M5,13 h3 v3 h-3 z M10,14 h3 v2 h-3 z M15,14 h3 v2 h-3 z M20,13 h2 v3 h-2 z M24,14 h3 v2 h-3 z M10,17 h2 v2 h-2 z M14,17 h2 v2 h-2 z M18,17 h3 v2 h-3 z M23,17 h2 v3 h-2 z M10,21 h3 v2 h-3 z M15,21 h2 v2 h-2 z M19,21 h3 v2 h-3 z M24,21 h3 v2 h-3 z M10,25 h2 v3 h-2 z M14,24 h3 v3 h-3 z M19,25 h2 v2 h-2 z M23,24 h2 v3 h-2 z M26,25 h2 v3 h-2 z"/>
      </svg>
    `;
  }

  let pets = loadPets();
  let activeView = 'vet';
  let selectedPetId = pets[0].id;
  let toastTimer = null;

  const paramPet = new URLSearchParams(window.location.search).get('mascota');
  if (paramPet) {
    const found = pets.find((p) => p.id === paramPet.toLowerCase());
    if (found) {
      activeView = 'cliente';
      selectedPetId = found.id;
    }
  }

  const viewVetEl = document.getElementById('view-vet');
  const viewClientEl = document.getElementById('view-cliente');
  const registerBtn = document.getElementById('open-register-btn');
  const remindersListEl = document.getElementById('reminders-list');
  const remindersCountEl = document.getElementById('reminders-count');
  const patientsGridEl = document.getElementById('patients-grid');
  const petChipsEl = document.getElementById('pet-chips');
  const carnetContentEl = document.getElementById('carnet-content');

  const registerDialog = document.getElementById('register-dialog');
  const registerForm = document.getElementById('register-form');
  const modeSelect = document.getElementById('reg-mode');
  const existingPetFields = document.getElementById('existing-pet-fields');
  const newPetFields = document.getElementById('new-pet-fields');
  const existingPetSelect = document.getElementById('reg-pet-id');

  const infoDialog = document.getElementById('info-dialog');
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

  function badgeShortLabel(status) {
    if (status === 'pronto') return 'Pronto';
    if (status === 'vencida') return 'Vencida';
    return 'Al día';
  }

  function buildReminderText(pet, vac) {
    const carnetUrl = new URL(window.location.href);
    carnetUrl.searchParams.set('mascota', pet.id);
    return [
      `Hola ${pet.tutor}, te recordamos desde Veterinaria Patitas del Sur que a ${pet.name} le toca su refuerzo de ${vac.name} (${vac.statusLabel}).`,
      `Puedes revisar su carnet digital aquí: ${carnetUrl.toString()}`,
      '¿Deseas agendar cita esta semana?',
    ].join('\n');
  }

  function switchView(view, petId) {
    activeView = view;
    viewVetEl.hidden = view !== 'vet';
    viewClientEl.hidden = view !== 'cliente';
    registerBtn.hidden = view !== 'vet';

    for (const btn of document.querySelectorAll('[data-switch-view]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.switchView === view));
    }

    const url = new URL(window.location.href);
    if (view === 'cliente') {
      if (petId) selectedPetId = petId;
      url.searchParams.set('mascota', selectedPetId);
      renderClientView();
    } else {
      url.searchParams.delete('mascota');
      renderVetView();
    }
    window.history.replaceState(null, '', url);
  }

  function renderVetView() {
    const dueReminders = [];
    for (const pet of pets) {
      for (const vac of pet.vaccines) {
        if (vac.status === 'pronto' || vac.status === 'vencida') {
          dueReminders.push({ pet, vac });
        }
      }
    }

    remindersCountEl.textContent =
      dueReminders.length === 1 ? '1 pendiente' : `${dueReminders.length} pendientes`;

    if (dueReminders.length === 0) {
      remindersListEl.innerHTML = `<p class="reminder-sub">Todos los pacientes están al día esta semana.</p>`;
    } else {
      remindersListEl.innerHTML = dueReminders
        .map(({ pet, vac }) => {
          const waHref = `https://wa.me/${normalizePhone(pet.phone)}?text=${encodeURIComponent(buildReminderText(pet, vac))}`;
          return `
            <div class="reminder-item">
              <div class="reminder-info">
                <p class="reminder-title">
                  ${escapeHtml(pet.name)} (${escapeHtml(pet.species)})
                  <span class="status-badge status-badge--${vac.status}">${escapeHtml(vac.statusLabel)}</span>
                </p>
                <p class="reminder-sub">Tutor: ${escapeHtml(pet.tutor)} · Dosis: ${escapeHtml(vac.name)}</p>
              </div>
              <div class="reminder-actions">
                <a class="btn btn--wa btn--sm" href="${escapeHtml(waHref)}" target="_blank" rel="noopener noreferrer">Recordar por WhatsApp</a>
                <button type="button" class="btn btn--secondary btn--sm" data-open-carnet="${escapeHtml(pet.id)}">Ver carnet</button>
              </div>
            </div>
          `;
        })
        .join('');
    }

    patientsGridEl.innerHTML = pets
      .map((pet) => {
        const worst = pet.vaccines.some((v) => v.status === 'vencida')
          ? 'vencida'
          : pet.vaccines.some((v) => v.status === 'pronto')
            ? 'pronto'
            : 'al-dia';
        return `
          <article class="patient-card">
            <div class="patient-card__head">
              <div>
                <h3 class="patient-name">${escapeHtml(pet.name)}</h3>
                <p class="patient-meta">${escapeHtml(pet.species)} · ${escapeHtml(pet.breed)} · ${escapeHtml(pet.age)}</p>
                <p class="patient-meta">Tutor: ${escapeHtml(pet.tutor)}</p>
              </div>
              <span class="status-badge status-badge--${worst}">${badgeShortLabel(worst)}</span>
            </div>

            <div class="patient-doses">
              ${pet.vaccines
                .slice(0, 3)
                .map(
                  (v) => `
                  <div class="dose-mini">
                    <span>${escapeHtml(v.name)}</span>
                    <span class="status-badge status-badge--${v.status}">${badgeShortLabel(v.status)}</span>
                  </div>`
                )
                .join('')}
            </div>

            <div class="patient-card__actions">
              <button type="button" class="btn btn--secondary btn--sm btn--full" data-open-carnet="${escapeHtml(pet.id)}">Ver carnet</button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderClientView() {
    const pet = pets.find((p) => p.id === selectedPetId) || pets[0];
    selectedPetId = pet.id;

    petChipsEl.innerHTML = `
      <span class="pet-chips__label">Carnet de prueba:</span>
      ${pets
        .map(
          (p) =>
            `<button type="button" class="chip-btn" data-pick-pet="${escapeHtml(p.id)}" aria-pressed="${p.id === pet.id}">${escapeHtml(p.name)} (${escapeHtml(p.species)})</button>`
        )
        .join('')}
    `;

    const agendaMsg = `Hola Veterinaria Patitas del Sur, quiero agendar un refuerzo de vacuna para ${pet.name} (${pet.species}, Tutor: ${pet.tutor}).`;
    const agendaHref = `https://wa.me/${WA_CLINIC}?text=${encodeURIComponent(agendaMsg)}`;

    carnetContentEl.innerHTML = `
      <article class="pet-id-card">
        <div>
          <h2 class="pet-id-card__title">${escapeHtml(pet.name)}</h2>
          <p class="pet-id-card__sub">${escapeHtml(pet.species)} · ${escapeHtml(pet.breed)}</p>
          <div class="pet-specs">
            <div class="pet-spec"><span class="pet-spec__label">Edad</span><span class="pet-spec__val">${escapeHtml(pet.age)}</span></div>
            <div class="pet-spec"><span class="pet-spec__label">Peso</span><span class="pet-spec__val">${escapeHtml(pet.weight)}</span></div>
            <div class="pet-spec"><span class="pet-spec__label">Tutor</span><span class="pet-spec__val">${escapeHtml(pet.tutor)}</span></div>
          </div>
        </div>
        <div class="pet-qr-box">
          ${qrSvg(84)}
          <span class="pet-qr-code">${escapeHtml(pet.code)}</span>
        </div>
      </article>

      <section class="timeline-card" aria-labelledby="hist-title">
        <h3 id="hist-title" class="section-heading" style="margin:0;">Historial de vacunas y desparasitaciones</h3>
        <ul class="vaccine-list">
          ${pet.vaccines
            .map(
              (v) => `
              <li class="vaccine-row">
                <div class="vaccine-row__top">
                  <span class="vaccine-name">${escapeHtml(v.name)}</span>
                  <span class="status-badge status-badge--${v.status}">${badgeShortLabel(v.status)}</span>
                </div>
                <div class="vaccine-dates">
                  <span>Aplicada: <strong>${escapeHtml(v.applied)}</strong></span>
                  <span>Próxima dosis: <strong>${escapeHtml(v.nextDue)}</strong></span>
                </div>
              </li>`
            )
            .join('')}
        </ul>

        <div class="carnet-actions">
          <a class="btn btn--wa" href="${escapeHtml(agendaHref)}" target="_blank" rel="noopener noreferrer">Agendar refuerzo por WhatsApp</a>
          <button type="button" class="btn btn--secondary" id="open-info-btn">Dirección y horarios</button>
        </div>
      </section>
    `;

    document.getElementById('open-info-btn')?.addEventListener('click', () => {
      infoDialog.showModal();
    });
  }

  function populatePetSelect() {
    existingPetSelect.innerHTML = pets
      .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} — ${escapeHtml(p.tutor)}</option>`)
      .join('');
  }

  // Events
  document.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-switch-view]');
    if (sw) {
      switchView(sw.dataset.switchView);
      return;
    }
    const openCarnet = e.target.closest('[data-open-carnet]');
    if (openCarnet) {
      switchView('cliente', openCarnet.dataset.openCarnet);
      return;
    }
    const pickPet = e.target.closest('[data-pick-pet]');
    if (pickPet) {
      selectedPetId = pickPet.dataset.pickPet;
      const url = new URL(window.location.href);
      url.searchParams.set('mascota', selectedPetId);
      window.history.replaceState(null, '', url);
      renderClientView();
      return;
    }
    if (e.target.closest('[data-close-dialog]')) {
      e.target.closest('dialog')?.close();
    }
  });

  registerBtn.addEventListener('click', () => {
    registerForm.reset();
    populatePetSelect();
    existingPetFields.hidden = false;
    newPetFields.hidden = true;
    registerDialog.showModal();
  });

  modeSelect.addEventListener('change', () => {
    const isNew = modeSelect.value === 'new-pet';
    existingPetFields.hidden = isNew;
    newPetFields.hidden = !isNew;
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const doseName = String(fd.get('vaccine') || '').trim();
    const nextDate = String(fd.get('nextDue') || '').trim() || 'En 6 meses';
    const status = String(fd.get('status') || 'al-dia');
    const statusLabel = status === 'pronto' ? `Próximo refuerzo (${nextDate})` : status === 'vencida' ? `Vencida (${nextDate})` : 'Al día';

    const newDose = {
      name: doseName,
      applied: 'Hoy',
      nextDue: nextDate,
      status,
      statusLabel,
    };

    if (modeSelect.value === 'new-pet') {
      const petName = String(fd.get('petName') || '').trim();
      if (!petName) return;
      const id = `${petName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-3)}`;
      pets.unshift({
        id,
        code: `PS-${101 + pets.length}`,
        name: petName,
        species: String(fd.get('species') || 'Perro'),
        breed: String(fd.get('breed') || 'Mestizo').trim() || 'Mestizo',
        age: String(fd.get('age') || '1 año').trim() || '1 año',
        weight: String(fd.get('weight') || '8 kg').trim() || '8 kg',
        tutor: String(fd.get('tutor') || 'Tutor').trim() || 'Tutor',
        phone: String(fd.get('phone') || WA_CLINIC).trim(),
        vaccines: [newDose],
      });
      selectedPetId = id;
      showToast(`Paciente ${petName} registrado`);
    } else {
      const pet = pets.find((p) => p.id === fd.get('petId'));
      if (pet) {
        pet.vaccines.unshift(newDose);
        selectedPetId = pet.id;
        showToast(`Dosis registrada para ${pet.name}`);
      }
    }

    savePets();
    renderVetView();
    registerDialog.close();
  });

  resetBtn.addEventListener('click', () => {
    pets = cloneSeed();
    localStorage.removeItem(STORAGE_KEY);
    selectedPetId = pets[0].id;
    renderVetView();
    renderClientView();
    showToast('Datos de ejemplo restaurados');
  });

  // Boot
  if (activeView === 'cliente') {
    switchView('cliente', selectedPetId);
  } else {
    renderVetView();
  }
})();
