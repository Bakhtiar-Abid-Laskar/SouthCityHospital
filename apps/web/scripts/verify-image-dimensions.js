const { chromium } = require('playwright');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const testPages = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Doctors', path: '/doctors' },
  { name: 'Departments Hub', path: '/departments' },
  { name: 'Specialty Page', path: '/departments/cardiology' },
  { name: 'Facilities', path: '/facilities' },
  { name: 'Photo Gallery', path: '/gallery' },
  { name: 'Testimonials', path: '/testimonials' },
  { name: 'Contact', path: '/contact' }
];

const viewports = [
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Mobile', width: 375, height: 812 }
];

async function verifyImageDimensions() {
  console.log('=== ITEM 12: EXPLICIT IMAGE DIMENSIONS & CLS AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });
  let totalImagesChecked = 0;
  let totalViolations = 0;
  let maxClsRecorded = 0;
  let totalImageShifts = 0;

  for (const vp of viewports) {
    console.log(`\n--- TESTING ${vp.name.toUpperCase()} VIEWPORT (${vp.width}x${vp.height}) ---`);

    for (const pageInfo of testPages) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      // Collect Layout Shifts
      await page.addInitScript(() => {
        window.__clsScore = 0;
        window.__shiftSources = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__clsScore += entry.value;
              if (entry.sources) {
                for (const s of entry.sources) {
                  if (s.node && s.node.nodeName === 'IMG') {
                    window.__shiftSources.push(s.node.getAttribute('src') || 'image');
                  }
                }
              }
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });

      const url = `${BASE_URL}${pageInfo.path}`;
      await page.goto(url, { waitUntil: 'networkidle' });

      // Scroll to bottom to trigger all image renders
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let total = 0;
          const interval = setInterval(() => {
            window.scrollBy(0, 300);
            total += 300;
            if (total >= document.body.scrollHeight) {
              clearInterval(interval);
              resolve();
            }
          }, 80);
        });
      });

      await page.waitForTimeout(400);

      const audit = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const visibleImages = imgs.map((img) => {
          const style = window.getComputedStyle(img);
          const parent = img.parentElement;
          const parentStyle = parent ? window.getComputedStyle(parent) : null;

          const isHidden = style.display === 'none' || (parentStyle && parentStyle.display === 'none');
          const hasExplicitAttrs = img.hasAttribute('width') && img.hasAttribute('height');
          const isFill = style.position === 'absolute';
          const parentHasSize = parent ? (parent.clientWidth > 0 && parent.clientHeight > 0) : false;

          return {
            src: (img.getAttribute('src') || '').split('?')[0],
            isHidden,
            hasExplicitAttrs,
            isFill,
            parentHasSize,
            renderedWidth: img.clientWidth,
            renderedHeight: img.clientHeight,
            parentWidth: parent ? parent.clientWidth : 0,
            parentHeight: parent ? parent.clientHeight : 0,
            // A visible image must have explicit width/height OR be a fill image in a sized container
            properlyDimensioned: isHidden || hasExplicitAttrs || (isFill && parentHasSize)
          };
        });

        return {
          totalImgs: imgs.length,
          visibleCount: visibleImages.filter(i => !i.isHidden).length,
          missingDims: visibleImages.filter(i => !i.properlyDimensioned),
          cls: window.__clsScore || 0,
          imageShiftSources: window.__shiftSources || []
        };
      });

      totalImagesChecked += audit.visibleCount;
      totalViolations += audit.missingDims.length;
      totalImageShifts += audit.imageShiftSources.length;
      if (audit.cls > maxClsRecorded) maxClsRecorded = audit.cls;

      const clsStr = audit.cls.toFixed(4);
      const status = audit.missingDims.length === 0 && audit.cls < 0.05 ? 'PASS' : 'FAIL';
      console.log(
        `[${status}] ${pageInfo.name.padEnd(18)} | Visible Images: ${String(audit.visibleCount).padEnd(2)} | Missing Dims: ${String(audit.missingDims.length).padEnd(2)} | CLS: ${clsStr}`
      );

      if (audit.missingDims.length > 0) {
        console.error('  VIOLATION: Images missing dimensions:', audit.missingDims);
      }

      await context.close();
    }
  }

  await browser.close();

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`1. Total visible <img> elements audited: ${totalImagesChecked}`);
  console.log(`2. Total visible images missing dimensions: ${totalViolations} (Target: 0)`);
  console.log(`3. Max Cumulative Layout Shift (CLS): ${maxClsRecorded.toFixed(4)} (Target: < 0.05, ideal: 0.00)`);
  console.log(`4. Image-induced layout shifts: ${totalImageShifts} (Target: 0)`);

  if (totalViolations === 0 && maxClsRecorded < 0.05 && totalImageShifts === 0) {
    console.log('\n*** ITEM 12 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
  } else {
    process.exit(1);
  }
}

verifyImageDimensions().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
