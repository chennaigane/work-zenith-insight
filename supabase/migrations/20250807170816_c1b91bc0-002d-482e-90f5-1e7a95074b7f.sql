-- First create the app_role enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END
$$;

-- Update the profiles table to use the app_role type for the role column
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Set default value for role column
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user'::app_role;

-- Now set johnkiran@icondf.com as admin
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'johnkiran@icondf.com';

-- Update other users to have user role (if they exist)
UPDATE public.profiles 
SET role = 'user'::app_role 
WHERE email IN (
  'chennaigane@gmail.com',
  'raghavendrakvms@gmail.com', 
  'dhanalakshmidharmana006@gmail.com',
  'vijayakumar.jjstark@gmail.com',
  'jananieshwaripalani@gmail.com',
  'yogalaksmi06@gmail.com'
);