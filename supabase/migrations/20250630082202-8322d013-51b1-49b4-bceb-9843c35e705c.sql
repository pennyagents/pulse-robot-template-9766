
-- Insert default admin users with hashed passwords (only if they don't exist)
INSERT INTO public.admin_users (username, password_hash, role) 
VALUES
('anas', crypt('eva919123', gen_salt('bf')), 'super_admin'),
('adminlocal', crypt('admin9094', gen_salt('bf')), 'local_admin'),
('adminuser', crypt('user123', gen_salt('bf')), 'user_admin')
ON CONFLICT (username) DO NOTHING;
