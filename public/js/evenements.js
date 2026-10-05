/**
 * evenements.js — Page Événements
 * =================================
 * Charge la liste des événements depuis /api/events et les affiche
 * dans une grille de cartes.
 */

document.addEventListener('DOMContentLoaded', () => {
  UMA.initPage({
    pageId: 'evenements',
    onReady: renderEvenementsPage
  });
});

/**
 * Peuple la page événements.
 * @param {Document} xml
 */
async function renderEvenementsPage(xml) {
  const nomUniv = UMA.xmlText(xml, 'universite nom', 'Université de la Manouba');
  UMA.setPageMeta(
    `Événements – Classements UMA`,
    `Retrouvez tous les événements liés aux classements internationaux de l'${nomUniv}.`
  );

  const grid    = document.getElementById('events-grid');
  const counter = document.getElementById('events-counter');

  if (!grid) return;

  // Afficher un loader
  grid.innerHTML = `<div class="loader" style="grid-column:1/-1"><div class="spinner"></div></div>`;

  try {
    const res    = await fetch('/api/events');
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const events = await res.json();

    // Compteur
    if (counter) {
      counter.innerHTML = events.length
        ? `<strong>${events.length}</strong> événement${events.length > 1 ? 's' : ''} trouvé${events.length > 1 ? 's' : ''}`
        : '';
    }

    if (events.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon" aria-hidden="true">📅</span>
          <p>Aucun événement disponible pour le moment.</p>
          <small style="color:var(--color-text-muted)">
            Ajoutez un dossier dans <code>/events/</code> pour qu'il apparaisse ici.
          </small>
        </div>`;
      return;
    }

    // Rendu des cartes
    grid.innerHTML = events.map((ev, i) => {
      const delay     = `delay-${Math.min((i % 5) + 1, 5)}`;
      const day       = UMA.getDay(ev.date);
      const month     = UMA.getMonthShort(ev.date);
      const dateLong  = UMA.formatDate(ev.date);

      const imageHTML = ev.imageUrl
        ? `<img src="${ev.imageUrl}" alt="${escapeHtml(ev.titre)}" loading="lazy"
                onerror="this.parentElement.innerHTML=noImageFallback()">`
        : `<div class="event-card-image-placeholder">
             <span class="icon" aria-hidden="true">📷</span>
             <span>Pas d'image</span>
           </div>`;

      return `
        <article class="event-card fade-up ${delay}">
          <div class="event-card-image">
            ${imageHTML}
            ${ev.date ? `
            <div class="event-date-badge" aria-label="${dateLong}">
              <div class="day">${day}</div>
              <div class="month">${month}</div>
            </div>` : ''}
          </div>
          <div class="event-card-body">
            <div class="event-meta">
              <span class="icon" aria-hidden="true">🗓️</span>
              <time datetime="${ev.date || ''}">${dateLong}</time>
            </div>
            <h2 class="event-title">${escapeHtml(ev.titre)}</h2>
            ${ev.description
              ? `<p class="event-desc">${escapeHtml(ev.description)}</p>`
              : ''}
          </div>
        </article>`;
    }).join('');

    // Ré-observer les nouvelles cartes
    requestAnimationFrame(() => {
      if (window.UMA._reinitScrollAnim) window.UMA._reinitScrollAnim();
    });

  } catch (err) {
    console.error('[UMA] Erreur chargement événements :', err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-icon" aria-hidden="true">⚠️</span>
        <p>Impossible de charger les événements.</p>
        <small style="color:var(--color-text-muted)">${err.message}</small>
      </div>`;
  }
}

function noImageFallback() {
  return `<div class="event-card-image-placeholder">
    <span class="icon" aria-hidden="true">📷</span>
    <span>Image indisponible</span>
  </div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
