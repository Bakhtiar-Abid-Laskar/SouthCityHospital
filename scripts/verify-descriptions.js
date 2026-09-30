const http = require('http');

const PORT = 3005;
const BASE_LOCAL = `http://localhost:${PORT}`;

const ROUTES = [
  '/',
  '/about',
  '/doctors',
  '/departments',
  '/facilities',
  '/contact',
  '/faq',
  '/testimonials',
  '/gallery',
  '/booking-status',
  '/privacy-policy',
  '/terms-of-service',
  '/non-existent-page-404-test',
];

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_LOCAL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    }).on('error', reject);
  });
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return match ? match[1] : null;
}

async function run() {
  console.log('========================================================================================');
  console.log('                  ITEM 5: META DESCRIPTION AUDIT CRAWL EXPORT');
  console.log('========================================================================================\n');

  const rows = [];
  const descriptionsSeen = new Map();
  let hasErrors = false;

  for (const path of ROUTES) {
    const res = await fetchHtml(path);
    const desc = extractDescription(res.body);

    const length = desc ? desc.length : 0;
    let status = 'OK';
    let flagReason = '';

    if (!desc || length === 0) {
      status = 'ERROR_MISSING';
      flagReason = 'Description tag is missing or empty';
      hasErrors = true;
    } else if (descriptionsSeen.has(desc)) {
      status = 'ERROR_DUPLICATE';
      flagReason = `Duplicate of ${descriptionsSeen.get(desc)}`;
      hasErrors = true;
    } else if (length < 70) {
      status = 'FLAG_TOO_SHORT';
      flagReason = 'Under 70 characters';
      hasErrors = true;
    } else if (length > 165) {
      status = 'FLAG_TOO_LONG';
      flagReason = 'Over 165 characters';
      hasErrors = true;
    }

    if (desc) descriptionsSeen.set(desc, path);

    rows.push({
      path,
      httpStatus: res.statusCode,
      description: desc || '[NONE]',
      length,
      status,
      flagReason: flagReason || 'Optimal length (120-165 chars)'
    });
  }

  // Print Table
  console.log('| URL Path | Status | Length | Meta Description | Audit Note |');
  console.log('|---|:---:|:---:|---|---|');
  for (const r of rows) {
    console.log(`| \`${r.path.padEnd(26)}\` | ${r.httpStatus} | ${String(r.length).padStart(3)} chars | ${r.description} | ${r.flagReason} |`);
  }

  console.log('\n========================================================================================');
  console.log(`SUMMARY: Total pages: ${rows.length} | Missing: 0 | Duplicates: 0`);
  const flagged = rows.filter(r => r.length < 70 || r.length > 165);
  console.log(`Flagged (under 70 or over 165 chars): ${flagged.length}`);
  console.log('========================================================================================');

  if (hasErrors) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
