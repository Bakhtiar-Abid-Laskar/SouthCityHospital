const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function convertLogo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logoPath = path.resolve(__dirname, '../public/logo.jpg');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const dataUrl = `data:image/jpeg;base64,${logoBase64}`;

  // Draw into canvas at crisp 256x256 and export to webp
  const webpDataUrl = await page.evaluate(async (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, 256, 256);
        resolve(canvas.toDataURL('image/webp', 0.90));
      };
      img.src = src;
    });
  }, dataUrl);

  const base64Data = webpDataUrl.replace(/^data:image\/webp;base64,/, '');
  const outPath = path.resolve(__dirname, '../public/logo.webp');
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));

  const originalSize = fs.statSync(logoPath).size;
  const newSize = fs.statSync(outPath).size;

  console.log(`Original logo.jpg: ${(originalSize / 1024).toFixed(1)} KB`);
  console.log(`Converted logo.webp (256x256): ${(newSize / 1024).toFixed(1)} KB`);
  console.log(`Savings: ${((1 - newSize / originalSize) * 100).toFixed(1)}%`);

  await browser.close();
}

convertLogo().catch(console.error);
