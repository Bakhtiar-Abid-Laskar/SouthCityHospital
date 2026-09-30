const http = require('http');

const PORT = 3005;
const BASE_LOCAL = `http://localhost:${PORT}`;

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=====================================================');
  console.log('  ITEM 3: SEARCH CONSOLE & WEBMASTER VERIFICATION');
  console.log('=====================================================\n');

  // Check Home page
  console.log('--- 1. Checking Verification Tags on Homepage (/) ---');
  const homeRes = await fetchHtml(`${BASE_LOCAL}/`);
  if (homeRes.statusCode !== 200) {
    throw new Error(`Failed to fetch /: HTTP ${homeRes.statusCode}`);
  }

  const googleTagMatch = homeRes.body.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
  const bingTagMatch = homeRes.body.match(/<meta\s+name=["']msvalidate\.01["']\s+content=["']([^"']+)["']/i);

  if (!googleTagMatch) {
    throw new Error('Missing google-site-verification meta tag on /');
  }
  console.log(`  ✓ Found google-site-verification tag: content="${googleTagMatch[1]}"`);

  if (!bingTagMatch) {
    throw new Error('Missing msvalidate.01 meta tag on /');
  }
  console.log(`  ✓ Found msvalidate.01 (Bing) tag: content="${bingTagMatch[1]}"`);

  // Check an inner page
  console.log('\n--- 2. Checking Verification Tags on Inner Page (/about) ---');
  const aboutRes = await fetchHtml(`${BASE_LOCAL}/about`);
  if (aboutRes.statusCode !== 200) {
    throw new Error(`Failed to fetch /about: HTTP ${aboutRes.statusCode}`);
  }

  const aboutGoogleMatch = aboutRes.body.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
  const aboutBingMatch = aboutRes.body.match(/<meta\s+name=["']msvalidate\.01["']\s+content=["']([^"']+)["']/i);

  if (!aboutGoogleMatch || !aboutBingMatch) {
    throw new Error('Verification tags not inherited on /about');
  }
  console.log(`  ✓ Inherited on /about: Google (${aboutGoogleMatch[1]}), Bing (${aboutBingMatch[1]})`);

  console.log('\n=====================================================');
  console.log('ALL SEARCH CONSOLE VERIFICATION CHECKS PASSED!');
  console.log('=====================================================');
}

run().catch((err) => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
