(() => {
  const filterBar = document.querySelector('[data-filter-bar]');
  const grid = document.querySelector('[data-demo-grid]');
  const resultsMeta = document.querySelector('[data-results-count]');

  if (!filterBar || !grid) return;

  const buttons = Array.from(filterBar.querySelectorAll('[data-filter]'));
  const cards = Array.from(grid.querySelectorAll('[data-category]'));
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateCards(selectedCategory) {
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
          behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
        });
      }
    }

    if (resultsMeta) {
      const label = visibleCount === 1 ? '1 demo' : `${visibleCount} demos`;
      resultsMeta.textContent = label;
    }
  }

  function selectCategory(category, syncUrl = true) {
    const valid = buttons.some((btn) => btn.dataset.filter === category);
    const target = valid ? category : 'all';

    const apply = () => updateCards(target);

    if (
      syncUrl &&
      'startViewTransition' in document &&
      !reducedMotionQuery.matches
    ) {
      document.startViewTransition(apply);
    } else {
      apply();
    }

    if (syncUrl && 'history' in window) {
      const url = new URL(window.location.href);
      if (target === 'all') {
        url.searchParams.delete('cat');
      } else {
        url.searchParams.set('cat', target);
      }
      window.history.replaceState(null, '', url);
    }
  }

  filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    if (button.getAttribute('aria-pressed') === 'true') return;
    selectCategory(button.dataset.filter, true);
  });

  // Restore active filter if linked with ?cat=...
  const initialCat = new URLSearchParams(window.location.search).get('cat');
  if (initialCat) {
    selectCategory(initialCat, false);
  }
})();
