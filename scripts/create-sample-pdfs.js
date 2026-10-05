const fs   = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function makePDF(title, subtitle) {
  const content = `BT /F1 18 Tf 50 740 Td (${title}) Tj 0 -30 Td /F1 12 Tf (Stanford University) Tj 0 -20 Td (${subtitle}) Tj ET`;
  const len = content.length;

  return [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${len} >>`,
    'stream',
    content,
    'endstream',
    'endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    'xref',
    '0 6',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000115 00000 n ',
    '0000000266 00000 n ',
    '0000000436 00000 n ',
    'trailer << /Size 6 /Root 1 0 R >>',
    'startxref',
    '515',
    '%%EOF'
  ].join('\n');
}

const files = [
  {
    name: '2025-01-20_stanford-rapport-annuel-classements-2024.pdf',
    title: 'Stanford University - Rapport Annuel Classements 2024',
    sub: 'Office of Institutional Research & Rankings - Stanford'
  },
  {
    name: '2024-09-01_stanford-bilan-impact-et-recherche-2023-2024.pdf',
    title: 'Stanford University - Bilan Impact & Research Performance 2023-2024',
    sub: 'Office of the Vice Provost for Research - Stanford'
  }
];

files.forEach(f => {
  const filePath = path.join(reportsDir, f.name);
  fs.writeFileSync(filePath, makePDF(f.title, f.sub), 'utf8');
  console.log('Créé :', f.name);
});

console.log('\nPDF Stanford créés avec succès dans /reports/');
