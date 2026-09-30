const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targets = [
  { name: 'lh-home-desktop', url: 'http://localhost:3000', desktop: true },
  { name: 'lh-about-mobile', url: 'http://localhost:3000/about', desktop: false },
  { name: 'lh-about-desktop', url: 'http://localhost:3000/about', desktop: true },
  { name: 'lh-doctors-mobile', url: 'http://localhost:3000/doctors', desktop: false },
  { name: 'lh-doctors-desktop', url: 'http://localhost:3000/doctors', desktop: true },
];

const outDir = path.join(__dirname, '../docs/launch-audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const t of targets) {
  const outPath = path.join(outDir, `${t.name}.json`);
  if (fs.existsSync(outPath)) {
    console.log(`Skipping ${t.name}, already exists.`);
    continue;
  }
  const flags = [
    `"${t.url}"`,
    `--output=json`,
    `--output-path="${outPath}"`,
    `--chrome-flags="--headless=new --no-sandbox"`,
    `--only-categories=performance,accessibility,best-practices,seo`,
    t.desktop ? `--preset=desktop` : ``,
    `--quiet`
  ].filter(Boolean).join(' ');

  console.log(`Running Lighthouse for ${t.name}...`);
  try {
    execSync(`npx lighthouse ${flags}`, { stdio: 'pipe' });
  } catch (err) {
    // EPERM on temp dir cleanup in Windows is expected and doesn't invalidate output
    if (!fs.existsSync(outPath)) {
      console.error(`Error generating ${t.name}:`, err.message);
    } else {
      console.log(`Generated ${t.name} (ignoring cleanup warning).`);
    }
  }
}

// Summary table
const results = {};
for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith('.json')) {
    const raw = JSON.parse(fs.readFileSync(path.join(outDir, file), 'utf8'));
    results[file.replace('.json', '')] = {
      perf: Math.round(raw.categories?.performance?.score * 100 || 0),
      a11y: Math.round(raw.categories?.accessibility?.score * 100 || 0),
      bp: Math.round(raw.categories?.['best-practices']?.score * 100 || 0),
      seo: Math.round(raw.categories?.seo?.score * 100 || 0),
      fcp: raw.audits?.['first-contentful-paint']?.displayValue || 'N/A',
      lcp: raw.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
      cls: raw.audits?.['cumulative-layout-shift']?.displayValue || 'N/A',
      tbt: raw.audits?.['total-blocking-time']?.displayValue || 'N/A',
    };
  }
}
console.log('RESULTS_SUMMARY:' + JSON.stringify(results, null, 2));
