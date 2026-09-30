const { chromium } = require('playwright');
const zlib = require('zlib');

const ROUTES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About' },
  { path: '/doctors', name: 'Doctors Directory' },
  { path: '/departments/cardiology', name: 'Department Detail (Cardiology)' },
  { path: '/facilities', name: 'Facilities' },
  { path: '/contact', name: 'Contact' }
];

async function measureRoute(browser, route) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Track responses
  const jsResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (url.includes('/_next/static/') && (url.endsWith('.js') || contentType.includes('javascript'))) {
      try {
        const body = await response.body();
        // Calculate true gzip size
        const gzipSize = zlib.gzipSync(body).length;
        const brotliSize = zlib.brotliCompressSync(body).length;
        const uncompressedSize = body.length;
        const contentEncoding = response.headers()['content-encoding'] || 'none';
        
        jsResponses.push({
          url: url.split('/').pop(),
          fullUrl: url,
          status: response.status(),
          uncompressedSize,
          gzipSize,
          brotliSize,
          encoding: contentEncoding
        });
      } catch (e) {
        // ignore
      }
    }
  });

  await page.goto(`http://localhost:3005${route.path}`, { waitUntil: 'networkidle' });

  // Get performance resource entries from browser
  const perfResources = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter(r => r.initiatorType === 'script' || r.name.includes('/_next/static/chunks/'))
      .map(r => ({
        name: r.name.split('/').pop(),
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize
      }));
  });

  let totalUncompressed = 0;
  let totalGzip = 0;
  let totalBrotli = 0;

  jsResponses.forEach(r => {
    totalUncompressed += r.uncompressedSize;
    totalGzip += r.gzipSize;
    totalBrotli += r.brotliSize;
  });

  await context.close();

  return {
    route: route.path,
    name: route.name,
    requestCount: jsResponses.length,
    totalUncompressedKb: (totalUncompressed / 1024).toFixed(2),
    totalGzipKb: (totalGzip / 1024).toFixed(2),
    totalBrotliKb: (totalBrotli / 1024).toFixed(2),
    rawGzipBytes: totalGzip,
    chunks: jsResponses,
    perfResources
  };
}

async function run() {
  console.log('=== Item 16: JavaScript Bundle Budget & Network Audit ===\n');
  const browser = await chromium.launch({ headless: true });

  const results = [];
  for (const r of ROUTES_TO_TEST) {
    const res = await measureRoute(browser, r);
    results.push(res);
  }

  await browser.close();

  console.log('---------------------------------------------------------------------------------------------------------');
  console.log(
    'Route'.padEnd(28) +
    ' | Chunks'.padEnd(10) +
    ' | Wire (Gzip)'.padEnd(16) +
    ' | Wire (Brotli)'.padEnd(16) +
    ' | Uncompressed'.padEnd(16) +
    ' | Budget (<170KB Gzip) | Status'
  );
  console.log('---------------------------------------------------------------------------------------------------------');

  let allPass = true;
  for (const r of results) {
    const underBudget = r.rawGzipBytes < 170 * 1024;
    if (!underBudget) allPass = false;
    console.log(
      `${r.route.padEnd(28)} | ${String(r.requestCount).padEnd(8)} | ${(r.totalGzipKb + ' KB').padEnd(14)} | ${(r.totalBrotliKb + ' KB').padEnd(14)} | ${(r.totalUncompressedKb + ' KB').padEnd(14)} | < 170 KB             | ${underBudget ? 'PASS' : 'FAIL'}`
    );
  }
  console.log('---------------------------------------------------------------------------------------------------------');

  console.log('\nDetailed chunk breakdown for Homepage (/):');
  const home = results.find(r => r.route === '/');
  if (home) {
    home.chunks
      .sort((a, b) => b.gzipSize - a.gzipSize)
      .forEach(c => {
        console.log(`  - ${c.url.padEnd(35)} : ${(c.uncompressedSize / 1024).toFixed(1).padStart(6)} KB uncompressed | ${(c.gzipSize / 1024).toFixed(1).padStart(5)} KB gzip | ${(c.brotliSize / 1024).toFixed(1).padStart(5)} KB brotli`);
      });
  }

  console.log('\nDetailed chunk breakdown for Doctors (/doctors):');
  const docs = results.find(r => r.route === '/doctors');
  if (docs) {
    docs.chunks
      .sort((a, b) => b.gzipSize - a.gzipSize)
      .forEach(c => {
        console.log(`  - ${c.url.padEnd(35)} : ${(c.uncompressedSize / 1024).toFixed(1).padStart(6)} KB uncompressed | ${(c.gzipSize / 1024).toFixed(1).padStart(5)} KB gzip | ${(c.brotliSize / 1024).toFixed(1).padStart(5)} KB brotli`);
      });
  }
}

run().catch(console.error);
