
-- Create storage bucket for announcement posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-posters',
  'announcement-posters', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policy for announcement posters - allow all operations for now
CREATE POLICY "Anyone can upload announcement posters" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'announcement-posters');

CREATE POLICY "Anyone can view announcement posters" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'announcement-posters');

CREATE POLICY "Anyone can update announcement posters" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'announcement-posters');

CREATE POLICY "Anyone can delete announcement posters" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'announcement-posters');

-- Add poster_image_url column to announcements table
ALTER TABLE public.announcements 
ADD COLUMN poster_image_url TEXT;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.announcements.poster_image_url IS 'URL of uploaded poster/picture for the announcement';
