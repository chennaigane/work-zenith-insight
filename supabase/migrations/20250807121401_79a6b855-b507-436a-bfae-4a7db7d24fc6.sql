-- Create productivity tracking tables

-- User sessions table to track login/logout times
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application usage tracking
CREATE TABLE public.application_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  application_name TEXT NOT NULL,
  window_title TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  is_productive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Website usage tracking
CREATE TABLE public.website_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  url TEXT,
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  is_productive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Productivity metrics aggregated by day
CREATE TABLE public.daily_productivity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_active_time INTEGER NOT NULL DEFAULT 0, -- in minutes
  productive_time INTEGER NOT NULL DEFAULT 0, -- in minutes
  idle_time INTEGER NOT NULL DEFAULT 0, -- in minutes
  total_applications INTEGER NOT NULL DEFAULT 0,
  total_websites INTEGER NOT NULL DEFAULT 0,
  productivity_score DECIMAL(5,2) DEFAULT 0.00, -- percentage 0-100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_productivity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions or admins can view all" 
ON public.user_sessions 
FOR SELECT 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

CREATE POLICY "Users can insert their own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions or admins can update all" 
ON public.user_sessions 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

-- RLS Policies for application_usage
CREATE POLICY "Users can view their own app usage or admins can view all" 
ON public.application_usage 
FOR SELECT 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

CREATE POLICY "Users can insert their own app usage" 
ON public.application_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app usage or admins can update all" 
ON public.application_usage 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

-- RLS Policies for website_usage
CREATE POLICY "Users can view their own website usage or admins can view all" 
ON public.website_usage 
FOR SELECT 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

CREATE POLICY "Users can insert their own website usage" 
ON public.website_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own website usage or admins can update all" 
ON public.website_usage 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

-- RLS Policies for daily_productivity
CREATE POLICY "Users can view their own productivity or admins can view all" 
ON public.daily_productivity 
FOR SELECT 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

CREATE POLICY "Users can insert their own productivity" 
ON public.daily_productivity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity or admins can update all" 
ON public.daily_productivity 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::app_role));

-- Add indexes for better performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_date ON public.user_sessions(DATE(session_start));
CREATE INDEX idx_application_usage_user_id ON public.application_usage(user_id);
CREATE INDEX idx_application_usage_session_id ON public.application_usage(session_id);
CREATE INDEX idx_website_usage_user_id ON public.website_usage(user_id);
CREATE INDEX idx_website_usage_session_id ON public.website_usage(session_id);
CREATE INDEX idx_daily_productivity_user_date ON public.daily_productivity(user_id, date);

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_productivity_updated_at
BEFORE UPDATE ON public.daily_productivity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate productivity score
CREATE OR REPLACE FUNCTION public.calculate_productivity_score(
  productive_minutes INTEGER,
  total_minutes INTEGER
) RETURNS DECIMAL(5,2)
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN total_minutes = 0 THEN 0.00
    ELSE ROUND((productive_minutes::DECIMAL / total_minutes::DECIMAL) * 100, 2)
  END;
$$;

-- Function to update daily productivity metrics
CREATE OR REPLACE FUNCTION public.update_daily_productivity(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_active INTEGER;
  v_productive INTEGER;
  v_idle INTEGER;
  v_app_count INTEGER;
  v_website_count INTEGER;
  v_score DECIMAL(5,2);
BEGIN
  -- Calculate total active time from sessions
  SELECT COALESCE(SUM(
    CASE 
      WHEN session_end IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (session_end - session_start)) / 60
      ELSE 
        EXTRACT(EPOCH FROM (NOW() - session_start)) / 60
    END
  ), 0)::INTEGER
  INTO v_total_active
  FROM public.user_sessions
  WHERE user_id = p_user_id 
    AND DATE(session_start) = p_date;

  -- Calculate productive time from applications and websites
  SELECT 
    COALESCE(SUM(CASE WHEN is_productive THEN duration/60 ELSE 0 END), 0)::INTEGER,
    COUNT(DISTINCT application_name)
  INTO v_productive, v_app_count
  FROM public.application_usage
  WHERE user_id = p_user_id 
    AND DATE(start_time) = p_date;

  -- Add website productive time
  SELECT 
    COALESCE(SUM(CASE WHEN is_productive THEN duration/60 ELSE 0 END), 0)::INTEGER
  INTO v_productive
  FROM (
    SELECT v_productive as duration, true as is_productive
    UNION ALL
    SELECT SUM(CASE WHEN is_productive THEN duration/60 ELSE 0 END)::INTEGER, true
    FROM public.website_usage
    WHERE user_id = p_user_id 
      AND DATE(start_time) = p_date
  ) combined;

  -- Count websites
  SELECT COUNT(DISTINCT domain)
  INTO v_website_count
  FROM public.website_usage
  WHERE user_id = p_user_id 
    AND DATE(start_time) = p_date;

  -- Calculate idle time
  v_idle := GREATEST(0, v_total_active - v_productive);

  -- Calculate productivity score
  v_score := public.calculate_productivity_score(v_productive, v_total_active);

  -- Insert or update daily productivity record
  INSERT INTO public.daily_productivity (
    user_id, date, total_active_time, productive_time, idle_time,
    total_applications, total_websites, productivity_score
  ) VALUES (
    p_user_id, p_date, v_total_active, v_productive, v_idle,
    v_app_count, v_website_count, v_score
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_active_time = EXCLUDED.total_active_time,
    productive_time = EXCLUDED.productive_time,
    idle_time = EXCLUDED.idle_time,
    total_applications = EXCLUDED.total_applications,
    total_websites = EXCLUDED.total_websites,
    productivity_score = EXCLUDED.productivity_score,
    updated_at = NOW();
END;
$$;