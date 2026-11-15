/**
 * methodologie.js — Page Programmes & Académique
 * ===============================================
 * Lit l'id dans l'URL et affiche le programme / la faculté correspondante depuis le XML.
 * Affiche une page 404 si l'id n'existe pas.
 */

document.addEventListener('DOMContentLoaded', () => {
  UMA.initPage({
    pageId: 'methodologie',
    onReady: renderMethodologiePage
  });
});

/**
 * Peuple la page académique depuis le XML.
 * @param {Document} xml
 */
async function renderMethodologiePage(xml) {
  const nomUniv = UMA.xmlText(xml, 'universite nom', 'Stanford University');

  // Récupérer l'id depuis l'URL
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id') || '';

  const main = document.getElementById('methodo-main');
  if (!main) return;

  if (!id) {
    // Pas d'id → liste de tous les programmes
    renderListeMethodologies(xml, main, nomUniv);
    return;
  }

  // Chercher la méthodologie / le programme dans le XML
  const methodo = xml.querySelector(`methodologie[id="${CSS.escape(id)}"]`);

  if (!methodo) {
    render404(main, id, nomUniv);
    return;
  }

  // Données
  const nom    = UMA.xmlText(methodo, 'nom',    '—');
  const desc   = UMA.xmlText(methodo, 'description', '');
  const rang   = UMA.xmlText(methodo, 'rang',   '—');
  const score  = UMA.xmlText(methodo, 'score',  '—');
  const annee  = UMA.xmlText(methodo, 'annee',  '—');
  const lien   = UMA.xmlText(methodo, 'lien',   '');

  UMA.setPageMeta(
    `${nom} – ${nomUniv}`,
    `Présentation du programme ${nom} à Stanford University : diplômes, cursus et ressources.`
  );

  // Mettre à jour le titre et sous-titre du hero
  const heroTitle = document.getElementById('page-hero-title');
  const heroSub   = document.getElementById('page-hero-sub');
  if (heroTitle) heroTitle.textContent = nom;
  if (heroSub)   heroSub.textContent = `Offre de formation de ${nomUniv}`;

  // Breadcrumb
  const breadcrumb = document.getElementById('methodo-breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="index.html">Accueil</a>
      <span class="sep">›</span>
      <a href="methodologie.html">Programmes &amp; Académique</a>
      <span class="sep">›</span>
      <span>${nom}</span>`;
  }

  // Blocs visuels de présentation du programme
  const rankingShowcase = document.getElementById('ranking-showcase');
  if (rankingShowcase) {
    rankingShowcase.innerHTML = `
      <div class="ranking-card accent fade-up">
        <span class="ranking-card-icon" aria-hidden="true">🎓</span>
        <div class="ranking-card-value">${rang}</div>
        <div class="ranking-card-label">Spécialités / Départements</div>
      </div>
      <div class="ranking-card fade-up delay-1">
        <span class="ranking-card-icon" aria-hidden="true">👥</span>
        <div class="ranking-card-value">${score}</div>
        <div class="ranking-card-label">Effectifs &amp; Statut</div>
      </div>
      <div class="ranking-card fade-up delay-2">
        <span class="ranking-card-icon" aria-hidden="true">📅</span>
        <div class="ranking-card-value">${annee}</div>
        <div class="ranking-card-label">Année Académique</div>
      </div>`;
  }

  // Description
  const descSection = document.getElementById('methodo-description-section');
  if (descSection) {
    descSection.innerHTML = `
      <div class="methodo-description fade-up">
        <h2><span class="icon" aria-hidden="true">📘</span> Présentation du programme</h2>
        <p>${desc}</p>
        ${lien ? `
        <a href="${lien}" target="_blank" rel="noopener noreferrer" class="methodo-link">
          <span class="icon" aria-hidden="true">🔗</span>
          Accéder au site officiel du programme
          <span class="icon" aria-hidden="true">↗</span>
        </a>` : ''}
      </div>`;
  }
}

/**
 * Affiche la liste de tous les programmes (page sans id).
 */
function renderListeMethodologies(xml, container, nomUniv) {
  UMA.setPageMeta(
    `Programmes & Académique – ${nomUniv}`,
    `Découvrez les programmes d'études et facultés de ${nomUniv}.`
  );

  const heroTitle = document.getElementById('page-hero-title');
  if (heroTitle) heroTitle.textContent = 'Programmes & Écoles Académiques';

  const methodos = Array.from(xml.querySelectorAll('methodologie'));
  const breadcrumb = document.getElementById('methodo-breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="index.html">Accueil</a>
      <span class="sep">›</span>
      <span>Programmes &amp; Académique</span>`;
  }

  // Retirer les blocs spécifiques
  const rankingShowcase  = document.getElementById('ranking-showcase');
  const descSection      = document.getElementById('methodo-description-section');
  if (rankingShowcase) rankingShowcase.style.display = 'none';

  if (descSection) {
    descSection.innerHTML = methodos.map((m, i) => {
      const id    = m.getAttribute('id');
      const nom   = UMA.xmlText(m, 'nom', '');
      const rang  = UMA.xmlText(m, 'rang', '—');
      const annee = UMA.xmlText(m, 'annee', '—');
      const delay = `delay-${Math.min(i + 1, 5)}`;
      return `
        <div class="methodo-description fade-up ${delay}" style="margin-bottom:1rem">
          <h2>
            <span class="icon" aria-hidden="true">🏛️</span> ${nom}
          </h2>
          <p style="margin:0.5rem 0;color:var(--color-text-muted)">
            Spécialités : <strong style="color:var(--color-primary)">${rang}</strong> &nbsp;·&nbsp; Session : ${annee}
          </p>
          <a href="methodologie.html?id=${id}" class="methodo-link" style="margin-top:var(--space-4)">
            Découvrir le programme →
          </a>
        </div>`;
    }).join('');
  }
}

/**
 * Affiche une page 404 si le programme est introuvable.
 */
function render404(container, id, nomUniv) {
  UMA.setPageMeta(`404 – Programme introuvable`);

  const heroTitle = document.getElementById('page-hero-title');
  const heroSub   = document.getElementById('page-hero-sub');
  if (heroTitle) heroTitle.textContent = 'Programme introuvable';
  if (heroSub)   heroSub.textContent = '';

  const rankingShowcase = document.getElementById('ranking-showcase');
  const descSection     = document.getElementById('methodo-description-section');
  const breadcrumb      = document.getElementById('methodo-breadcrumb');

  if (rankingShowcase) rankingShowcase.style.display = 'none';
  if (breadcrumb) breadcrumb.innerHTML = `
    <a href="index.html">Accueil</a>
    <span class="sep">›</span>
    <span>404</span>`;

  if (descSection) {
    descSection.innerHTML = `
      <div class="not-found">
        <div class="nf-code" aria-hidden="true">404</div>
        <h2>Programme "${id}" introuvable</h2>
        <p>Le programme académique que vous recherchez n'existe pas ou a été mis à jour.</p>
        <a href="index.html" class="btn-primary" style="margin-top:1rem">
          ← Retour à l'accueil
        </a>
      </div>`;
  }
}
