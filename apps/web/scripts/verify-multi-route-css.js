const { chromium } = require('playwright');

async function testRoutes() {
  const browser = await chromium.launch({ headless: true });
  const routes = [
    '/',
    '/about',
    '/departments/cardiology',
    '/doctors',
    '/facilities',
    '/contact'
  ];

  console.log('Testing CSS coverage and FCP across key routes:');

  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.coverage.startCSSCoverage();
    await page.goto(`http://localhost:3005${route}`, { waitUntil: 'networkidle' });
    const coverage = await page.coverage.stopCSSCoverage();

    const fcp = await page.evaluate(() => {
      const p = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
      return p ? p.startTime : null;
    });

    let total = 0;
    let used = 0;
    for (const entry of coverage) {
      total += entry.text.length;
      for (const r of entry.ranges) {
        used += (r.end - r.start);
      }
    }

    const usedPct = total > 0 ? ((used / total) * 100).toFixed(1) : '100.0';
    console.log(`Route ${route.padEnd(26)} | FCP: ${(fcp ? fcp.toFixed(0) : 'N/A') + 'ms'} | Total CSS: ${(total / 1024).toFixed(1)} KB | Used: ${usedPct}% | Unused: ${(100 - usedPct).toFixed(1)}%`);
    await page.close();
  }

  await browser.close();
}

testRoutes().catch(console.error);
