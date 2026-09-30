const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateOgImage() {
  console.log('Launching headless browser to render 1200x630 OG image...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #061528 0%, #0c2344 50%, #12396b 100%);
      font-family: 'Inter', sans-serif;
      color: #ffffff;
      padding: 64px 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 100% 0%, rgba(45, 212, 191, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 0% 100%, rgba(225, 29, 72, 0.12) 0%, transparent 45%),
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      pointer-events: none;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(45, 212, 191, 0.4);
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      color: #2dd4bf;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: #2dd4bf;
      box-shadow: 0 0 10px #2dd4bf;
    }
    .main-content {
      position: relative;
      z-index: 2;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 58px;
      font-weight: 700;
      line-height: 1.15;
      margin-top: 16px;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    h1 span {
      color: #2dd4bf;
      font-style: italic;
    }
    p.lead {
      font-size: 22px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.82);
      max-width: 920px;
    }
    .footer {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 24px;
    }
    .stats {
      display: flex;
      gap: 40px;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-val {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
    }
    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .location-tag {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>
  
  <div class="header">
    <div class="badge">
      <div class="badge-dot"></div>
      Multi-Specialty Hospital · Silchar, Assam
    </div>
  </div>

  <div class="main-content">
    <h1>South City Hospital<br><span>We Care With A Difference</span></h1>
    <p class="lead">
      Premier 13-department clinical healthcare and 24/7 critical emergency response serving Silchar and the Barak Valley since 2006.
    </p>
  </div>

  <div class="footer">
    <div class="stats">
      <div class="stat-item">
        <span class="stat-val">13</span>
        <span class="stat-label">Specialty Departments</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">13</span>
        <span class="stat-label">ICU & Diagnostics</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">24/7</span>
        <span class="stat-label">Emergency & Trauma</span>
      </div>
    </div>
    <div class="location-tag">
      📍 Meherpur, Silchar – 788015
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait for web fonts

  const targetPath = path.join(__dirname, '../public/og-image.jpg');
  await page.screenshot({
    path: targetPath,
    type: 'jpeg',
    quality: 90,
  });

  await browser.close();
  const stat = fs.statSync(targetPath);
  console.log(`Successfully generated 1200x630 OG image at ${targetPath}`);
  console.log(`File size: ${(stat.size / 1024).toFixed(1)} KB`);
}

generateOgImage().catch((err) => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
