/**
 * One-time backfill script to generate and populate doctor slugs in Supabase and data/doctors.json
 * South City Hospital, Silchar
 *
 * Usage:
 *   node scripts/backfill-doctor-slugs.js
 */

const fs = require('fs');
const path = require('path');
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch {
  createClient = require(path.join(__dirname, '..', 'apps', 'web', 'node_modules', '@supabase', 'supabase-js')).createClient;
}

// Load env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgvpriwhqhbvofowbblv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndnByaXdocWhidm9mb3diYmx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQ4OTM2NiwiZXhwIjoyMTAzMDY1MzY2fQ.lJw6BWwnVLikbfKSYzVA64QAAxLWFEls7U-9Fs4XxPQ';

function generateDoctorSlug(name, departmentSlug, existingSlugs = []) {
  let cleanName = name
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, '')
    .replace(/^(dr\.|dr|doctor|prof\.|prof)\s+/gi, '')
    .trim();

  const nameSlug = cleanName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const specialtySlug = (departmentSlug || 'general')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const baseSlug = `dr-${nameSlug}-${specialtySlug}-silchar`;

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

async function run() {
  console.log('Connecting to Supabase at:', SUPABASE_URL);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: doctors, error } = await supabase.from('doctors').select('*');
  if (error) {
    console.error('Failed to query doctors table:', error);
    return;
  }

  console.log(`Found ${doctors.length} doctors in database.`);

  const existingSlugs = [];
  const updates = [];
  const sqlStatements = [];

  for (const doc of doctors) {
    const slug = generateDoctorSlug(doc.name, doc.department_slug, existingSlugs);
    existingSlugs.push(slug);
    updates.push({ id: doc.id, name: doc.name, slug });
    sqlStatements.push(`UPDATE doctors SET slug = '${slug}' WHERE id = '${doc.id}';`);
  }

  console.log('\n--- Generated Slugs ---');
  updates.forEach((u) => console.log(`${u.name.padEnd(25)} -> ${u.slug}`));

  // Try updating via Supabase client
  let successCount = 0;
  for (const u of updates) {
    const { error: updateErr } = await supabase
      .from('doctors')
      .update({ slug: u.slug })
      .eq('id', u.id);

    if (updateErr) {
      console.warn(`Could not update slug for ${u.name} via REST API:`, updateErr.message);
    } else {
      successCount++;
    }
  }

  if (successCount === updates.length) {
    console.log(`\nSuccessfully updated ${successCount} doctor slugs in Supabase!`);
  } else {
    console.log(`\nNote: ${successCount}/${updates.length} updated. If the column 'slug' was not yet added in Supabase, execute this SQL:`);
    console.log('\n--- SQL to execute in Supabase SQL Editor ---');
    console.log(`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;\nCREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);\n`);
    console.log(sqlStatements.join('\n'));
  }

  // Also update data/doctors.json if present
  const localFile = path.join(__dirname, '..', 'data', 'doctors.json');
  if (fs.existsSync(localFile)) {
    try {
      const localDocs = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      const localSlugs = [];
      const updatedLocalDocs = localDocs.map((d) => {
        const slug = generateDoctorSlug(d.name, d.departmentSlug, localSlugs);
        localSlugs.push(slug);
        return { ...d, slug };
      });
      fs.writeFileSync(localFile, JSON.stringify(updatedLocalDocs, null, 2), 'utf8');
      console.log(`\nUpdated local data/doctors.json with generated slugs.`);
    } catch (e) {
      console.error('Failed to update local data/doctors.json:', e);
    }
  }
}

run();
