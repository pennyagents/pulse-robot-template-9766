-- Create admin_permissions table for granular permission management
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  module TEXT NOT NULL,
  permission_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, module, permission_type)
);

-- Add foreign key constraint
ALTER TABLE public.admin_permissions 
ADD CONSTRAINT admin_permissions_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage all permissions" 
ON public.admin_permissions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add missing columns to registrations table
ALTER TABLE public.registrations 
ADD COLUMN approved_by TEXT;

-- Add missing column to registration_verifications table  
ALTER TABLE public.registration_verifications 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for updated_at on admin_permissions
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on registration_verifications
CREATE TRIGGER update_registration_verifications_updated_at
BEFORE UPDATE ON public.registration_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();