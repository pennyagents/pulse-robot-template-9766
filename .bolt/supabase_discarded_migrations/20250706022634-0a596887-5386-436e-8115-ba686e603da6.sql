
-- Add YouTube video URL field to announcements table for admin-managed video content
ALTER TABLE public.announcements 
ADD COLUMN youtube_video_url TEXT;

-- Add a comment to clarify the purpose
COMMENT ON COLUMN public.announcements.youtube_video_url IS 'YouTube video URL for promotional content on landing page';
