-- Add qr_image_url column to categories table if it doesn't exist
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS qr_image_url TEXT;