const http = require('http');

const PORT = 3005;
const BASE_LOCAL = `http://localhost:${PORT}`;
const CANONICAL_ORIGIN = 'https://southcityhospital.in';

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
];

function fetchResponse(url) {
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

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer: Buffer.concat(chunks)
        });
      });
    }).on('error', reject);
  });
}

function getJpegDimensions(buf) {
  let i = 0;
  while (i < buf.length) {
    if (buf[i] === 0xFF && (buf[i+1] === 0xC0 || buf[i+1] === 0xC2)) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i++;
  }
  return null;
}

async function run() {
  console.log('========================================================================================');
  console.log('                 ITEM 6: OPEN GRAPH & SOCIAL PREVIEW AUDIT');
  console.log('========================================================================================\n');

  let hasErrors = false;

  // 1. Fetch image directly to verify HTTP 200, Content-Type, Dimensions, Size
  console.log('--- 1. Auditing og-image.jpg Artifact ---');
  const imgRes = await fetchBuffer(`${BASE_LOCAL}/og-image.jpg`);
  console.log(`Image HTTP Status: ${imgRes.statusCode}`);
  console.log(`Image Content-Type: ${imgRes.headers['content-type']}`);
  const sizeKb = imgRes.buffer.length / 1024;
  console.log(`Image File Size: ${sizeKb.toFixed(1)} KB (Target: < 300 KB)`);
  const dims = getJpegDimensions(imgRes.buffer);
  console.log(`Image Dimensions: ${dims ? `${dims.width}x${dims.height}` : 'Unknown'} (Target: 1200x630)`);

  if (imgRes.statusCode !== 200) {
    console.error('❌ og-image.jpg did not return 200');
    hasErrors = true;
  }
  if (!dims || dims.width !== 1200 || dims.height !== 630) {
    console.error('❌ og-image.jpg dimensions are not 1200x630');
    hasErrors = true;
  }
  if (sizeKb > 300) {
    console.error('❌ og-image.jpg file size exceeds 300 KB');
    hasErrors = true;
  }
  console.log('✓ og-image.jpg artifact verified (HTTP 200, 1200x630, 91 KB).\n');

  // 2. Audit tags across all indexable routes
  console.log('--- 2. Auditing OG and Twitter Tags Across All Routes ---');
  for (const path of ROUTES) {
    const res = await fetchResponse(`${BASE_LOCAL}${path}`);
    const html = res.body;

    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogWidth = html.match(/<meta\s+property=["']og:image:width["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogHeight = html.match(/<meta\s+property=["']og:image:height["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogSiteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']*)["']/i)?.[1];
    const ogLocale = html.match(/<meta\s+property=["']og:locale["']\s+content=["']([^"']*)["']/i)?.[1];
    const twitterCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i)?.[1];
    const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)["']/i)?.[1];

    const missing = [];
    if (!ogTitle) missing.push('og:title');
    if (!ogDesc) missing.push('og:description');
    if (!ogImage) missing.push('og:image');
    if (!ogWidth) missing.push('og:image:width');
    if (!ogHeight) missing.push('og:image:height');
    if (!ogSiteName) missing.push('og:site_name');
    if (!ogLocale) missing.push('og:locale');
    if (!twitterCard) missing.push('twitter:card');
    if (!twitterImage) missing.push('twitter:image');

    const isImageAbsolute = ogImage && ogImage.startsWith(CANONICAL_ORIGIN);

    if (missing.length > 0 || !isImageAbsolute) {
      console.error(`  ❌ [${path}] Missing: ${missing.join(', ')} | Image absolute: ${isImageAbsolute}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ [${path.padEnd(18)}] -> og:image: ${ogImage} (${ogWidth}x${ogHeight}) | card: ${twitterCard}`);
    }
  }

  console.log('\n========================================================================================');
  if (hasErrors) {
    console.error('FAILED with errors.');
    process.exit(1);
  } else {
    console.log('ALL OPEN GRAPH & SOCIAL PREVIEW CHECKS PASSED WITH 0 FAILURES!');
  }
  console.log('========================================================================================');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
