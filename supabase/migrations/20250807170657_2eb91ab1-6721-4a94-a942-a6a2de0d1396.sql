-- Set johnkiran@icondf.com as admin
SELECT public.set_user_admin_role('johnkiran@icondf.com');

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