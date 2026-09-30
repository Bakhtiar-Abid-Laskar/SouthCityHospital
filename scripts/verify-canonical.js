const http = require('http');

const PORT = 3005;
const BASE_LOCAL = `http://localhost:${PORT}`;
const CANONICAL_ORIGIN = 'https://southcityhospital.in';

const ROUTES = [
  '/',
  '/doctors',
  '/departments',
  '/facilities',
  '/about',
  '/contact',
  '/faq',
  '/testimonials',
  '/gallery',
  '/booking-status',
  '/privacy-policy',
  '/terms-of-service',
];

function fetchRaw(url, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'CanonicalAuditBot/1.0',
        ...customHeaders
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function extractCanonicals(html) {
  // Match <link rel="canonical" href="..." /> or reversed attributes
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>|<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/gi;
  const canonicals = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    canonicals.push(match[1] || match[2]);
  }
  return canonicals;
}

async function run() {
  console.log('=====================================================');
  console.log('   ITEM 2: CANONICAL TAGS VERIFICATION AUDIT');
  console.log('=====================================================\n');

  let failedCount = 0;

  // 1. Audit all indexable routes
  console.log('--- 1. Checking Canonical Tag on All Indexable Routes ---');
  for (const path of ROUTES) {
    const expectedCanonical = path === '/' ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${path}`;
    const res = await fetchRaw(`${BASE_LOCAL}${path}`);

    if (res.statusCode !== 200) {
      console.error(`  ❌ [${path}] Expected 200, got ${res.statusCode}`);
      failedCount++;
      continue;
    }

    const canonicals = extractCanonicals(res.body);

    if (canonicals.length === 0) {
      console.error(`  ❌ [${path}] MISSING canonical tag`);
      failedCount++;
    } else if (canonicals.length > 1) {
      console.error(`  ❌ [${path}] DUPLICATE canonical tags found (${canonicals.length}): ${canonicals.join(', ')}`);
      failedCount++;
    } else {
      const actualCanonical = canonicals[0];
      if (actualCanonical !== expectedCanonical) {
        console.error(`  ❌ [${path}] MISMATCH: expected "${expectedCanonical}", got "${actualCanonical}"`);
        failedCount++;
      } else {
        console.log(`  ✓ [${path.padEnd(18)}] -> Exactly 1 canonical: ${actualCanonical}`);
      }
    }
  }

  // 2. Query Parameter Immunity Test
  console.log('\n--- 2. Checking Tracking Parameter Immunity (?utm_source=x) ---');
  const queryUrl = `${BASE_LOCAL}/about?utm_source=facebook&utm_medium=cpc&utm_campaign=launch`;
  const queryRes = await fetchRaw(queryUrl);
  const queryCanonicals = extractCanonicals(queryRes.body);
  const expectedAboutCanonical = `${CANONICAL_ORIGIN}/about`;

  if (queryCanonicals.length === 1 && queryCanonicals[0] === expectedAboutCanonical) {
    console.log(`  ✓ /about with UTM params rendered clean canonical: ${queryCanonicals[0]}`);
  } else {
    console.error(`  ❌ Canonical contaminated by query params: ${queryCanonicals.join(', ')}`);
    failedCount++;
  }

  // 3. Trailing Slash Normalization Test
  console.log('\n--- 3. Checking Trailing Slash Normalization (/about/ -> /about) ---');
  const trailingSlashRes = await fetchRaw(`${BASE_LOCAL}/about/`);
  console.log(`  Status Code on /about/: ${trailingSlashRes.statusCode}`);
  console.log(`  Location Header: ${trailingSlashRes.headers['location']}`);

  if ([301, 307, 308].includes(trailingSlashRes.statusCode) && trailingSlashRes.headers['location'] === '/about') {
    console.log(`  ✓ Single-hop redirect from /about/ to /about verified.`);
  } else {
    console.error(`  ❌ Trailing slash redirect unexpected: status ${trailingSlashRes.statusCode}, location ${trailingSlashRes.headers['location']}`);
    failedCount++;
  }

  // 4. Host Normalization Test (www to non-www)
  console.log('\n--- 4. Checking Host Normalization (www.southcityhospital.in redirect) ---');
  const wwwRes = await fetchRaw(`${BASE_LOCAL}/about`, { Host: 'www.southcityhospital.in' });
  console.log(`  Status Code with www Host: ${wwwRes.statusCode}`);
  console.log(`  Location Header: ${wwwRes.headers['location']}`);

  if ([301, 308].includes(wwwRes.statusCode) && wwwRes.headers['location'] === 'https://southcityhospital.in/about') {
    console.log(`  ✓ Single-hop permanent redirect from www to canonical https://southcityhospital.in/about verified.`);
  } else {
    console.error(`  ❌ Host redirect unexpected: status ${wwwRes.statusCode}, location ${wwwRes.headers['location']}`);
    failedCount++;
  }

  console.log('\n=====================================================');
  if (failedCount === 0) {
    console.log('ALL CANONICAL AUDIT CHECKS PASSED WITH 0 FAILURES!');
  } else {
    console.error(`FAILED with ${failedCount} errors.`);
    process.exit(1);
  }
  console.log('=====================================================');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
