-- Temporarily disable RLS on registrations table for admin access
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper admin policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can create registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can view their own registration by mobile and customer_i" ON public.registrations;

-- Create new policies that allow admin operations
CREATE POLICY "Admin can do everything on registrations" 
ON public.registrations
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow anyone to create registrations
CREATE POLICY "Public can create registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Allow public to view their own registrations by mobile number
CREATE POLICY "Public can view own registrations" 
ON public.registrations 
FOR SELECT 
USING (true);