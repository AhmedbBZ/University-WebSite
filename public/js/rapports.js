/**
 * rapports.js — Page Rapports
 * ============================
 * Charge la liste des rapports depuis /api/reports et les affiche.
 * Chaque élément déclenche le téléchargement du PDF.
 */

document.addEventListener('DOMContentLoaded', () => {
  UMA.initPage({
    pageId: 'rapports',
    onReady: renderRapportsPage
  });
});

/**
 * Peuple la page rapports.
 * @param {Document} xml
 */
async function renderRapportsPage(xml) {
  const nomUniv = UMA.xmlText(xml, 'universite nom', 'Université de la Manouba');
  UMA.setPageMeta(
    `Rapports – Classements UMA`,
    `Téléchargez les rapports officiels sur les classements internationaux de l'${nomUniv}.`
  );

  const list    = document.getElementById('reports-list');
  const counter = document.getElementById('reports-counter');

  if (!list) return;

  // Loader
  list.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;

  try {
    const res     = await fetch('/api/reports');
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const reports = await res.json();

    // Compteur
    if (counter) {
      counter.innerHTML = reports.length
        ? `<strong>${reports.length}</strong> rapport${reports.length > 1 ? 's' : ''} disponible${reports.length > 1 ? 's' : ''}`
        : '';
    }

    if (reports.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon" aria-hidden="true">📄</span>
          <p>Aucun rapport disponible pour le moment.</p>
          <small style="color:var(--color-text-muted)">
            Déposez des fichiers PDF dans <code>/reports/</code> au format
            <code>AAAA-MM-JJ_titre.pdf</code>.
          </small>
        </div>`;
      return;
    }

    // Rendu des éléments
    list.innerHTML = reports.map((rp, i) => {
      const delay    = `delay-${Math.min((i % 5) + 1, 5)}`;
      const dateLong = UMA.formatDate(rp.date);
      const titre    = rp.titre
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      const dlUrl = `/api/reports/download/${encodeURIComponent(rp.filename)}`;

      return `
        <a class="report-item fade-up ${delay}"
           href="${dlUrl}"
           download="${rp.filename}"
           aria-label="Télécharger ${titre} (${rp.sizeStr})">
          <div class="report-icon" aria-hidden="true">📄</div>
          <div class="report-body">
            <div class="report-title">${escapeHtml(titre)}</div>
            <div class="report-meta">
              <span>📅 ${dateLong}</span>
              <span class="sep">·</span>
              <span>📦 ${rp.sizeStr}</span>
              <span class="sep">·</span>
              <span>PDF</span>
            </div>
          </div>
          <div class="report-download" aria-hidden="true">
            ⬇ Télécharger
          </div>
        </a>`;
    }).join('');

  } catch (err) {
    console.error('[UMA] Erreur chargement rapports :', err);
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">⚠️</span>
        <p>Impossible de charger les rapports.</p>
        <small style="color:var(--color-text-muted)">${err.message}</small>
      </div>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
