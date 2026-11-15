# Rankings Website -- University of Manouba

Secondary website dedicated to the international rankings of the
University of Manouba (UMA).

## Quick Start

### Prerequisites

-   **Node.js** ≥ 16 installed on your machine
-   A modern web browser

### Installation and Launch

``` bash
# Navigate to the project folder
cd path/to/the/project

# Install dependencies
npm install

# Start the server
npm start
```

The website will be available at:

**http://localhost:3000**

------------------------------------------------------------------------

## Project Structure

    /
    ├── server.js          Node.js/Express server
    ├── package.json
    ├── README.md

    ├── public/            Files served to the browser
    │   ├── index.html
    │   ├── methodologie.html
    │   ├── evenements.html
    │   ├── rapports.html
    │   ├── css/
    │   └── js/

    ├── content/
    │   └── site.xml       All editable website texts

    ├── assets/
    │   └── images/
    │       ├── universite/
    │       ├── icones/
    │       └── ranking/

    ├── events/            Event folders
    │   └── YYYY-MM-DD_event-name/
    │       ├── image.jpg
    │       └── texte.txt

    └── reports/           PDF reports
        └── YYYY-MM-DD_report-title.pdf

------------------------------------------------------------------------

## Editing Website Content

All editable texts are stored in:

    /content/site.xml

This file contains:

-   University name and information
-   Slogan
-   Homepage content
-   Contact information
-   Social networks
-   Ranking methodologies

After modifying and saving the file, simply refresh the browser. No
server restart is required.

------------------------------------------------------------------------

## Adding an Event

1.  Create a folder inside:

```{=html}
<!-- -->
```
    /events/

using this format:

    YYYY-MM-DD_event-name/

Example:

    2025-09-15_graduation-ceremony/

2.  Add:

-   `texte.txt`
    -   First line: event title
    -   Following lines: event description
-   `image.jpg` (or `.png`, `.webp`)

3.  Refresh the Events page.

Events are automatically sorted from newest to oldest.

------------------------------------------------------------------------

## Adding a PDF Report

Place PDF files inside:

    /reports/

Use this naming format:

    YYYY-MM-DD_report-title.pdf

Examples:

    2025-06-30_annual-report-2025.pdf
    2025-09-01_qs-ranking-report.pdf

The report date and size are automatically displayed.

------------------------------------------------------------------------

## Managing Images

### University Logo

Replace:

    /assets/images/icones/logo-uma.svg

Then update the logo path in `site.xml`.

### Campus Image

Replace:

    /assets/images/universite/campus.jpg

or update the corresponding path in `site.xml`.

### Hero Image

Replace:

    /assets/images/ranking/ranking-hero.jpg

or update the hero image path in `site.xml`.

------------------------------------------------------------------------

## Changing Colors

Edit:

    /public/css/variables.css

Example:

``` css
--color-primary: #0D2B5E;
--color-accent: #C8A951;
--color-bg: #F5F5F0;
```

------------------------------------------------------------------------

## Port Configuration

The default port is:

    3000

To change it:

Linux/Mac:

``` bash
PORT=8080 npm start
```

Windows PowerShell:

``` powershell
$env:PORT=8080; npm start
```

------------------------------------------------------------------------

## Security

-   Report downloads are protected against path traversal attacks.
-   Only events and reports folders are exposed through the API.
-   Static files are served from controlled directories.

------------------------------------------------------------------------

## Available Routes

  Route                                 Description
  ------------------------------------- ---------------------
  GET /                                 Homepage
  GET /api/content                      Website XML content
  GET /api/events                       Events list (JSON)
  GET /api/events/image/:folder/:file   Event image
  GET /api/reports                      Reports list (JSON)
  GET /api/reports/download/:filename   Report download
