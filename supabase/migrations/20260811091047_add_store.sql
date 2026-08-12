-- Add position column to home_banners
ALTER TABLE home_banners ADD COLUMN position text DEFAULT 'top' CHECK (position IN ('top', 'middle', 'bottom'));

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  theme_bg TEXT NOT NULL,       -- e.g. 'bg-emerald-50'
  theme_border TEXT NOT NULL,   -- e.g. 'border-emerald-200'
  theme_text TEXT NOT NULL,     -- e.g. 'text-emerald-900'
  theme_accent TEXT NOT NULL,   -- e.g. 'bg-emerald-600'
  product_ids JSONB NOT NULL,   -- array of product IDs
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trusted Brands table
CREATE TABLE trusted_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);