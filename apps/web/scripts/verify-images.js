const { chromium } = require('playwright');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const testRoutes = [
  '/',
  '/about',
  '/doctors',
  '/departments',
  '/facilities',
  '/gallery',
  '/contact'
];

async function runImageAudit() {
  console.log('=== ITEM 11: COMPREHENSIVE IMAGE AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
  });
  const page = await context.newPage();

  const networkImages = new Map(); // url -> { contentType, size }

  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (contentType.startsWith('image/')) {
      try {
        const buffer = await response.body();
        networkImages.set(url, {
          contentType,
          size: buffer.length
        });
      } catch (e) {
        // stream may already be closed
      }
    }
  });

  const domImages = [];

  for (const route of testRoutes) {
    const targetUrl = `${BASE_URL}${route}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Scroll down to trigger any lazy-loaded images
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    await page.waitForTimeout(500);

    const imagesOnPage = await page.evaluate((r) => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map((img) => ({
        route: r,
        src: img.getAttribute('src') || '',
        currentSrc: img.currentSrc || '',
        alt: img.getAttribute('alt') ?? '',
        hasSrcset: Boolean(img.getAttribute('srcset')),
        srcset: img.getAttribute('srcset') || '',
        hasSizes: Boolean(img.getAttribute('sizes')),
        sizes: img.getAttribute('sizes') || '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: img.clientWidth,
        renderedHeight: img.clientHeight,
        loading: img.getAttribute('loading') || 'eager',
      }));
    }, route);

    domImages.push(...imagesOnPage);
  }

  await browser.close();

  // Deduplicate images by currentSrc or src
  const inventory = new Map();

  for (const img of domImages) {
    const key = img.currentSrc || img.src;
    if (!key || inventory.has(key)) continue;

    const net = networkImages.get(key) || { contentType: 'unknown', size: 0 };
    inventory.set(key, {
      ...img,
      contentType: net.contentType,
      sizeBytes: net.size
    });
  }

  console.log(`Total unique rendered images captured across ${testRoutes.length} pages: ${inventory.size}\n`);

  console.log('--- IMAGE INVENTORY TABLE ---');
  console.log('SRC (TRUNCATED) | CONTENT-TYPE | INTRINSIC (WxH) | RENDERED (WxH) | SRCSET? | SIZES? | SIZE (KB)');
  console.log('--------------------------------------------------------------------------------------------------');

  let failedModernFormat = 0;
  let failedUpscaling = 0;
  let failedSrcsetSizes = 0;

  for (const [url, info] of inventory.entries()) {
    const cleanUrl = url.replace(BASE_URL, '').split('?')[0];
    const isSvg = info.contentType.includes('svg') || cleanUrl.endsWith('.svg');
    const isModern = isSvg || info.contentType.includes('webp') || info.contentType.includes('avif');

    if (!isModern) {
      failedModernFormat++;
    }

    // Check upscaling (rendered significantly larger than natural, allowing 1px rounding)
    const isUpscaled = info.renderedWidth > (info.naturalWidth + 5) && info.naturalWidth > 0;
    if (isUpscaled) {
      failedUpscaling++;
    }

    // Check srcset & sizes for responsive images (except tiny icons/logos where fixed width/height suffices)
    const isFixedIcon = info.renderedWidth <= 64 && info.renderedHeight <= 64;
    const hasResponsive = info.hasSrcset && info.hasSizes;
    if (!isFixedIcon && !hasResponsive) {
      failedSrcsetSizes++;
    }

    const shortSrc = (cleanUrl.length > 35 ? cleanUrl.slice(0, 32) + '...' : cleanUrl) || url.slice(0, 35);
    const sizeKb = (info.sizeBytes / 1024).toFixed(1);

    console.log(
      `${shortSrc.padEnd(35)} | ${info.contentType.padEnd(16)} | ${(info.naturalWidth + 'x' + info.naturalHeight).padEnd(15)} | ${(info.renderedWidth + 'x' + info.renderedHeight).padEnd(14)} | ${String(info.hasSrcset).padEnd(7)} | ${String(info.hasSizes).padEnd(6)} | ${sizeKb} KB`
    );
  }

  console.log('\n--- VERIFICATION CHECKS ---');
  console.log(`1. Modern Format (WebP / AVIF / SVG): ${failedModernFormat === 0 ? 'PASS (0 violations)' : `FAIL (${failedModernFormat} violations)`}`);
  console.log(`2. No Upscaled Images: ${failedUpscaling === 0 ? 'PASS (0 violations)' : `FAIL (${failedUpscaling} violations)`}`);
  console.log(`3. Responsive srcset & sizes attributes: ${failedSrcsetSizes === 0 ? 'PASS (0 violations)' : `FAIL (${failedSrcsetSizes} violations)`}`);

  if (failedModernFormat === 0 && failedUpscaling === 0 && failedSrcsetSizes === 0) {
    console.log('\n*** ITEM 11 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
  } else {
    process.exit(1);
  }
}

runImageAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
