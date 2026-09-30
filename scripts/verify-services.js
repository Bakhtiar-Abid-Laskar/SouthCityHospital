const http = require('http');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const expectedDepartments = [
  'internal-medicine',
  'orthopaedic-surgery',
  'neuro-surgery',
  'general-laparoscopic-surgery',
  'endoscopic-surgery',
  'gynecology-and-obst',
  'urology-laser-surgery',
  'nephrology',
  'cardiology',
  'plastic-surgery',
  'paediatrics',
  'anaesthesiology',
  'oncology'
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

function countWords(text) {
  // Strip script, style, html tags, and count words
  const clean = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = clean.split(/\s+/).filter(w => w.length > 1);
  return words.length;
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractAllTags(html, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

async function runVerification() {
  console.log('--- 1. OFFERINGS 1:1 COVERAGE VERIFICATION ---');
  console.log(`Total Offerings defined: ${expectedDepartments.length}`);
  
  // Check sitemap first
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  if (sitemapRes.status !== 200) {
    throw new Error(`Failed to fetch sitemap: HTTP ${sitemapRes.status}`);
  }

  const sitemapUrls = extractAllTags(sitemapRes.body, /<loc>(.*?)<\/loc>/g);
  console.log(`Total URLs in sitemap: ${sitemapUrls.length}`);

  let missingInSitemap = 0;
  for (const slug of expectedDepartments) {
    const expectedUrl = `https://southcityhospital.in/departments/${slug}`;
    const found = sitemapUrls.includes(expectedUrl);
    if (!found) {
      console.error(`FAIL: Missing in sitemap: ${expectedUrl}`);
      missingInSitemap++;
    }
  }

  console.log(`Sitemap coverage: ${expectedDepartments.length - missingInSitemap}/${expectedDepartments.length} offerings in sitemap.xml`);

  console.log('\n--- 2. CRAWLING ALL 13 DEDICATED SERVICE PAGES ---');
  const results = [];
  const titles = new Set();
  const descriptions = new Set();

  for (const slug of expectedDepartments) {
    const url = `${BASE_URL}/departments/${slug}`;
    const res = await fetch(url);
    if (res.status !== 200) {
      throw new Error(`Page ${url} returned HTTP ${res.status}`);
    }

    const html = res.body;

    // Check H1
    const h1Matches = extractAllTags(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
    const h1Clean = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim());

    // Check Title
    const title = extractTag(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);

    // Check Meta Description
    const desc = extractTag(html, /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

    // Check Canonical
    const canonical = extractTag(html, /<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);

    // Check Body Word Count
    const wordCount = countWords(html);

    titles.add(title);
    descriptions.add(desc);

    results.push({
      slug,
      status: res.status,
      h1Count: h1Matches.length,
      h1: h1Clean[0] || 'NONE',
      title,
      descLength: desc ? desc.length : 0,
      desc,
      canonical,
      wordCount
    });
  }

  // Print results summary table
  console.log('SLUG | HTTP | H1 COUNT | H1 | WORDS | TITLE | DESC_LEN');
  console.log('-------------------------------------------------------------');
  for (const r of results) {
    console.log(`${r.slug} | ${r.status} | ${r.h1Count} | "${r.h1}" | ${r.wordCount} words | "${r.title}" | ${r.descLength}c`);
  }

  console.log('\n--- 3. SAMPLE OF 3 PAGES DEEP DIVE ---');
  const sampleSlugs = ['cardiology', 'orthopaedic-surgery', 'urology-laser-surgery'];
  for (const slug of sampleSlugs) {
    const r = results.find(item => item.slug === slug);
    console.log(`\n=== SAMPLE: ${slug.toUpperCase()} ===`);
    console.log(`URL: https://southcityhospital.in/departments/${slug}`);
    console.log(`H1 (${r.h1Count} tag): ${r.h1}`);
    console.log(`Title: ${r.title}`);
    console.log(`Description: ${r.desc}`);
    console.log(`Canonical: ${r.canonical}`);
    console.log(`Word Count: ${r.wordCount} words (Requirement: > 250 words)`);
  }

  console.log('\n--- 4. AUDIT CHECKS ---');
  let auditPassed = true;

  if (titles.size !== expectedDepartments.length) {
    console.error(`FAIL: Title collision! Unique titles: ${titles.size} / ${expectedDepartments.length}`);
    auditPassed = false;
  } else {
    console.log(`PASS: All ${titles.size} titles are unique across all department pages.`);
  }

  if (descriptions.size !== expectedDepartments.length) {
    console.error(`FAIL: Description collision! Unique descriptions: ${descriptions.size} / ${expectedDepartments.length}`);
    auditPassed = false;
  } else {
    console.log(`PASS: All ${descriptions.size} descriptions are unique across all department pages.`);
  }

  const failingH1 = results.filter(r => r.h1Count !== 1);
  if (failingH1.length > 0) {
    console.error(`FAIL: ${failingH1.length} pages have invalid H1 count:`, failingH1.map(r => r.slug));
    auditPassed = false;
  } else {
    console.log(`PASS: All 13 pages have exactly 1 H1 tag.`);
  }

  const thinPages = results.filter(r => r.wordCount < 250);
  if (thinPages.length > 0) {
    console.error(`FAIL: ${thinPages.length} pages have < 250 words:`, thinPages.map(r => `${r.slug}: ${r.wordCount}`));
    auditPassed = false;
  } else {
    console.log(`PASS: All 13 pages exceed the 250 words requirement (Min: ${Math.min(...results.map(r => r.wordCount))} words, Max: ${Math.max(...results.map(r => r.wordCount))} words).`);
  }

  if (auditPassed && missingInSitemap === 0) {
    console.log('\n*** ITEM 8 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
  } else {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
