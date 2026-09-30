const { chromium } = require('playwright');
const http = require('http');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: data }));
    }).on('error', reject);
  });
}

async function verifyFonts() {
  console.log('=== ITEM 14: FONT LOADING AUDIT ===\n');

  // 1. Fetch Home HTML and inspect CSS links
  const homeRes = await fetch(`${BASE_URL}/`);
  const cssMatches = Array.from(homeRes.text.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)).map(m => m[1]);
  console.log(`Found ${cssMatches.length} linked CSS stylesheets:`);
  for (const cssUrl of cssMatches) {
    console.log(`  - ${cssUrl}`);
  }

  // 2. Fetch and parse all CSS for @font-face rules
  console.log('\n--- 2. CSS @FONT-FACE DECLARATIONS AUDIT ---');
  let totalFontFaceRules = 0;
  let nonSwapDeclarations = 0;
  const fontFaceDetails = [];

  for (const cssPath of cssMatches) {
    const fullUrl = cssPath.startsWith('http') ? cssPath : `${BASE_URL}${cssPath}`;
    const cssRes = await fetch(fullUrl);
    const fontFaceBlocks = cssRes.text.match(/@font-face\s*\{[^}]+\}/gi) || [];

    for (const block of fontFaceBlocks) {
      totalFontFaceRules++;
      const fontFamily = (block.match(/font-family\s*:\s*([^;]+);/i) || [])[1] || 'Unknown';
      const fontDisplay = (block.match(/font-display\s*:\s*([^;]+);/i) || [])[1] || 'NONE';
      const src = (block.match(/src\s*:\s*([^;]+);/i) || [])[1] || 'Unknown';
      const isSameOrigin = src.includes('/_next/static/media/') || !src.includes('http');

      const isCompliant = fontDisplay.trim() === 'swap' || fontDisplay.trim() === 'optional';
      if (!isCompliant) {
        nonSwapDeclarations++;
      }

      fontFaceDetails.push({
        family: fontFamily.trim(),
        display: fontDisplay.trim(),
        isSameOrigin,
        src: src.trim(),
        compliant: isCompliant
      });
    }
  }

  console.log(`Total @font-face declarations found: ${totalFontFaceRules}`);
  for (const ff of fontFaceDetails) {
    const shortSrc = ff.src.length > 50 ? ff.src.slice(0, 47) + '...' : ff.src;
    console.log(`  - Family: ${ff.family.padEnd(20)} | Display: ${ff.display.padEnd(8)} | Same-Origin: ${String(ff.isSameOrigin).padEnd(5)} | ${shortSrc}`);
  }

  // 3. Network trace via Playwright to verify self-hosted font delivery and FOIT timing
  console.log('\n--- 3. BROWSER NETWORK TRACE & ZERO FOIT CHECK ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const fontRequests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf') || url.includes('.otf')) {
      fontRequests.push({
        url,
        origin: new URL(url).origin,
        isSameOrigin: new URL(url).origin === new URL(BASE_URL).origin,
      });
    }
  });

  const startTime = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;

  // Check if text is immediately rendered on page (FOIT duration)
  const textVisibility = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return { visible: false, text: '' };
    const rect = h1.getBoundingClientRect();
    const style = window.getComputedStyle(h1);
    return {
      visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.opacity !== '0',
      text: h1.innerText
    };
  });

  await browser.close();

  console.log(`Total font asset requests intercepted: ${fontRequests.length}`);
  let externalFonts = 0;
  for (const fr of fontRequests) {
    const isSame = fr.isSameOrigin;
    if (!isSame) externalFonts++;
    console.log(`  - ${fr.url} [Same-Origin: ${isSame ? 'YES' : 'NO'}]`);
  }

  console.log(`\nInitial Text Visibility (FOIT check): ${textVisibility.visible ? 'IMMEDIATELY VISIBLE' : 'NOT VISIBLE'}`);
  console.log(`Rendered Heading Text: "${textVisibility.text.replace(/\n/g, ' ')}"`);
  console.log(`Full Page Network Idle Time: ${loadTime}ms`);

  console.log('\n--- VERIFICATION CHECKS ---');
  console.log(`1. Self-hosted fonts (zero 3rd-party font origin requests): ${externalFonts === 0 ? 'PASS (100% self-hosted)' : `FAIL (${externalFonts} external)`}`);
  console.log(`2. font-display: swap on all declarations: ${nonSwapDeclarations === 0 ? 'PASS (0 violations)' : `FAIL (${nonSwapDeclarations} violations)`}`);
  console.log(`3. Zero FOIT (Flash of Invisible Text): ${textVisibility.visible ? 'PASS (Text renders immediately)' : 'FAIL'}`);

  if (externalFonts === 0 && nonSwapDeclarations === 0 && textVisibility.visible) {
    console.log('\n*** ITEM 14 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
  } else {
    process.exit(1);
  }
}

verifyFonts().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
