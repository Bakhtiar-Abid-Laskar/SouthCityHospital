const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          buffer,
          text: buffer.toString('utf8')
        });
      });
    }).on('error', reject);
  });
}

function getPngDimensions(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504E47) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20)
    };
  }
  return null;
}

function getIcoFrames(buf) {
  if (buf.length < 6) return [];
  const count = buf.readUInt16LE(4);
  const frames = [];
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    let w = buf.readUInt8(offset);
    let h = buf.readUInt8(offset + 1);
    if (w === 0) w = 256;
    if (h === 0) h = 256;
    frames.push(`${w}x${h}`);
  }
  return frames;
}

async function verifyFaviconSuite() {
  console.log('=== ITEM 13: FAVICON SUITE AUDIT ===\n');

  const publicDir = path.resolve(__dirname, '../apps/web/public');
  const targetFiles = [
    { file: 'favicon.ico', expectedType: 'image/x-icon', isIco: true },
    { file: 'favicon.svg', expectedType: 'image/svg+xml', isSvg: true },
    { file: 'apple-touch-icon.png', expectedType: 'image/png', expectedDims: '180x180' },
    { file: 'icon-192.png', expectedType: 'image/png', expectedDims: '192x192' },
    { file: 'icon-512.png', expectedType: 'image/png', expectedDims: '512x512' },
    { file: 'manifest.webmanifest', expectedType: 'manifest' }
  ];

  console.log('--- 1. FILE INVENTORY & EXACT PIXEL DIMENSIONS ---');
  console.log('FILENAME | SIZE (KB) | DIMENSIONS / FRAMES | FORMAT');
  console.log('-----------------------------------------------------------');

  for (const item of targetFiles) {
    const fullPath = path.join(publicDir, item.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`FAIL: Missing file in public directory: ${item.file}`);
      process.exit(1);
    }
    const buf = fs.readFileSync(fullPath);
    const sizeKb = (buf.length / 1024).toFixed(2);
    let dimsStr = 'N/A';
    let format = 'Unknown';

    if (item.isIco) {
      const frames = getIcoFrames(buf);
      dimsStr = frames.join(', ');
      format = 'ICO (multi-res)';
    } else if (item.isSvg) {
      dimsStr = 'Vector (scalable)';
      format = 'SVG';
    } else if (item.file.endsWith('.png')) {
      const dims = getPngDimensions(buf);
      dimsStr = dims ? `${dims.width}x${dims.height}` : 'unknown';
      format = 'PNG';
    } else if (item.file.endsWith('.webmanifest')) {
      dimsStr = 'JSON Manifest';
      format = 'Webmanifest';
    }

    console.log(`${item.file.padEnd(20)} | ${(sizeKb + ' KB').padEnd(9)} | ${dimsStr.padEnd(20)} | ${format}`);
  }

  console.log('\n--- 2. HTTP 200 CHECKS ON LIVE TEST SERVER ---');
  const urlsToCheck = [
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.webmanifest'
  ];

  let failedHttp = 0;

  for (const urlPath of urlsToCheck) {
    const res = await fetch(`${BASE_URL}${urlPath}`);
    const isOk = res.status === 200;
    if (!isOk) failedHttp++;
    console.log(`GET ${urlPath.padEnd(25)} -> HTTP ${res.status} (Content-Type: ${res.headers['content-type'] || 'none'}) [${isOk ? 'PASS' : 'FAIL'}]`);
  }

  console.log('\n--- 3. MANIFEST ICONS INTEGRITY CHECK ---');
  const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
  const manifestJson = JSON.parse(manifestRes.text);
  console.log(`Manifest Name: "${manifestJson.name}"`);
  console.log(`Icons declared in manifest: ${manifestJson.icons ? manifestJson.icons.length : 0}`);

  if (manifestJson.icons) {
    for (const icon of manifestJson.icons) {
      const iconRes = await fetch(`${BASE_URL}${icon.src}`);
      const isOk = iconRes.status === 200;
      if (!isOk) failedHttp++;
      console.log(`  Icon ${icon.src} (${icon.sizes}): HTTP ${iconRes.status} [${isOk ? 'PASS' : 'FAIL'}]`);
    }
  }

  console.log('\n--- 4. HTML <HEAD> METADATA LINK VALIDATION ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = homeRes.text;

  const hasFaviconLink = /rel=["'](?:shortcut )?icon["']/i.test(homeHtml);
  const hasAppleTouchLink = /rel=["']apple-touch-icon["']/i.test(homeHtml);
  const hasManifestLink = /rel=["']manifest["']/i.test(homeHtml);

  console.log(`- <link rel="icon">: ${hasFaviconLink ? 'PASS' : 'FAIL'}`);
  console.log(`- <link rel="apple-touch-icon">: ${hasAppleTouchLink ? 'PASS' : 'FAIL'}`);
  console.log(`- <link rel="manifest">: ${hasManifestLink ? 'PASS' : 'FAIL'}`);

  const allPassed = failedHttp === 0 && hasFaviconLink && hasAppleTouchLink && hasManifestLink;

  if (allPassed) {
    console.log('\n*** ITEM 13 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
  } else {
    console.error('\nFAIL: Favicon verification failed');
    process.exit(1);
  }
}

verifyFaviconSuite().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
