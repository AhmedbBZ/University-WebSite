/**
 * common.js — Module commun à toutes les pages
 * =============================================
 * - Chargement du site.xml via /api/content
 * - Injection du header et du footer
 * - Bouton fixe "site officiel"
 * - IntersectionObserver pour les animations scroll
 * - Utilitaires partagés
 */

// ══════════════════════════════════════════════════════════════
// 1. CHARGEMENT DU XML
// ══════════════════════════════════════════════════════════════

/**
 * Charge le fichier site.xml depuis l'API et retourne un Document XML parsé.
 * @returns {Promise<Document>}
 */
async function loadSiteXML() {
  const res = await fetch('/api/content');
  if (!res.ok) throw new Error(`Impossible de charger site.xml (${res.status})`);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Erreur de parsing XML : ' + parseError.textContent);
  return doc;
}

/**
 * Lit un nœud texte depuis le XML par sélecteur CSS.
 * @param {Document} doc
 * @param {string} selector
 * @param {string} fallback
 * @returns {string}
 */
function xmlText(doc, selector, fallback = '') {
  const el = doc.querySelector(selector);
  return el ? (el.textContent.trim() || fallback) : fallback;
}

// ══════════════════════════════════════════════════════════════
// 2. HEADER
// ══════════════════════════════════════════════════════════════

/**
 * Génère et injecte le header à partir du XML.
 * @param {Document} xml
 * @param {string} pageId — ID de la page active (ex: 'accueil', 'evenements')
 */
function renderHeader(xml, pageId = '') {
  const nomUniv    = xmlText(xml, 'universite nom', 'Université de la Manouba');
  const nomCourt   = xmlText(xml, 'universite nom_court', 'UMA');
  const logoSrc    = xmlText(xml, 'universite logo', '/assets/images/icones/logo-uma.svg');

  // Construire les items de menu depuis le XML
  const menuItems = Array.from(xml.querySelectorAll('menu > item'));

  const navItemsHTML = menuItems.map(item => {
    const id    = item.getAttribute('id');
    const label = item.getAttribute('label');
    const url   = item.getAttribute('url');
    const sousItems = Array.from(item.querySelectorAll(':scope > sous_item'));
    const isActive  = id === pageId;

    if (sousItems.length === 0) {
      // Item simple
      return `
        <li class="nav-item">
          <a href="${url}" class="nav-link${isActive ? ' active' : ''}">${label}</a>
        </li>`;
    }

    // Item avec sous-menu
    const sousMenuHTML = sousItems.map(si => {
      const siId    = si.getAttribute('id');
      const siLabel = si.getAttribute('label');
      const siUrl   = si.getAttribute('url');
      const sousSOus = Array.from(si.querySelectorAll(':scope > sous_item'));

      if (sousSOus.length === 0) {
        return `
          <li class="sub-menu-item">
            <a href="${siUrl}" class="sub-menu-link">${siLabel}</a>
          </li>`;
      }

      // Sous-sous-menu
      const ssHTML = sousSOus.map(ss => `
        <a href="${ss.getAttribute('url')}">${ss.getAttribute('label')}</a>
      `).join('');

      return `
        <li class="sub-menu-item has-sub">
          <a href="${siUrl}" class="sub-menu-link">
            <span>${siLabel}</span>
            <span class="arrow-right">▶</span>
          </a>
          <ul class="sub-sub-menu">${ssHTML}</ul>
        </li>`;
    }).join('');

    return `
      <li class="nav-item">
        <a href="${url}" class="nav-link${isActive ? ' active' : ''}" tabindex="0">
          ${label} <span class="arrow">▾</span>
        </a>
        <ul class="sub-menu">${sousMenuHTML}</ul>
      </li>`;
  }).join('');

  const headerHTML = `
    <header id="site-header" role="banner">
      <div class="container header-inner">
        <a href="index.html" class="header-logo" aria-label="${nomUniv} – Accueil">
          <img src="${logoSrc}" alt="Logo ${nomCourt}" id="header-logo-img"
               onerror="this.style.display='none'">
          <div class="header-logo-text">
            <span class="header-logo-name">${nomUniv}</span>
            <span class="header-logo-sub">Classements Internationaux</span>
          </div>
        </a>

        <button class="burger-btn" id="burger-btn" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <nav aria-label="Navigation principale">
          <ul class="header-nav" id="main-nav" role="list">
            ${navItemsHTML}
          </ul>
        </nav>
      </div>
    </header>`;

  // Injection
  const placeholder = document.getElementById('header-placeholder');
  if (placeholder) {
    placeholder.outerHTML = headerHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }

  // Événements de navigation
  initNavEvents();
}

/**
 * Initialise les événements du header (burger, sous-menus, scroll).
 */
function initNavEvents() {
  const burgerBtn = document.getElementById('burger-btn');
  const mainNav   = document.getElementById('main-nav');

  // ── Burger ────────────────────────────────────────────────────────────────
  if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      burgerBtn.classList.toggle('open', isOpen);
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ── Sous-menus desktop : hover (géré via CSS)
  //    Mobile : clic pour accordéon ─────────────────────────────────────────
  const isMobile = () => window.innerWidth <= 768;

  // Niveau 1 (nav-item avec .sub-menu)
  document.querySelectorAll('.nav-item > .nav-link').forEach(link => {
    const parentLi = link.closest('.nav-item');
    if (!parentLi.querySelector('.sub-menu')) return;

    link.addEventListener('click', e => {
      if (isMobile() || link.getAttribute('href') === '#') {
        e.preventDefault();
        parentLi.classList.toggle('open');
      }
    });
  });

  // Niveau 2 (sub-menu-item avec .sub-sub-menu)
  document.querySelectorAll('.sub-menu-item > .sub-menu-link').forEach(link => {
    const parentLi = link.closest('.sub-menu-item');
    if (!parentLi.querySelector('.sub-sub-menu')) return;

    link.addEventListener('click', e => {
      if (isMobile()) {
        e.preventDefault();
        parentLi.classList.toggle('open');
      } else {
        parentLi.classList.toggle('open');
      }
    });
  });

  // Fermer les sous-menus au clic extérieur
  document.addEventListener('click', e => {
    if (!e.target.closest('#main-nav') && !e.target.closest('#burger-btn')) {
      document.querySelectorAll('.nav-item.open, .sub-menu-item.open').forEach(el => {
        el.classList.remove('open');
      });
      if (mainNav) mainNav.classList.remove('open');
      if (burgerBtn) {
        burgerBtn.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ── Changement de couleur du header au scroll ─────────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 4px 30px rgba(0,0,0,0.35)'
        : '0 2px 20px rgba(0,0,0,0.25)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// ══════════════════════════════════════════════════════════════
// 3. FOOTER
// ══════════════════════════════════════════════════════════════

/**
 * Génère et injecte le footer à partir du XML.
 * @param {Document} xml
 */
function renderFooter(xml) {
  const nomUniv  = xmlText(xml, 'universite nom', 'Université de la Manouba');
  const logoSrc  = xmlText(xml, 'universite logo', '/assets/images/icones/logo-uma.svg');
  const aPropos  = xmlText(xml, 'a_propos texte', '');
  const adresse  = xmlText(xml, 'contact adresse', '');
  const email    = xmlText(xml, 'contact email', '');
  const tel      = xmlText(xml, 'contact telephone', '');
  const reseaux  = Array.from(xml.querySelectorAll('contact reseaux reseau'));

  // Icônes réseaux sociaux
  const socialIcons = {
    'Facebook': '📘', 'LinkedIn': '💼', 'Twitter': '🐦',
    'YouTube': '▶️', 'Instagram': '📸'
  };

  const socialsHTML = reseaux.map(r => {
    const nom  = r.getAttribute('nom');
    const url  = r.getAttribute('url');
    const icon = socialIcons[nom] || '🌐';
    return `
      <li>
        <a href="${url}" target="_blank" rel="noopener noreferrer"
           class="footer-social-link" aria-label="${nom}">
          <span class="icon" aria-hidden="true">${icon}</span> ${nom}
        </a>
      </li>`;
  }).join('');

  const year = new Date().getFullYear();

  const footerHTML = `
    <footer id="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="${logoSrc}" alt="Logo UMA"
                   onerror="this.style.display='none'">
              <span class="footer-logo-name">${nomUniv}</span>
            </div>
            <p class="footer-about-text">${aPropos}</p>
          </div>

          <div class="footer-col">
            <h3 class="footer-col-title">Contact</h3>
            <ul class="footer-contact-list">
              ${adresse ? `
              <li class="footer-contact-item">
                <span class="icon" aria-hidden="true">📍</span>
                <span>${adresse}</span>
              </li>` : ''}
              ${email ? `
              <li class="footer-contact-item">
                <span class="icon" aria-hidden="true">✉️</span>
                <a href="mailto:${email}" style="color:inherit">${email}</a>
              </li>` : ''}
              ${tel ? `
              <li class="footer-contact-item">
                <span class="icon" aria-hidden="true">📞</span>
                <a href="tel:${tel.replace(/\s/g,'')}" style="color:inherit">${tel}</a>
              </li>` : ''}
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-col-title">Réseaux sociaux</h3>
            <ul class="footer-social-list">${socialsHTML}</ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© ${year} ${nomUniv} – Tous droits réservés</p>
          <p>Site dédié aux classements internationaux</p>
        </div>
      </div>
    </footer>`;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// ══════════════════════════════════════════════════════════════
// 4. BOUTON FIXE "SITE OFFICIEL"
// ══════════════════════════════════════════════════════════════

/**
 * Injecte le bouton fixe "Visiter le site officiel" en bas de page.
 * @param {Document} xml
 */
function renderBoutonOfficiel(xml) {
  const url  = xmlText(xml, 'universite url_officiel', 'https://www.uma.rnu.tn');
  const nom  = xmlText(xml, 'universite nom', 'l\'Université de la Manouba');

  const btnHTML = `
    <a id="btn-officiel" href="${url}" target="_blank" rel="noopener noreferrer"
       aria-label="Visiter le site officiel de ${nom}">
      <span class="icon" aria-hidden="true">🏛️</span>
      Visiter le site officiel de l'université
      <span class="icon" aria-hidden="true">↗</span>
    </a>`;

  document.body.insertAdjacentHTML('beforeend', btnHTML);
}

// ══════════════════════════════════════════════════════════════
// 5. ANIMATIONS SCROLL (IntersectionObserver)
// ══════════════════════════════════════════════════════════════

/**
 * Active les animations d'apparition au scroll sur tous les éléments .fade-up.
 */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback : tout rendre visible
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ══════════════════════════════════════════════════════════════
// 6. UTILITAIRES
// ══════════════════════════════════════════════════════════════

/**
 * Formate une date ISO (AAAA-MM-JJ) en français.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Date inconnue';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/**
 * Raccourcit une date ISO en format court (ex: "12 mars 2025").
 */
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Extrait le jour d'une date ISO.
 */
function getDay(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr + 'T00:00:00').getDate();
}

/**
 * Extrait le mois court d'une date ISO en français.
 */
function getMonthShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
}

/**
 * Met à jour le <title> et la <meta description> de la page.
 * @param {string} title
 * @param {string} desc
 */
function setPageMeta(title, desc = '') {
  document.title = title;
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = desc;
}

// ══════════════════════════════════════════════════════════════
// 7. INITIALISATION COMMUNE (appelée depuis chaque page)
// ══════════════════════════════════════════════════════════════

/**
 * Point d'entrée commun. Charge le XML, injecte header/footer/bouton.
 * @param {object} options
 * @param {string} options.pageId  — ID de la page active pour surligner le menu
 * @param {Function} [options.onReady] — Callback appelé avec le Document XML
 */
async function initPage({ pageId = '', onReady = null } = {}) {
  try {
    const xml = await loadSiteXML();

    renderHeader(xml, pageId);
    renderFooter(xml);
    renderBoutonOfficiel(xml);

    if (typeof onReady === 'function') {
      await onReady(xml);
    }

    // Lancer les animations scroll après le rendu
    requestAnimationFrame(() => {
      initScrollAnimations();
    });

  } catch (err) {
    console.error('[UMA Classements] Erreur d\'initialisation :', err);
    // Affichage dégradé en cas d'erreur
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = `<header style="height:var(--header-height);background:var(--color-primary)"></header>`;
    }
  }
}

// Export global
window.UMA = {
  initPage,
  loadSiteXML,
  xmlText,
  formatDate,
  formatDateShort,
  getDay,
  getMonthShort,
  setPageMeta
};
