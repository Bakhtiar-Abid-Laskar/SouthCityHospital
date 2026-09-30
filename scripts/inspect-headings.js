const http = require('http');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const routes = [
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
  '/departments/internal-medicine',
  '/departments/orthopaedic-surgery',
  '/departments/neuro-surgery',
  '/departments/general-laparoscopic-surgery',
  '/departments/endoscopic-surgery',
  '/departments/gynecology-and-obst',
  '/departments/urology-laser-surgery',
  '/departments/nephrology',
  '/departments/cardiology',
  '/departments/plastic-surgery',
  '/departments/paediatrics',
  '/departments/anaesthesiology',
  '/departments/oncology'
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function extractHeadings(html) {
  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1][1], 10);
    const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    headings.push({ level, tag: match[1].toLowerCase(), text });
  }
  return headings;
}

function checkHeadingHierarchy(headings) {
  let prevLevel = 0;
  const violations = [];
  let h1Count = 0;

  for (let i = 0; i < headings.length; i++) {
    const { level, tag, text } = headings[i];
    if (level === 1) {
      h1Count++;
    }

    if (i === 0) {
      if (level !== 1) {
        violations.push(`First heading is ${tag} instead of h1 ("${text}")`);
      }
    } else {
      // Skipped level check: e.g. from H1 to H3 without H2 (level - prevLevel > 1)
      if (level > prevLevel + 1) {
        violations.push(`Skipped heading level: ${headings[i - 1].tag} ("${headings[i - 1].text}") -> ${tag} ("${text}")`);
      }
    }
    prevLevel = level;
  }

  if (h1Count === 0) {
    violations.push('Missing H1 tag');
  } else if (h1Count > 1) {
    violations.push(`Multiple H1 tags (${h1Count} found)`);
  }

  return { h1Count, violations };
}

function checkLandmarks(html) {
  const hasHeader = /<header\b/i.test(html);
  const hasNav = /<nav\b/i.test(html);
  const hasMain = /<main\b/i.test(html);
  const hasFooter = /<footer\b/i.test(html);

  return {
    hasHeader,
    hasNav,
    hasMain,
    hasFooter,
    allPresent: hasHeader && hasNav && hasMain && hasFooter
  };
}

async function main() {
  console.log(`Auditing ${routes.length} routes for Heading Structure & Semantic Landmarks...\n`);

  let totalViolations = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    const res = await fetch(url);
    if (res.status !== 200) {
      console.error(`ERROR: Route ${route} returned HTTP ${res.status}`);
      totalViolations++;
      continue;
    }

    const html = res.body;
    const headings = extractHeadings(html);
    const { h1Count, violations } = checkHeadingHierarchy(headings);
    const landmarks = checkLandmarks(html);

    const status = violations.length === 0 && landmarks.allPresent ? 'PASS' : 'FAIL';
    if (status === 'FAIL') totalViolations++;

    console.log(`[${status}] ${route}`);
    console.log(`  - H1 count: ${h1Count}`);
    console.log(`  - Landmarks: Header: ${landmarks.hasHeader}, Nav: ${landmarks.hasNav}, Main: ${landmarks.hasMain}, Footer: ${landmarks.hasFooter}`);
    console.log(`  - Heading Tree:`);
    for (const h of headings) {
      const indent = '    '.repeat(h.level);
      console.log(`${indent}${h.tag}: ${h.text}`);
    }

    if (violations.length > 0) {
      console.log(`  - VIOLATIONS:`);
      for (const v of violations) {
        console.log(`    * ${v}`);
      }
    }
    console.log('');
  }

  console.log('=== SUMMARY ===');
  console.log(`Total Routes Checked: ${routes.length}`);
  console.log(`Routes with Violations: ${totalViolations}`);
}

main().catch(console.error);
