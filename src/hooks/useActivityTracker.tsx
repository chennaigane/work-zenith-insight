
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface TrackingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

interface ActivityData {
  applicationName: string;
  windowTitle: string;
  isProductive: boolean;
  startTime: Date;
  duration: number;
}

interface WebsiteData {
  domain: string;
  url: string;
  title: string;
  isProductive: boolean;
  startTime: Date;
  duration: number;
}

export function useActivityTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrackingSession | null>(null);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);

  // Check if there's an active session on mount
  useEffect(() => {
    if (user) {
      checkActiveSession();
    }
  }, [user]);

  const checkActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .is('session_end', null)
        .order('session_start', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const session = data[0];
        setCurrentSession({
          id: session.id,
          startTime: new Date(session.session_start),
          isActive: true
        });
        setIsTracking(true);
        setTrackingStartTime(new Date(session.session_start));
        
        toast({
          title: "Active Session Found",
          description: "Continuing your existing work session",
        });
      }
    } catch (error: any) {
      console.error('Error checking active session:', error);
    }
  };

  const startTracking = async () => {
    if (!user) return;

    try {
      const startTime = new Date();
      
      // Create a new session in the database
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_start: startTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const session: TrackingSession = {
        id: data.id,
        startTime,
        isActive: true
      };

      setCurrentSession(session);
      setIsTracking(true);
      setTrackingStartTime(startTime);

      toast({
        title: "Tracking Started",
        description: "Your work session has begun. Activities will be tracked until you stop.",
      });

      // Start collecting activity data
      startActivityCollection();

    } catch (error: any) {
      console.error('Error starting tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start tracking session",
        variant: "destructive",
      });
    }
  };

  const stopTracking = async () => {
    if (!currentSession || !user) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60); // in minutes

      // Update the session in the database
      const { error } = await supabase
        .from('user_sessions')
        .update({
          session_end: endTime.toISOString(),
          total_duration: duration
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setCurrentSession(null);
      setIsTracking(false);
      setTrackingStartTime(null);

      toast({
        title: "Tracking Stopped",
        description: `Work session ended. Total duration: ${Math.floor(duration / 60)}h ${duration % 60}m`,
      });

      // Stop collecting activity data
      stopActivityCollection();

    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      toast({
        title: "Error",
        description: "Failed to stop tracking session",
        variant: "destructive",
      });
    }
  };

  const startActivityCollection = () => {
    // In a real implementation, this would integrate with system APIs
    // For now, we'll simulate data collection with mock data
    console.log('Starting activity collection...');
    
    // Simulate periodic data collection
    const interval = setInterval(() => {
      if (isTracking && currentSession) {
        collectMockActivityData();
      }
    }, 30000); // Collect data every 30 seconds

    // Store interval ID for cleanup
    (window as any).activityInterval = interval;
  };

  const stopActivityCollection = () => {
    console.log('Stopping activity collection...');
    if ((window as any).activityInterval) {
      clearInterval((window as any).activityInterval);
      delete (window as any).activityInterval;
    }
  };

  const collectMockActivityData = async () => {
    if (!user || !currentSession) return;

    try {
      const now = new Date();
      
      // Mock application usage data
      const mockApps = [
        { name: 'Visual Studio Code', productive: true },
        { name: 'Chrome Browser', productive: true },
        { name: 'Slack', productive: true },
        { name: 'Spotify', productive: false },
        { name: 'Teams', productive: true }
      ];

      const randomApp = mockApps[Math.floor(Math.random() * mockApps.length)];
      
      await supabase.from('application_usage').insert({
        user_id: user.id,
        session_id: currentSession.id,
        application_name: randomApp.name,
        window_title: `${randomApp.name} - Active Window`,
        start_time: now.toISOString(),
        duration: Math.floor(Math.random() * 5) + 1, // 1-5 minutes
        is_productive: randomApp.productive
      });

      // Mock website usage data
      const mockWebsites = [
        { domain: 'github.com', productive: true },
        { domain: 'stackoverflow.com', productive: true },
        { domain: 'youtube.com', productive: false },
        { domain: 'linkedin.com', productive: true },
        { domain: 'twitter.com', productive: false }
      ];

      const randomWebsite = mockWebsites[Math.floor(Math.random() * mockWebsites.length)];
      
      await supabase.from('website_usage').insert({
        user_id: user.id,
        session_id: currentSession.id,
        domain: randomWebsite.domain,
        url: `https://${randomWebsite.domain}`,
        title: `${randomWebsite.domain} - Web Page`,
        start_time: now.toISOString(),
        duration: Math.floor(Math.random() * 3) + 1, // 1-3 minutes
        is_productive: randomWebsite.productive
      });

      console.log('Mock activity data collected');
    } catch (error) {
      console.error('Error collecting activity data:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopActivityCollection();
    };
  }, []);

  const getSessionDuration = () => {
    if (!trackingStartTime) return 0;
    return Math.floor((new Date().getTime() - trackingStartTime.getTime()) / 1000 / 60);
  };

  return {
    isTracking,
    currentSession,
    trackingStartTime,
    startTracking,
    stopTracking,
    getSessionDuration
  };
}
