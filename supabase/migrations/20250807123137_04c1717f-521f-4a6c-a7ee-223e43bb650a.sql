-- Fix function search_path security warnings
-- Set search_path for existing functions to prevent SQL injection

ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';
ALTER FUNCTION public.set_user_admin_role(text) SET search_path = '';
ALTER FUNCTION public.calculate_productivity_score(integer, integer) SET search_path = '';