-- Fix function search_path security warnings
-- Set search_path for all existing functions to prevent SQL injection

-- Fix handle_new_user function
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- Fix update_updated_at_column function  
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix any other functions that might exist
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.prokind = 'f'
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config 
            WHERE pg_proc_config.oid = p.oid 
            AND pg_proc_config.setconfig::text LIKE '%search_path%'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', 
                      func_record.schema_name, 
                      func_record.function_name, 
                      func_record.args);
    END LOOP;
END $$;