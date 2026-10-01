-- Migration: Complete Doctor Profile Fields (Biography, Expertise, SEO, Education, FAQs)
-- South City Hospital, Silchar

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS biography TEXT NULL;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS education JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_title TEXT NULL;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_description TEXT NULL;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);

COMMENT ON COLUMN doctors.biography IS 'Rich-text / Markdown biography paragraph of the doctor';
COMMENT ON COLUMN doctors.expertise IS 'Array of clinical focus areas / conditions treated';
COMMENT ON COLUMN doctors.education IS 'Structured JSON array of degrees, institutions, and completion years';
COMMENT ON COLUMN doctors.faqs IS 'Doctor-specific frequently asked questions for FAQPage structured data';
COMMENT ON COLUMN doctors.seo_title IS 'Optional override for HTML title tag';
COMMENT ON COLUMN doctors.seo_description IS 'Optional override for meta description';
