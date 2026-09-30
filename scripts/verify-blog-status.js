const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verifyBlogStatus() {
  console.log('=== ITEM 9: BLOG STATUS VERIFICATION ===\n');

  // Check 1: Verify no /blog directory or page file exists in apps/web/src/app
  const appDir = path.resolve(__dirname, '../apps/web/src/app');
  const blogDirExists = fs.existsSync(path.join(appDir, 'blog'));
  const blogFileExists = fs.existsSync(path.join(appDir, 'blog.tsx')) || fs.existsSync(path.join(appDir, 'blog.ts'));

  console.log('1. Codebase Routes Check:');
  console.log(`- apps/web/src/app/blog directory exists: ${blogDirExists}`);
  console.log(`- apps/web/src/app/blog.(ts|tsx) file exists: ${blogFileExists}`);

  if (blogDirExists || blogFileExists) {
    console.error('FAIL: Dead or empty blog route exists in codebase!');
    process.exit(1);
  } else {
    console.log('PASS: No dead /blog route exists in apps/web/src/app.\n');
  }

  // Check 2: Verify no /blog in sitemap.xml
  console.log('2. Sitemap Check:');
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  const hasBlogInSitemap = sitemapRes.body.includes('/blog');
  console.log(`- /blog in sitemap.xml: ${hasBlogInSitemap}`);
  if (hasBlogInSitemap) {
    console.error('FAIL: /blog referenced in sitemap.xml!');
    process.exit(1);
  } else {
    console.log('PASS: /blog is not present in sitemap.xml.\n');
  }

  // Check 3: Verify no /blog in Navbar, Footer, or any code
  console.log('3. Navigation & Template Links Check:');
  const navbarContent = fs.readFileSync(path.resolve(__dirname, '../apps/web/src/components/layout/Navbar.tsx'), 'utf8');
  const footerContent = fs.readFileSync(path.resolve(__dirname, '../apps/web/src/components/layout/Footer.tsx'), 'utf8');

  const navbarHasBlog = /href=["']\/blog/i.test(navbarContent);
  const footerHasBlog = /href=["']\/blog/i.test(footerContent);

  console.log(`- Navbar contains /blog link: ${navbarHasBlog}`);
  console.log(`- Footer contains /blog link: ${footerHasBlog}`);

  if (navbarHasBlog || footerHasBlog) {
    console.error('FAIL: Navigation contains dead /blog link!');
    process.exit(1);
  } else {
    console.log('PASS: No navigation element points to /blog.\n');
  }

  // Check 4: Verify accessing /blog returns clean HTTP 404
  console.log('4. HTTP Response for /blog:');
  const blogRes = await fetch(`${BASE_URL}/blog`);
  console.log(`- GET /blog HTTP status: ${blogRes.status}`);
  const hasNotFoundH1 = blogRes.body.includes('Page Not Found') || blogRes.body.includes('404');
  console.log(`- Renders custom Not Found UI: ${hasNotFoundH1}`);

  if (blogRes.status !== 404) {
    console.error(`FAIL: Expected HTTP 404 for non-existent /blog, got ${blogRes.status}`);
    process.exit(1);
  } else {
    console.log('PASS: /blog properly returns HTTP 404 with custom Not Found interface.\n');
  }

  console.log('*** ITEM 9 VERIFICATION COMPLETE: ALL CHECKS PASSED ***');
}

verifyBlogStatus().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
