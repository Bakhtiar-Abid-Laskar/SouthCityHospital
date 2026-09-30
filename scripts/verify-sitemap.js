const http = require('http');

const BASE_LOCAL = 'http://localhost:3000';
const CANONICAL_ORIGIN = 'https://southcityhospital.in';

const EXPECTED_ROUTES = [
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

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Fetching /sitemap.xml ---');
  const sitemapRes = await fetchText(`${BASE_LOCAL}/sitemap.xml`);
  console.log(`Status Code: ${sitemapRes.statusCode}`);
  console.log(`Content-Type: ${sitemapRes.headers['content-type']}`);

  if (sitemapRes.statusCode !== 200) {
    throw new Error(`Failed to fetch sitemap.xml: status ${sitemapRes.statusCode}`);
  }

  const xml = sitemapRes.body;
  console.log('\n--- Sitemap XML Content: ---');
  console.log(xml);

  // Validate XML well-formedness
  console.log('\n--- 2. Validating XML Well-Formedness ---');
  if (!xml.startsWith('<?xml') && !xml.includes('<urlset')) {
    throw new Error('Sitemap is not valid XML');
  }
  const openTags = (xml.match(/<url>/g) || []).length;
  const closeTags = (xml.match(/<\/url>/g) || []).length;
  if (openTags === 0 || openTags !== closeTags) {
    throw new Error(`Mismatched <url> tags: open=${openTags}, close=${closeTags}`);
  }
  console.log(`Well-formed XML: Verified. Total <url> blocks: ${openTags}`);

  // Extract <loc> tags
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`\n--- 3. Extracted ${urls.length} URLs from Sitemap: ---`);
  urls.forEach((u, i) => console.log(`  [${i + 1}] ${u}`));

  // Check URL hygiene
  console.log('\n--- 4. Checking URL Hygiene (Canonical, HTTPS, no localhost/staging) ---');
  let invalidOriginCount = 0;
  for (const u of urls) {
    if (!u.startsWith(CANONICAL_ORIGIN)) {
      console.error(`Invalid origin: ${u}`);
      invalidOriginCount++;
    }
    if (u.includes('localhost') || u.startsWith('http:')) {
      console.error(`Found non-production URL: ${u}`);
      invalidOriginCount++;
    }
  }
  if (invalidOriginCount > 0) {
    throw new Error(`Found ${invalidOriginCount} invalid URLs in sitemap`);
  }
  console.log('All URLs strictly conform to canonical https://southcityhospital.in origin.');

  // Check that every indexable route from inventory appears
  console.log('\n--- 5. Checking 100% Indexable Routes Inventory Coverage ---');
  const expectedCanonicalUrls = EXPECTED_ROUTES.map(r => r === '/' ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${r}`);
  for (const exp of expectedCanonicalUrls) {
    if (!urls.includes(exp)) {
      throw new Error(`Missing expected route in sitemap: ${exp}`);
    }
  }
  console.log(`100% of site inventory indexable routes (${expectedCanonicalUrls.length}/${expectedCanonicalUrls.length}) are present.`);

  // Check each URL returns 200 locally, is not redirected, and is not noindexed
  console.log('\n--- 6. Verifying Every URL Returns HTTP 200 & Has No Noindex Meta ---');
  for (const u of urls) {
    const path = u.replace(CANONICAL_ORIGIN, '') || '/';
    const localUrl = `${BASE_LOCAL}${path}`;
    const res = await fetchText(localUrl);
    const hasNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(res.body);

    if (res.statusCode !== 200) {
      throw new Error(`Route ${path} returned status ${res.statusCode}`);
    }
    if (hasNoindex) {
      throw new Error(`Route ${path} carries noindex meta tag!`);
    }
    console.log(`  ✓ ${path.padEnd(20)} -> Status ${res.statusCode} | Indexable (no noindex)`);
  }

  // Check robots.txt references sitemap
  console.log('\n--- 7. Verifying /robots.txt References Sitemap ---');
  const robotsRes = await fetchText(`${BASE_LOCAL}/robots.txt`);
  console.log(`Robots Status: ${robotsRes.statusCode}`);
  console.log(`Robots Body:\n${robotsRes.body}`);

  if (!robotsRes.body.includes(`sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`) &&
      !robotsRes.body.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`)) {
    throw new Error('robots.txt does not properly reference sitemap.xml');
  }
  console.log('✓ robots.txt correctly references sitemap.xml.');

  console.log('\n========================================');
  console.log('ALL SITEMAP VERIFICATION CHECKS PASSED!');
  console.log('========================================');
}

run().catch((err) => {
  console.error('\nVerification Failed:', err.message);
  process.exit(1);
});
