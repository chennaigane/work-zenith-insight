-- Update the role for the admin user after they sign up
-- This will be run manually after the admin user (info1@icondf.com) creates their account
-- For now, we'll create a function to easily set admin role

CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'::app_role 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Also insert some sample team activities for demo purposes
-- These will be created after users sign up
INSERT INTO public.team_activities (user_id, activity_type, description, status) 
SELECT 
  p.user_id,
  'Initial Setup',
  'Setting up workspace and initial configuration',
  'active'
FROM public.profiles p 
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_activities WHERE user_id = p.user_id
);