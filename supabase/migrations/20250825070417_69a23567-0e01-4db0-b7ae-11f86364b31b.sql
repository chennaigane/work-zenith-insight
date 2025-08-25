
-- Add a column to profiles table to track password-related information
ALTER TABLE public.profiles 
ADD COLUMN password_last_changed timestamp with time zone DEFAULT now(),
ADD COLUMN requires_password_reset boolean DEFAULT false;

-- Create a function to check if user has a recent password (for display purposes)
CREATE OR REPLACE FUNCTION public.get_password_status(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE 
    WHEN p.requires_password_reset THEN 'Reset Required'
    WHEN p.password_last_changed > (now() - interval '90 days') THEN 'Recent'
    WHEN p.password_last_changed > (now() - interval '180 days') THEN 'Good'
    ELSE 'Needs Update'
  END
  FROM public.profiles p
  WHERE p.user_id = get_password_status.user_id;
$$;

-- Update the trigger function to set password_last_changed when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, password_last_changed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    now()
  );
  RETURN NEW;
END;
$$;
