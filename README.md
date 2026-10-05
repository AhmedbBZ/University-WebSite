# Site des Classements – Université de la Manouba

Site secondaire dédié aux classements internationaux de l'Université de la Manouba (UMA).

## 🚀 Démarrage rapide

### Prérequis
- **Node.js** ≥ 16 installé sur votre machine
- Un navigateur web moderne

### Installation et lancement

```bash
# 1. Aller dans le dossier du projet
cd chemin/vers/le/projet

# 2. Installer les dépendances (Express)
npm install

# 3. Démarrer le serveur
npm start
```

Le site sera accessible sur **http://localhost:3000**

---

## 📁 Structure du projet

```
/
├── server.js          ← Serveur Node.js/Express
├── package.json
├── README.md
│
├── public/            ← Fichiers servis au navigateur
│   ├── index.html          (Page d'accueil)
│   ├── methodologie.html   (Page méthodologie)
│   ├── evenements.html     (Page événements)
│   ├── rapports.html       (Page rapports)
│   ├── css/
│   │   ├── variables.css   ← Palette, typographie, espacements
│   │   ├── global.css      ← Header, footer, utilitaires communs
│   │   ├── index.css       ← Styles accueil
│   │   ├── methodologie.css
│   │   ├── evenements.css
│   │   └── rapports.css
│   └── js/
│       ├── common.js       ← Chargement XML, header/footer, animations
│       ├── index.js
│       ├── methodologie.js
│       ├── evenements.js
│       └── rapports.js
│
├── content/
│   └── site.xml       ← TOUS les textes modifiables du site
│
├── assets/
│   └── images/
│       ├── universite/    ← Photos du campus
│       ├── icones/        ← Logo, favicon, icônes
│       └── ranking/       ← Images des classements
│
├── events/            ← UN DOSSIER PAR ÉVÉNEMENT
│   └── AAAA-MM-JJ_nom-evenement/
│       ├── image.jpg  (ou .png, .webp)
│       └── texte.txt
│
└── reports/           ← FICHIERS PDF
    └── AAAA-MM-JJ_titre-du-rapport.pdf
```

---

## ✏️ Comment modifier les textes du site

Ouvrez le fichier **`/content/site.xml`** avec n'importe quel éditeur de texte.

Ce fichier contient **tous les textes affichables** : nom de l'université, slogan, présentation, points forts, contacts, méthodologies, etc.

> ✅ Après avoir sauvegardé le fichier, **rechargez simplement la page** dans le navigateur. Aucun redémarrage du serveur n'est nécessaire.

### Sections disponibles dans site.xml

| Section XML | Contenu |
|---|---|
| `<universite>` | Nom, nom court, URL officielle, logo |
| `<menu>` | Labels et URLs du menu de navigation |
| `<accueil>` | Slogan, image hero, présentation, 6 points forts |
| `<a_propos>` | Texte de la section À propos (footer) |
| `<contact>` | Adresse, email, téléphone, réseaux sociaux |
| `<methodologies>` | Données QS1, QS2, QS3, THE (rang, score, année, description) |

---

## 🗓️ Comment ajouter un événement

1. Créez un **nouveau dossier** dans `/events/` en respectant ce format :
   ```
   AAAA-MM-JJ_nom-de-l-evenement/
   ```
   Exemple : `2025-09-15_remise-diplomes-2025/`

2. Dans ce dossier, ajoutez :
   - **`texte.txt`** : La **première ligne** = titre de l'événement. Les lignes suivantes = description.
   - **`image.jpg`** (ou `.png`, `.webp`) : Photo ou illustration de l'événement.

3. **Rechargez la page Événements** dans le navigateur → l'événement apparaît immédiatement.

### Exemple de texte.txt

```
Cérémonie de remise des diplômes 2025
L'Université de la Manouba a organisé sa cérémonie annuelle de remise des diplômes
le 15 septembre 2025 au sein du campus principal. Plus de 3 000 diplômés ont
été honorés en présence des autorités académiques et de leurs familles.
```

> 💡 Les événements sont automatiquement triés du plus récent au plus ancien.

---

## 📄 Comment ajouter un rapport PDF

1. Déposez votre fichier PDF dans le dossier **`/reports/`**.

2. Nommez-le selon ce format obligatoire :
   ```
   AAAA-MM-JJ_titre-du-rapport.pdf
   ```
   Exemples :
   - `2025-06-30_rapport-annuel-2025.pdf`
   - `2025-09-01_bilan-qs-arab-region.pdf`

3. **Rechargez la page Rapports** → le fichier apparaît immédiatement avec sa date et sa taille.

> ⚠️ Les tirets dans le titre sont automatiquement remplacés par des espaces à l'affichage.

---

## 🖼️ Comment ajouter ou remplacer une image

### Logo de l'université
Remplacez `/assets/images/icones/logo-uma.svg` par votre propre logo.
Ensuite, mettez à jour le chemin dans `site.xml` : `<logo>/assets/images/icones/votre-logo.png</logo>`

### Image de la section "Université" (accueil)
Remplacez `/assets/images/universite/campus.jpg` par une vraie photo du campus.
Ou modifiez le chemin dans `site.xml` : `<image>/assets/images/universite/votre-photo.jpg</image>`

### Image du hero (bannière principale)
Remplacez `/assets/images/ranking/ranking-hero.jpg`.
Ou modifiez `<image_hero>` dans `site.xml`.

---

## 🎨 Comment changer les couleurs

Ouvrez **`/public/css/variables.css`** et modifiez les variables :

```css
--color-primary:   #0D2B5E;  /* Bleu marine — couleur principale */
--color-accent:    #C8A951;  /* Or — couleur d'accent */
--color-bg:        #F5F5F0;  /* Fond général */
```

---

## 🔧 Configuration du port

Par défaut, le serveur écoute sur le port **3000**.

Pour changer le port :
```bash
PORT=8080 npm start      # Linux/Mac
$env:PORT=8080; npm start  # Windows PowerShell
```

---

## 🔒 Sécurité

- Les téléchargements de rapports sont protégés contre le **path traversal**
- Seuls les dossiers `/events/` et `/reports/` sont exposés via l'API
- Les fichiers statiques sont servis depuis `/public/` et `/assets/` uniquement

---

## 🌐 Routes disponibles

| Route | Description |
|---|---|
| `GET /` | Page d'accueil |
| `GET /api/content` | Contenu XML du site |
| `GET /api/events` | Liste des événements (JSON) |
| `GET /api/events/image/:folder/:file` | Image d'un événement |
| `GET /api/reports` | Liste des rapports (JSON) |
| `GET /api/reports/download/:filename` | Téléchargement d'un rapport |
