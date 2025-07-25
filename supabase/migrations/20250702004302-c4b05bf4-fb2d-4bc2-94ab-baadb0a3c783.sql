-- Fix infinite recursion in admin_users RLS policies
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can only be accessed through functions" ON admin_users;

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_admin_role', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new RLS policies using the function
CREATE POLICY "Super admins can manage all admin users" ON admin_users
FOR ALL USING (public.get_current_admin_role() = 'super_admin')
WITH CHECK (public.get_current_admin_role() = 'super_admin');

-- Ensure categories have proper ordering and highlighting
UPDATE categories SET 
  is_highlighted = CASE WHEN name = 'Job Card' THEN true ELSE false END;

-- Manual SQL for category reordering (run this in Supabase SQL Editor):
-- You can manually update the categories order by running:
-- UPDATE categories SET name = 'Pennyekart Free Registration' WHERE name = 'existing_name_1';
-- UPDATE categories SET name = 'Pennyekart Paid Registration' WHERE name = 'existing_name_2';
-- UPDATE categories SET name = 'Farmelife' WHERE name = 'existing_name_3';
-- UPDATE categories SET name = 'Organelife' WHERE name = 'existing_name_4';
-- UPDATE categories SET name = 'Foodelife' WHERE name = 'existing_name_5';
-- UPDATE categories SET name = 'Entrelife' WHERE name = 'existing_name_6';
-- UPDATE categories SET name = 'Job Card' WHERE name = 'existing_name_7';
-- UPDATE categories SET is_highlighted = true WHERE name = 'Job Card';