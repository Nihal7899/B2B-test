-- Drop the existing check constraint
ALTER TABLE home_banners DROP CONSTRAINT IF EXISTS home_banners_position_check;

-- Add a new check constraint that allows 'carousel' as well
ALTER TABLE home_banners ADD CONSTRAINT home_banners_position_check 
  CHECK (position IN ('top', 'carousel', 'middle', 'bottom'));