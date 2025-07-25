-- Add approved_by column to track who approved the registration
ALTER TABLE public.registrations 
ADD COLUMN approved_by TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.registrations.approved_by IS 'Username of admin who approved the registration, or "self" for self-approval';