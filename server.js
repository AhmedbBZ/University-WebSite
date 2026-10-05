/**
 * server.js — Serveur Express pour le site Classements UMA
 * =========================================================
 * Sert les fichiers statiques et expose des routes API qui
 * scannent les dossiers à chaque requête (pas de cache).
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Dossiers racines ──────────────────────────────────────────────────────────
const ROOT      = __dirname;
const PUBLIC    = path.join(ROOT, 'public');
const ASSETS    = path.join(ROOT, 'assets');
const CONTENT   = path.join(ROOT, 'content');
const EVENTS    = path.join(ROOT, 'events');
const REPORTS   = path.join(ROOT, 'reports');

// ── Fichiers statiques ────────────────────────────────────────────────────────
app.use(express.static(PUBLIC));
app.use('/assets', express.static(ASSETS));

// ── Utilitaire : vérification sécurisée d'un chemin (anti path traversal) ────
function safeResolve(base, userInput) {
  const resolved = path.resolve(base, userInput);
  if (!resolved.startsWith(path.resolve(base) + path.sep) &&
      resolved !== path.resolve(base)) {
    return null; // Tentative de path traversal détectée
  }
  return resolved;
}

// ── Route : contenu XML du site ───────────────────────────────────────────────
app.get('/api/content', (req, res) => {
  const xmlPath = path.join(CONTENT, 'site.xml');
  if (!fs.existsSync(xmlPath)) {
    return res.status(404).json({ error: 'Fichier site.xml introuvable.' });
  }
  const xml = fs.readFileSync(xmlPath, 'utf8');
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// ── Route : liste des événements ──────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  if (!fs.existsSync(EVENTS)) {
    return res.json([]);
  }

  const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const dirs = fs.readdirSync(EVENTS, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const events = dirs.map(dirName => {
    // Extraire la date du préfixe AAAA-MM-JJ
    const dateMatch = dirName.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : null;
    const slug = date ? dirName.slice(11) : dirName;

    const dirPath = path.join(EVENTS, dirName);
    const files   = fs.readdirSync(dirPath);

    // Premier fichier image trouvé
    const imageFile = files.find(f =>
      IMAGE_EXTS.includes(path.extname(f).toLowerCase())
    );
    const imageUrl = imageFile
      ? `/api/events/image/${encodeURIComponent(dirName)}/${encodeURIComponent(imageFile)}`
      : null;

    // Lecture de texte.txt : ligne 1 = titre, reste = description
    let titre       = slug.replace(/-/g, ' ');
    let description = '';
    const txtPath   = path.join(dirPath, 'texte.txt');
    if (fs.existsSync(txtPath)) {
      const lines = fs.readFileSync(txtPath, 'utf8').split('\n');
      titre       = lines[0].trim() || titre;
      description = lines.slice(1).join('\n').trim();
    }

    return { dirName, date, slug, titre, description, imageUrl };
  });

  // Trier par date décroissante (plus récent en premier)
  events.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  res.json(events);
});

// ── Route : image d'un événement (sécurisée) ─────────────────────────────────
app.get('/api/events/image/:folder/:file', (req, res) => {
  const folderSafe = safeResolve(EVENTS, req.params.folder);
  if (!folderSafe) return res.status(403).send('Accès refusé.');

  const fileSafe = safeResolve(folderSafe, req.params.file);
  if (!fileSafe || !fs.existsSync(fileSafe)) {
    return res.status(404).send('Image introuvable.');
  }
  res.sendFile(fileSafe);
});

// ── Route : liste des rapports ────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  if (!fs.existsSync(REPORTS)) {
    return res.json([]);
  }

  const files = fs.readdirSync(REPORTS)
    .filter(f => path.extname(f).toLowerCase() === '.pdf');

  const reports = files.map(filename => {
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})_(.+)\.pdf$/i);
    const date  = dateMatch ? dateMatch[1] : null;
    const titre = dateMatch
      ? dateMatch[2].replace(/-/g, ' ')
      : filename.replace('.pdf', '');

    const filePath = path.join(REPORTS, filename);
    const stat     = fs.statSync(filePath);
    const sizeKb   = Math.round(stat.size / 1024);
    const sizeStr  = sizeKb > 1024
      ? `${(sizeKb / 1024).toFixed(1)} Mo`
      : `${sizeKb} Ko`;

    return { filename, date, titre, sizeStr };
  });

  // Trier par date décroissante
  reports.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  res.json(reports);
});

// ── Route : téléchargement sécurisé d'un rapport ─────────────────────────────
app.get('/api/reports/download/:filename', (req, res) => {
  const filename = req.params.filename;

  // Sécurité : uniquement des fichiers PDF sans séparateurs de chemin
  if (!/^[\w\-. ]+\.pdf$/i.test(filename)) {
    return res.status(400).send('Nom de fichier invalide.');
  }

  const filePath = safeResolve(REPORTS, filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('Rapport introuvable.');
  }

  res.download(filePath, filename);
});

// ── Démarrage ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Serveur démarré sur http://localhost:${PORT}\n`);
  console.log(`   → Page d'accueil   : http://localhost:${PORT}/`);
  console.log(`   → Événements        : http://localhost:${PORT}/evenements.html`);
  console.log(`   → Rapports          : http://localhost:${PORT}/rapports.html`);
  console.log(`   → Méthodologie (QS) : http://localhost:${PORT}/methodologie.html?id=qs1\n`);
});
