-- Add missing columns to existing tables
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Add missing column to registration_verifications table  
ALTER TABLE public.registration_verifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for updated_at on registration_verifications if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_registration_verifications_updated_at'
    ) THEN
        CREATE TRIGGER update_registration_verifications_updated_at
        BEFORE UPDATE ON public.registration_verifications
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;