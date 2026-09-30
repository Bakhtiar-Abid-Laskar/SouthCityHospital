-- Migration: Add Doctor SEO, Slug, Bio, and Expertise Fields
-- South City Hospital, Silchar

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_title TEXT NULL;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_description TEXT NULL;

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Automatically populate updated_at on doctors when updated (ensure trigger exists)
DROP TRIGGER IF EXISTS trigger_doctors_updated_at ON doctors;
CREATE TRIGGER trigger_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Backfill existing doctor slugs
UPDATE doctors SET slug = 'dr-navonil-gupta-orthopaedic-surgery-silchar' WHERE id = 'doc-1787824257045' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-annesha-roy-orthopaedic-surgery-silchar' WHERE id = 'doc-1787824620868' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-alaka-banerjee-gynecology-and-obst-silchar' WHERE id = 'doc-1787824525220' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-pinaki-roy-urology-laser-surgery-silchar' WHERE id = 'doc-1787662437011' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-sudipan-dey-orthopaedic-surgery-silchar' WHERE id = 'doc-1790578157287' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-biplob-nath-internal-medicine-silchar' WHERE id = 'doc-1790578425272' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-sandhya-r-nair-gynecology-and-obst-silchar' WHERE id = 'doc-1790578900034' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-indrajit-debnath-cardiology-silchar' WHERE id = 'doc-1790579050076' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-tridib-barali-orthopaedics-silchar' WHERE id = 'doc-1790579244763' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-j-p-sinha-internal-medicine-silchar' WHERE id = 'doc-1790579592327' AND slug IS NULL;
UPDATE doctors SET slug = 'dr-hari-s-nair-internal-medicine-silchar' WHERE id = 'doc-1790579814115' AND slug IS NULL;

COMMENT ON COLUMN doctors.slug IS 'Authoritative SEO URL slug (e.g. dr-annesha-roy-orthopaedic-surgery-silchar)';
COMMENT ON COLUMN doctors.expertise IS 'Array of clinical focus areas / conditions treated';
COMMENT ON COLUMN doctors.seo_title IS 'Optional override for title tag';
COMMENT ON COLUMN doctors.seo_description IS 'Optional override for meta description';
