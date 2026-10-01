const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const logoPath = path.resolve(__dirname, "../../../Logo.jpg.jpeg");
const webPublic = path.resolve(__dirname, "../public");
const adminPublic = path.resolve(__dirname, "../../admin/public");

if (!fs.existsSync(logoPath)) {
  console.error("Missing Logo.jpg.jpeg at", logoPath);
  process.exit(1);
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffsetBase = headerSize + count * dirEntrySize;

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
      imageOffset: currentOffset,
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

async function run() {
  console.log("Generating favicon suite from Logo.jpg.jpeg...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logoBuf = fs.readFileSync(logoPath);
  const dataUrl = "data:image/jpeg;base64," + logoBuf.toString("base64");

  async function renderFrame(size) {
    return page.evaluate(
      async ({ src, s }) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = s;
            canvas.height = s;
            const ctx = canvas.getContext("2d");

            // Crisp rendering settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Fill clean white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, s, s);

            // Content bounding box in source: [66, 36, 725, 950]
            const srcX = 60;
            const srcY = 30;
            const srcW = 735;
            const srcH = 955;

            // Fit with 5% margin inside square
            const padding = s * 0.05;
            const targetArea = s - padding * 2;
            const scale = Math.min(targetArea / srcW, targetArea / srcH);
            const drawW = srcW * scale;
            const drawH = srcH * scale;
            const dx = (s - drawW) / 2;
            const dy = (s - drawH) / 2;

            ctx.drawImage(img, srcX, srcY, srcW, srcH, dx, dy, drawW, drawH);
            resolve(canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""));
          };
          img.src = src;
        });
      },
      { src: dataUrl, s: size }
    );
  }

  console.log("Rendering 16, 32, 48, 180, 192, 512 frames...");
  const png16 = Buffer.from(await renderFrame(16), "base64");
  const png32 = Buffer.from(await renderFrame(32), "base64");
  const png48 = Buffer.from(await renderFrame(48), "base64");
  const png180 = Buffer.from(await renderFrame(180), "base64");
  const png192 = Buffer.from(await renderFrame(192), "base64");
  const png512 = Buffer.from(await renderFrame(512), "base64");

  await browser.close();

  // Multi-resolution ICO
  const icoBuf = buildIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  // Create favicon.svg that embeds the 512 png as a vector-ready SVG
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="64" fill="#ffffff" />
  <image href="data:image/png;base64,${png512.toString("base64")}" width="512" height="512" />
</svg>`;

  const targets = [webPublic, adminPublic];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, "favicon.ico"), icoBuf);
    fs.writeFileSync(path.join(dir, "favicon.svg"), svgContent, "utf-8");
    fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), png180);
    fs.writeFileSync(path.join(dir, "icon-192.png"), png192);
    fs.writeFileSync(path.join(dir, "icon-512.png"), png512);

    console.log(`✓ Updated favicons in ${path.relative(path.resolve(__dirname, "../../.."), dir)}`);
  }

  console.log("Favicon suite generation complete!");
}

run().catch((err) => {
  console.error("Favicon error:", err);
  process.exit(1);
});
