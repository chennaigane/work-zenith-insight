-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role app_role NOT NULL DEFAULT 'user';

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update RLS policies for profiles to allow admins to see all profiles
DROP POLICY "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);

-- Create team_activities table for tracking what team members are doing
CREATE TABLE public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_activities
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_activities
CREATE POLICY "Users can view their own activities or admins can view all"
ON public.team_activities
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users can insert their own activities"
ON public.team_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities or admins can update all"
ON public.team_activities
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);

-- Create trigger for team_activities updated_at
CREATE TRIGGER update_team_activities_updated_at
BEFORE UPDATE ON public.team_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin user profile (this will be created when the user signs up)
-- We'll need to update this manually after the admin user is created