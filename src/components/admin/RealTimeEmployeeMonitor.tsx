
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Monitor, Clock, Coffee, UserX, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeActivity {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  isOnline: boolean;
  currentActivity?: {
    activity_type: string;
    description: string | null;
    status: string;
    updated_at: string;
  };
  currentSession?: {
    id: string;
    session_start: string;
  };
  recentAppUsage?: {
    application_name: string;
    window_title: string;
    is_productive: boolean;
    start_time: string;
  };
  recentWebsiteUsage?: {
    domain: string;
    url: string;
    title: string;
    is_productive: boolean;
    start_time: string;
  };
}

export function RealTimeEmployeeMonitor() {
  const [employees, setEmployees] = useState<EmployeeActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const fetchEmployeeActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch all user profiles (excluding admins for this view)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // For each employee, get their current activity data
      const employeeActivities = await Promise.all(
        profiles.map(async (profile) => {
          // Check if user has an active session
          const { data: session } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', profile.user_id)
            .is('session_end', null)
            .order('session_start', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get latest team activity
          const { data: activity } = await supabase
            .from('team_activities')
            .select('*')
            .eq('user_id', profile.user_id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get most recent application usage (last 5 minutes)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const { data: appUsage } = await supabase
            .from('application_usage')
            .select('*')
            .eq('user_id', profile.user_id)
            .gte('start_time', fiveMinutesAgo)
            .order('start_time', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get most recent website usage (last 5 minutes)
          const { data: websiteUsage } = await supabase
            .from('website_usage')
            .select('*')
            .eq('user_id', profile.user_id)
            .gte('start_time', fiveMinutesAgo)
            .order('start_time', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...profile,
            isOnline: !!session,
            currentActivity: activity || undefined,
            currentSession: session || undefined,
            recentAppUsage: appUsage || undefined,
            recentWebsiteUsage: websiteUsage || undefined,
          };
        })
      );

      setEmployees(employeeActivities);
    } catch (error: any) {
      console.error('Error fetching employee activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employee activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    fetchEmployeeActivities();
    
    // Set up real-time monitoring every 30 seconds
    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchEmployeeActivities();
      }
    }, 30000);

    // Store interval ID for cleanup
    (window as any).monitoringInterval = interval;

    toast({
      title: "Monitoring Started",
      description: "Real-time employee activity monitoring is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if ((window as any).monitoringInterval) {
      clearInterval((window as any).monitoringInterval);
      delete (window as any).monitoringInterval;
    }

    toast({
      title: "Monitoring Stopped",
      description: "Real-time monitoring has been disabled",
    });
  };

  useEffect(() => {
    return () => {
      if ((window as any).monitoringInterval) {
        clearInterval((window as any).monitoringInterval);
      }
    };
  }, []);

  const getStatusBadge = (employee: EmployeeActivity) => {
    if (!employee.isOnline) {
      return <Badge variant="secondary" className="bg-inactive text-white"><UserX className="h-3 w-3 mr-1" />Offline</Badge>;
    }

    if (employee.currentActivity) {
      switch (employee.currentActivity.status) {
        case 'active':
          return <Badge className="bg-success text-white"><Monitor className="h-3 w-3 mr-1" />Active</Badge>;
        case 'idle':
          return <Badge variant="secondary" className="bg-warning text-white"><Clock className="h-3 w-3 mr-1" />Idle</Badge>;
        case 'break':
          return <Badge variant="outline" className="bg-idle text-white"><Coffee className="h-3 w-3 mr-1" />Break</Badge>;
        default:
          return <Badge variant="secondary">Unknown</Badge>;
      }
    }

    return <Badge variant="secondary">No Activity</Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Real-Time Employee Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {!isMonitoring ? (
                <Button 
                  onClick={startMonitoring} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchEmployeeActivities}
                    disabled={loading}
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={stopMonitoring}
                    size="sm"
                  >
                    Stop Monitoring
                  </Button>
                </div>
              )}
            </div>
          </div>
          {isMonitoring && (
            <p className="text-sm text-muted-foreground">
              Auto-refreshing every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
        
        {isMonitoring && (
          <CardContent>
            {loading && employees.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No employees found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="bg-gradient-card/50 border shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="#" alt={employee.full_name || employee.email} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {getInitials(employee.full_name, employee.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">
                              {employee.full_name || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(employee)}
                      </div>

                      {/* Current Activity */}
                      {employee.currentActivity && (
                        <div className="bg-muted/30 rounded-lg p-2 space-y-1">
                          <div className="text-xs font-medium capitalize text-foreground">
                            {employee.currentActivity.activity_type}
                          </div>
                          {employee.currentActivity.description && (
                            <p className="text-xs text-muted-foreground">
                              {employee.currentActivity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Updated: {formatTime(employee.currentActivity.updated_at)}
                          </p>
                        </div>
                      )}

                      {/* Recent Application */}
                      {employee.recentAppUsage && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 space-y-1">
                          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Current App: {employee.recentAppUsage.application_name}
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                            {employee.recentAppUsage.window_title}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={employee.recentAppUsage.is_productive ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {employee.recentAppUsage.is_productive ? 'Productive' : 'Non-productive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(employee.recentAppUsage.start_time)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Recent Website */}
                      {employee.recentWebsiteUsage && (
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2 space-y-1">
                          <div className="text-xs font-medium text-green-700 dark:text-green-300">
                            Current Site: {employee.recentWebsiteUsage.domain}
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 truncate">
                            {employee.recentWebsiteUsage.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={employee.recentWebsiteUsage.is_productive ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {employee.recentWebsiteUsage.is_productive ? 'Productive' : 'Non-productive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(employee.recentWebsiteUsage.start_time)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Session Info */}
                      {employee.currentSession ? (
                        <div className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Online since {formatTime(employee.currentSession.session_start)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                          <UserX className="h-3 w-3 inline mr-1" />
                          Currently offline
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
