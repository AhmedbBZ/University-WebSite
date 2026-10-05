/**
 * index.js — Page d'accueil
 * ==========================
 * Charge le XML et peuple dynamiquement :
 *  - Le hero (slogan + image)
 *  - La section Université
 *  - La grille des 6 points forts
 */

document.addEventListener('DOMContentLoaded', () => {
  UMA.initPage({
    pageId: 'accueil',
    onReady: renderHomePage
  });
});

/**
 * Peuple la page d'accueil depuis le XML.
 * @param {Document} xml
 */
async function renderHomePage(xml) {
  const nomUniv = UMA.xmlText(xml, 'universite nom', 'Université de la Manouba');
  UMA.setPageMeta(
    `${nomUniv} – Classements Internationaux`,
    'Découvrez les classements internationaux de l\'Université de la Manouba : QS World, QS Arab Region, Times Higher Education et plus encore.'
  );

  // ── Hero ───────────────────────────────────────────────────────────────────
  const slogan    = UMA.xmlText(xml, 'accueil slogan', '');
  const heroImage = UMA.xmlText(xml, 'accueil image_hero', '');

  const heroBg = document.getElementById('hero-bg');
  if (heroBg && heroImage) {
    heroBg.style.backgroundImage = `url('${heroImage}')`;
  }

  const heroSloganEl = document.getElementById('hero-slogan');
  if (heroSloganEl) heroSloganEl.textContent = slogan;

  // ── Section Université ─────────────────────────────────────────────────────
  const univTitre = UMA.xmlText(xml, 'accueil presentation titre', '');
  const univTexte = UMA.xmlText(xml, 'accueil presentation texte', '');
  const univImage = UMA.xmlText(xml, 'accueil presentation image', '');

  const univTitreEl = document.getElementById('univ-titre');
  const univTexteEl = document.getElementById('univ-texte');
  const univImageEl = document.getElementById('univ-image');

  if (univTitreEl) univTitreEl.textContent = univTitre;
  if (univTexteEl) univTexteEl.textContent = univTexte;
  if (univImageEl && univImage) {
    univImageEl.src = univImage;
    univImageEl.alt = `Campus – ${nomUniv}`;
  }

  // ── Points forts ───────────────────────────────────────────────────────────
  const points = Array.from(xml.querySelectorAll('accueil points_forts point'));
  const grid   = document.getElementById('points-forts-grid');

  if (grid && points.length) {
    // Icônes emoji de secours si le SVG n'existe pas
    const fallbackIcons = ['🏆', '📊', '🔬', '🌐', '💡', '🏙️'];

    grid.innerHTML = points.map((pt, i) => {
      const titre = UMA.xmlText(pt, 'titre', '');
      const desc  = UMA.xmlText(pt, 'description', '');
      const icone = UMA.xmlText(pt, 'icone', '');
      const delay = i < 6 ? `delay-${i + 1}` : '';
      const emoji = fallbackIcons[i] || '✨';

      return `
        <article class="point-card fade-up ${delay}" aria-label="${titre}">
          <div class="point-icon-wrap" aria-hidden="true">
            ${icone
              ? `<img src="${icone}" alt="" class="point-icon-img"
                     onerror="this.parentElement.textContent='${emoji}'">`
              : `<span style="font-size:1.6rem;color:white">${emoji}</span>`
            }
          </div>
          <h3 class="point-title">${titre}</h3>
          <p class="point-desc">${desc}</p>
        </article>`;
    }).join('');
  }
}
