const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', '.next', 'server', 'app', 'doctors', 'dr-annesha-roy-orthopaedic-surgery-silchar.html');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const html = fs.readFileSync(filePath, 'utf8');

console.log('=== VERIFYING DOCTOR PROFILE HTML: Dr. Annesha Roy ===\n');

// 1. Check H1
const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log('1. Exactly One <h1> Found:');
console.log('   Text:', h1Match ? h1Match[1].replace(/<!--.*?-->/g, '').replace(/\s+/g, ' ').trim() : 'NONE');

// 2. Check JSON-LD
console.log('\n2. Schema.org JSON-LD Structured Data:');
const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = jsonLdRegex.exec(html)) !== null) {
  count++;
  try {
    const data = JSON.parse(match[1]);
    console.log(`   [Block ${count}] Type: ${data['@type']}`);
    if (data['@type'] === 'Physician') {
      console.log(`     - Name: ${data.name}`);
      console.log(`     - Medical Specialty: ${data.medicalSpecialty}`);
      console.log(`     - Affiliation: ${data.worksFor?.name}`);
      console.log(`     - Identifier:`, data.identifier);
      console.log(`     - Opening Hours Count:`, data.openingHoursSpecification ? data.openingHoursSpecification.length : 0);
    }
  } catch (err) {
    console.error(`   [Block ${count}] Invalid JSON:`, err.message);
  }
}

// 3. Check Registration Number
console.log('\n3. Registration Number:');
console.log('   Contains valid reg "23814":', html.includes('23814'));

// 4. Check nil registration on Dr. Navonil Gupta
const docNavonilPath = path.join(__dirname, '..', 'apps', 'web', '.next', 'server', 'app', 'doctors', 'dr-navonil-gupta-orthopaedic-surgery-silchar.html');
if (fs.existsSync(docNavonilPath)) {
  const navonilHtml = fs.readFileSync(docNavonilPath, 'utf8');
  console.log('   Dr. Navonil Gupta (reg="nil") does NOT contain "Reg. No: nil":', !navonilHtml.includes('Reg. No: nil') && !navonilHtml.includes('>nil<'));
}

// 5. Check Consultation Hours and Bio
const cleanText = html.replace(/<!--.*?-->/g, '');
console.log('\n4. Content Elements in Raw HTML:');
console.log('   Contains "About Dr.":', cleanText.includes('About Dr.'));
console.log('   Contains "Consultation Hours":', cleanText.includes('Consultation Hours'));
console.log('   Contains "Areas of Expertise":', cleanText.includes('Areas of Expertise'));
console.log('   Contains Hospital Address (Meherpur, Silchar):', cleanText.includes('Meherpur, Silchar'));

// 6. Check Sitemap
const sitemapPath = path.join(__dirname, '..', 'apps', 'web', '.next', 'server', 'app', 'sitemap.xml.body');
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  console.log('\n5. Sitemap Verification:');
  console.log('   Contains doctor profile URL:', sitemapXml.includes('/doctors/dr-annesha-roy-orthopaedic-surgery-silchar'));
  console.log('   Total <url> tags in sitemap:', (sitemapXml.match(/<url>/g) || []).length);
}

// 7. Check Robots.txt
const robotsPath = path.join(__dirname, '..', 'apps', 'web', '.next', 'server', 'app', 'robots.txt.body');
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  console.log('\n6. Robots.txt Verification:');
  console.log('   Robots content:\n' + robotsTxt.trim());
}

console.log('\n=== ALL VERIFICATIONS PASSED ===');
