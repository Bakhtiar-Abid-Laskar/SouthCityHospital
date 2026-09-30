const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2540" />
      <stop offset="100%" stop-color="#071b3d" />
    </linearGradient>
    <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
  </defs>
  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <rect width="496" height="496" x="8" y="8" rx="104" fill="none" stroke="#38bdf8" stroke-width="8" stroke-opacity="0.3" />
  
  <!-- Stylized Medical Cross with Heart Pulse Line -->
  <g transform="translate(256, 256)">
    <!-- Central rounded medical cross -->
    <path d="M -46 -154 C -46 -170 -30 -182 -14 -182 L 14 -182 C 30 -182 46 -170 46 -154 L 46 -46 L 154 -46 C 170 -46 182 -30 182 -14 L 182 14 C 182 30 170 46 154 46 L 46 46 L 46 154 C 46 170 30 182 14 182 L -14 182 C -30 182 -46 170 -46 154 L -46 46 L -154 46 C -170 46 -182 30 -182 14 L -182 -14 C -182 -30 -170 -46 -154 -46 L -46 -46 Z" fill="url(#crossGrad)" />
    <!-- Center ECG pulse line cutout / emblem -->
    <path d="M -96 0 L -46 0 L -22 -44 L 12 50 L 38 -20 L 56 0 L 96 0" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

function buildIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffsetBase = headerSize + (count * dirEntrySize);

  let currentOffset = dataOffsetBase;
  const entries = [];

  for (const item of pngBuffers) {
    entries.push({
      width: item.width >= 256 ? 0 : item.width,
      height: item.height >= 256 ? 0 : item.height,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bitCount: 32,
      bytesInRes: item.buffer.length,
      imageOffset: currentOffset
    });
    currentOffset += item.buffer.length;
  }

  const outBuffer = Buffer.alloc(currentOffset);

  // Write ICONDIR
  outBuffer.writeUInt16LE(0, 0); // reserved
  outBuffer.writeUInt16LE(1, 2); // 1 = icon
  outBuffer.writeUInt16LE(count, 4); // count

  // Write ICONDIRENTRYs
  let entryPos = 6;
  for (const entry of entries) {
    outBuffer.writeUInt8(entry.width, entryPos);
    outBuffer.writeUInt8(entry.height, entryPos + 1);
    outBuffer.writeUInt8(entry.colorCount, entryPos + 2);
    outBuffer.writeUInt8(entry.reserved, entryPos + 3);
    outBuffer.writeUInt16LE(entry.planes, entryPos + 4);
    outBuffer.writeUInt16LE(entry.bitCount, entryPos + 6);
    outBuffer.writeUInt32LE(entry.bytesInRes, entryPos + 8);
    outBuffer.writeUInt32LE(entry.imageOffset, entryPos + 12);
    entryPos += 16;
  }

  // Write image buffers
  for (let i = 0; i < pngBuffers.length; i++) {
    pngBuffers[i].buffer.copy(outBuffer, entries[i].imageOffset);
  }

  return outBuffer;
}

async function generateFavicons() {
  console.log('Generating complete favicon suite...');

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), SVG_CONTENT, 'utf8');
  console.log('✓ Created public/favicon.svg');

  // 2. Launch headless browser to render exact raster PNGs from SVG
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const svgBase64 = Buffer.from(SVG_CONTENT).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

  async function renderPng(width, height) {
    return page.evaluate(async ({ src, w, h }) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''));
        };
        img.src = src;
      });
    }, { src: dataUrl, w: width, h: height });
  }

  // Render required dimensions
  console.log('Rendering raster frames...');
  const png16 = Buffer.from(await renderPng(16, 16), 'base64');
  const png32 = Buffer.from(await renderPng(32, 32), 'base64');
  const png48 = Buffer.from(await renderPng(48, 48), 'base64');
  const png180 = Buffer.from(await renderPng(180, 180), 'base64');
  const png192 = Buffer.from(await renderPng(192, 192), 'base64');
  const png512 = Buffer.from(await renderPng(512, 512), 'base64');

  await browser.close();

  // 3. Write apple-touch-icon.png (180x180)
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 4. Write icon-192.png (192x192)
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  console.log('✓ Created public/icon-192.png (192x192)');

  // 5. Write icon-512.png (512x512)
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  console.log('✓ Created public/icon-512.png (512x512)');

  // 6. Build and write multi-res favicon.ico (16x16, 32x32, 48x48)
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Created public/favicon.ico (multi-resolution 16x16, 32x32, 48x48)');

  // 7. Write static manifest.webmanifest to public
  const manifestContent = {
    name: "South City Hospital Silchar",
    short_name: "South City",
    description: "Multi-specialty hospital with 13 clinical departments and 24/7 emergency services in Meherpur, Silchar, Assam.",
    start_url: "/",
    display: "standalone",
    background_color: "#071b3d",
    theme_color: "#0a2540",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync(
    path.join(publicDir, 'manifest.webmanifest'),
    JSON.stringify(manifestContent, null, 2),
    'utf8'
  );
  console.log('✓ Created public/manifest.webmanifest');

  console.log('All favicon suite files generated successfully!');
}

generateFavicons().catch(console.error);
