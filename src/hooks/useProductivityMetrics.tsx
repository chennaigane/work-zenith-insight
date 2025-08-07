import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ProductivityMetrics {
  totalActiveTime: number; // in minutes
  productiveTime: number; // in minutes
  idleTime: number; // in minutes
  productivityScore: number; // percentage
  totalActivities: number;
  activeToday: number;
  currentStatus: string;
  applicationUsage: Array<{
    name: string;
    time: number; // in minutes
    percentage: number;
    isProductive: boolean;
  }>;
  websiteUsage: Array<{
    domain: string;
    time: number; // in minutes
    percentage: number;
    isProductive: boolean;
  }>;
  weeklyData: Array<{
    name: string;
    productive: number;
    idle: number;
    offline: number;
  }>;
}

export function useProductivityMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProductivityMetrics();
    } else {
      setMetrics(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProductivityMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch today's productivity metrics
      const { data: dailyData } = await supabase
        .from('daily_productivity')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch current activities
      const { data: activities } = await supabase
        .from('team_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      // Fetch today's application usage
      const { data: appUsage } = await supabase
        .from('application_usage')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', `${today}T00:00:00Z`)
        .order('duration', { ascending: false });

      // Fetch today's website usage
      const { data: webUsage } = await supabase
        .from('website_usage')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', `${today}T00:00:00Z`)
        .order('duration', { ascending: false });

      // Fetch weekly productivity data
      const { data: weeklyData } = await supabase
        .from('daily_productivity')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', weekAgo)
        .order('date', { ascending: true });

      // Process application usage
      const totalAppDuration = appUsage?.reduce((sum, app) => sum + (app.duration || 0), 0) || 0;
      const processedAppUsage = appUsage?.slice(0, 5).map(app => ({
        name: app.application_name,
        time: Math.round((app.duration || 0) / 60), // convert to minutes
        percentage: totalAppDuration > 0 ? Math.round(((app.duration || 0) / totalAppDuration) * 100) : 0,
        isProductive: app.is_productive || false
      })) || [];

      // Process website usage
      const totalWebDuration = webUsage?.reduce((sum, web) => sum + (web.duration || 0), 0) || 0;
      const processedWebUsage = webUsage?.slice(0, 5).map(web => ({
        domain: web.domain,
        time: Math.round((web.duration || 0) / 60), // convert to minutes
        percentage: totalWebDuration > 0 ? Math.round(((web.duration || 0) / totalWebDuration) * 100) : 0,
        isProductive: web.is_productive || false
      })) || [];

      // Process weekly data
      const processedWeeklyData = weeklyData?.map(day => {
        const date = new Date(day.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        
        return {
          name: dayName,
          productive: Number(((day.productive_time || 0) / 60).toFixed(1)), // convert to hours
          idle: Number(((day.idle_time || 0) / 60).toFixed(1)), // convert to hours
          offline: Number((Math.max(0, (24 * 60) - (day.total_active_time || 0)) / 60).toFixed(1)) // calculate offline time in hours
        };
      }) || [];

      // Get current status from latest activity
      const latestActivity = activities?.[0];
      const currentStatus = latestActivity?.status === 'active' ? 'Active' : 
                           latestActivity?.status === 'break' ? 'On Break' : 'Offline';

      // Count today's active activities
      const activeToday = activities?.filter(activity => {
        const activityDate = new Date(activity.updated_at).toISOString().split('T')[0];
        return activityDate === today && activity.status === 'active';
      }).length || 0;

      const metricsData: ProductivityMetrics = {
        totalActiveTime: dailyData?.total_active_time || 0,
        productiveTime: dailyData?.productive_time || 0,
        idleTime: dailyData?.idle_time || 0,
        productivityScore: Number(dailyData?.productivity_score || 0),
        totalActivities: activities?.length || 0,
        activeToday,
        currentStatus,
        applicationUsage: processedAppUsage,
        websiteUsage: processedWebUsage,
        weeklyData: processedWeeklyData
      };

      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch: fetchProductivityMetrics };
}