-- Ensure we have a proper verification system for registrations
-- This migration creates/updates the verification structure

-- First, let's make sure we have a clean verification table
-- Drop the old tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.registration_verifications CASCADE;
DROP TABLE IF EXISTS public.verification_records CASCADE;

-- Create a unified verification table
CREATE TABLE public.registration_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL,
  verified_by TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Add foreign key constraint to registrations table
  CONSTRAINT fk_registration_verifications_registration_id 
    FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_registration_verifications_registration_id 
ON public.registration_verifications(registration_id);

-- Enable RLS
ALTER TABLE public.registration_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage verification records" 
ON public.registration_verifications 
FOR ALL 
USING (is_admin_context()) 
WITH CHECK (is_admin_context());

-- Add trigger for updating timestamps
CREATE TRIGGER update_registration_verifications_updated_at
BEFORE UPDATE ON public.registration_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();