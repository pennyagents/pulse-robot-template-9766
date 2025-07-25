-- Add description column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing categories with default description
UPDATE public.categories 
SET description = 'Registration available for ' || name || ' category'
WHERE description IS NULL;