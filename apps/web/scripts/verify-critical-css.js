const { chromium } = require('playwright');
const http = require('http');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== Item 15: Critical CSS & Coverage Verification ===');
  
  // 1. Fetch raw HTML from production server
  const html = await fetchHtml('http://localhost:3005/');
  
  // Find all stylesheet links
  const stylesheetRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  const linkMatches = html.match(stylesheetRegex) || [];
  console.log(`\nFound ${linkMatches.length} stylesheet link(s) in HTML:`);
  linkMatches.forEach(link => console.log('  ', link));

  // Find inline style tags
  const inlineStyles = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  console.log(`Found ${inlineStyles.length} inline <style> tag(s) in HTML.`);

  // 2. Launch Chromium and capture CSS coverage + Web Vitals / Paint timings
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Start CDP CSS Coverage
  await page.coverage.startCSSCoverage();

  const cssRequests = [];
  page.on('response', response => {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/css') || response.url().endsWith('.css')) {
      cssRequests.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 'unknown',
        encoding: response.headers()['content-encoding'] || 'none'
      });
    }
  });

  const startTime = Date.now();
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  const loadDuration = Date.now() - startTime;

  // Stop CSS coverage
  const coverage = await page.coverage.stopCSSCoverage();

  // Get Performance metrics
  const perfMetrics = await page.evaluate(() => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(p => p.name === 'first-contentful-paint');
    const fp = paintEntries.find(p => p.name === 'first-paint');

    return {
      fp: fp ? fp.startTime : null,
      fcp: fcp ? fcp.startTime : null,
      domInteractive: navEntry ? navEntry.domInteractive : null,
      domContentLoaded: navEntry ? navEntry.domContentLoadedEventEnd : null,
      duration: navEntry ? navEntry.duration : null,
    };
  });

  console.log('\n--- Performance Paint Timing ---');
  console.log(`First Paint (FP): ${perfMetrics.fp ? perfMetrics.fp.toFixed(1) + ' ms' : 'N/A'}`);
  console.log(`First Contentful Paint (FCP): ${perfMetrics.fcp ? perfMetrics.fcp.toFixed(1) + ' ms' : 'N/A'}`);
  console.log(`DOM Content Loaded: ${perfMetrics.domContentLoaded ? perfMetrics.domContentLoaded.toFixed(1) + ' ms' : 'N/A'}`);

  console.log('\n--- Network CSS Requests ---');
  cssRequests.forEach(req => {
    console.log(`URL: ${req.url}`);
    console.log(`  Status: ${req.status} | Size (header): ${req.size} bytes | Encoding: ${req.encoding}`);
  });

  console.log('\n--- CDP CSS Coverage Summary ---');
  let totalBytes = 0;
  let totalUsedBytes = 0;

  for (const entry of coverage) {
    const entryTotal = entry.text.length;
    let entryUsed = 0;
    for (const range of entry.ranges) {
      entryUsed += (range.end - range.start);
    }
    totalBytes += entryTotal;
    totalUsedBytes += entryUsed;
    const usedPct = ((entryUsed / entryTotal) * 100).toFixed(1);
    const unusedPct = (100 - usedPct).toFixed(1);
    const urlBasename = entry.url.split('/').pop() || entry.url;
    console.log(`File: ${urlBasename}`);
    console.log(`  Total: ${(entryTotal / 1024).toFixed(2)} KB | Used: ${(entryUsed / 1024).toFixed(2)} KB (${usedPct}%) | Unused: ${unusedPct}%`);
  }

  const overallUsedPct = totalBytes > 0 ? ((totalUsedBytes / totalBytes) * 100).toFixed(1) : 0;
  console.log(`\nOverall CSS Coverage: ${overallUsedPct}% used, ${(100 - overallUsedPct).toFixed(1)}% unused out of ${(totalBytes / 1024).toFixed(2)} KB uncompressed CSS.`);

  // Also test mobile viewport (375x812)
  console.log('\n--- Mobile Viewport (375x812) Verification ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  const mobileFcp = await mobilePage.evaluate(() => {
    const fcp = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  });
  console.log(`Mobile FCP: ${mobileFcp ? mobileFcp.toFixed(1) + ' ms' : 'N/A'}`);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
