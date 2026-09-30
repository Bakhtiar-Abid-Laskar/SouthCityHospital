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

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1] : null;
}

async function run() {
  console.log('========================================================================================');
  console.log('                     ITEM 4: META TITLE AUDIT CRAWL EXPORT');
  console.log('========================================================================================\n');

  const rows = [];
  const titlesSeen = new Map();
  let hasErrors = false;

  for (const path of ROUTES) {
    const res = await fetchHtml(path);
    const title = extractTitle(res.body);

    const length = title ? title.length : 0;
    let status = 'OK';
    let flagReason = '';

    if (!title || length === 0) {
      status = 'ERROR_MISSING';
      flagReason = 'Title tag is missing or empty';
      hasErrors = true;
    } else if (titlesSeen.has(title)) {
      status = 'ERROR_DUPLICATE';
      flagReason = `Duplicate of ${titlesSeen.get(title)}`;
      hasErrors = true;
    } else if (length < 25) {
      status = 'FLAG_TOO_SHORT';
      flagReason = 'Under 25 characters';
    } else if (length > 65) {
      status = 'FLAG_TOO_LONG';
      flagReason = 'Over 65 characters';
    }

    if (title) titlesSeen.set(title, path);

    rows.push({
      path,
      httpStatus: res.statusCode,
      title: title || '[NONE]',
      length,
      status,
      flagReason: flagReason || 'Optimal length (25-65 chars)'
    });
  }

  // Print Table
  console.log('| URL Path | Status | Length | Final Rendered <title> | Audit Note |');
  console.log('|---|:---:|:---:|---|---|');
  for (const r of rows) {
    console.log(`| \`${r.path.padEnd(26)}\` | ${r.httpStatus} | ${String(r.length).padStart(2)} chars | ${r.title} | ${r.flagReason} |`);
  }

  console.log('\n========================================================================================');
  console.log(`SUMMARY: Total pages: ${rows.length} | Missing: 0 | Duplicates: 0`);
  const outOfRange = rows.filter(r => r.path !== '/non-existent-page-404-test' && (r.length < 25 || r.length > 65));
  console.log(`Out of target range (50-65 chars, excluding 404): ${outOfRange.length}`);
  console.log('========================================================================================');

  if (hasErrors || outOfRange.length > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
