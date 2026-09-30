const http = require('http');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspectInitialHtmlScripts(route = '/') {
  const html = await fetchHtml(`http://localhost:3005${route}`);
  
  // Extract all script src attributes
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const scriptSrcs = [];
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptSrcs.push(match[1]);
  }

  console.log(`\n=== Initial HTML Script Tags for Route "${route}" ===`);
  console.log(`Found ${scriptSrcs.length} initial critical scripts loaded in HTML payload:\n`);

  let totalRawBytes = 0;
  let totalGzipBytes = 0;
  let totalBrotliBytes = 0;

  for (const src of scriptSrcs) {
    // Read file from .next
    const relativePath = src.replace('/_next/', '');
    const diskPath = path.join(__dirname, '..', '.next', relativePath);
    if (fs.existsSync(diskPath)) {
      const content = fs.readFileSync(diskPath);
      const raw = content.length;
      const gz = zlib.gzipSync(content).length;
      const br = zlib.brotliCompressSync(content).length;

      totalRawBytes += raw;
      totalGzipBytes += gz;
      totalBrotliBytes += br;

      console.log(`  - ${path.basename(src).padEnd(30)} : ${(raw / 1024).toFixed(1).padStart(6)} KB raw | ${(gz / 1024).toFixed(1).padStart(5)} KB gzip | ${(br / 1024).toFixed(1).padStart(5)} KB brotli`);
    } else {
      console.log(`  - ${src} (file not on disk)`);
    }
  }

  console.log('\n--------------------------------------------------------------');
  console.log(`INITIAL CRITICAL JS TOTAL:`);
  console.log(`  Raw Uncompressed : ${(totalRawBytes / 1024).toFixed(2)} KB`);
  console.log(`  Gzip Transferred : ${(totalGzipBytes / 1024).toFixed(2)} KB`);
  console.log(`  Brotli Transferred: ${(totalBrotliBytes / 1024).toFixed(2)} KB`);
  console.log(`  Budget (<170KB)  : ${totalGzipBytes < 170 * 1024 ? 'PASS' : 'EXCEEDED'}`);
  console.log('--------------------------------------------------------------');

  return { totalGzipBytes, totalBrotliBytes, totalRawBytes };
}

async function run() {
  await inspectInitialHtmlScripts('/');
}

run().catch(console.error);
