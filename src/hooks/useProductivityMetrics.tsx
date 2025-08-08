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
      // Use mock data for demonstration
      const mockData: ProductivityMetrics = {
        totalActiveTime: 445, // 7 hours 25 minutes
        productiveTime: 356, // 5 hours 56 minutes  
        idleTime: 89, // 1 hour 29 minutes
        productivityScore: 80,
        totalActivities: 12,
        activeToday: 8,
        currentStatus: 'Active',
        applicationUsage: [
          { name: 'Visual Studio Code', time: 145, percentage: 35, isProductive: true },
          { name: 'Chrome Browser', time: 98, percentage: 24, isProductive: true },
          { name: 'Slack', time: 67, percentage: 16, isProductive: true },
          { name: 'Spotify', time: 45, percentage: 11, isProductive: false },
          { name: 'Photoshop', time: 34, percentage: 8, isProductive: true },
          { name: 'Teams', time: 26, percentage: 6, isProductive: true }
        ],
        websiteUsage: [
          { domain: 'github.com', time: 89, percentage: 28, isProductive: true },
          { domain: 'stackoverflow.com', time: 67, percentage: 21, isProductive: true },
          { domain: 'docs.google.com', time: 45, percentage: 14, isProductive: true },
          { domain: 'youtube.com', time: 56, percentage: 18, isProductive: false },
          { domain: 'linkedin.com', time: 34, percentage: 11, isProductive: true },
          { domain: 'twitter.com', time: 25, percentage: 8, isProductive: false }
        ],
        weeklyData: [
          { name: 'Mon', productive: 6.2, idle: 1.3, offline: 16.5 },
          { name: 'Tue', productive: 7.1, idle: 0.9, offline: 16.0 },
          { name: 'Wed', productive: 5.8, idle: 1.7, offline: 16.5 },
          { name: 'Thu', productive: 6.9, idle: 1.1, offline: 16.0 },
          { name: 'Fri', productive: 5.9, idle: 1.6, offline: 16.5 },
          { name: 'Sat', productive: 2.1, idle: 0.4, offline: 21.5 },
          { name: 'Sun', productive: 1.8, idle: 0.2, offline: 22.0 }
        ]
      };

      setMetrics(mockData);
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch: fetchProductivityMetrics };
}