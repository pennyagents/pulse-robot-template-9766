-- Create admin permissions table
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  module TEXT NOT NULL, -- accounts, registrations, categories, etc.
  permission_type TEXT NOT NULL, -- read, write, delete
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, module, permission_type)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin permissions
CREATE POLICY "Allow admin operations on permissions" 
ON public.admin_permissions 
FOR ALL 
USING (is_admin_context()) 
WITH CHECK (is_admin_context());

-- Create trigger for updating timestamps
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get admin permissions
CREATE OR REPLACE FUNCTION public.get_admin_permissions(admin_id UUID)
RETURNS TABLE(module TEXT, permissions TEXT[])
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    module,
    ARRAY_AGG(permission_type ORDER BY permission_type) as permissions
  FROM public.admin_permissions 
  WHERE admin_user_id = admin_id
  GROUP BY module;
$$;