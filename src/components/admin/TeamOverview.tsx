import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberCard } from './TeamMemberCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  isOnline?: boolean;
  currentActivity?: {
    activity_type: string;
    description: string | null;
    status: string;
    updated_at: string;
  };
  productivity?: {
    total_active_time: number;
    productive_time: number;
    idle_time: number;
    productivity_score: number;
  };
  currentSession?: {
    id: string;
    session_start: string;
  };
}

export function TeamOverview() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const setMockData = () => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        user_id: 'user-1',
        email: 'johnkiran@icondf.com',
        full_name: 'Kiran',
        role: 'admin',
        created_at: '2024-01-15T08:00:00Z',
        isOnline: true,
        currentActivity: {
          activity_type: 'coding',
          description: 'Working on user dashboard features',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        productivity: {
          total_active_time: 480,
          productive_time: 420,
          idle_time: 60,
          productivity_score: 87,
        },
        currentSession: {
          id: 'session-1',
          session_start: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: '2',
        user_id: 'user-2',
        email: 'chennaigane@gmail.com',
        full_name: 'Ganesh',
        role: 'user',
        created_at: '2024-01-20T09:00:00Z',
        isOnline: true,
        currentActivity: {
          activity_type: 'meeting',
          description: 'Team standup meeting',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        productivity: {
          total_active_time: 360,
          productive_time: 290,
          idle_time: 70,
          productivity_score: 81,
        },
        currentSession: {
          id: 'session-2',
          session_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: '3',
        user_id: 'user-3',
        email: 'raghavendrakvms@gmail.com',
        full_name: 'Raghavendra',
        role: 'user',
        created_at: '2024-02-01T10:00:00Z',
        isOnline: false,
        currentActivity: {
          activity_type: 'break',
          description: 'Lunch break',
          status: 'idle',
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        productivity: {
          total_active_time: 240,
          productive_time: 200,
          idle_time: 40,
          productivity_score: 83,
        },
      },
      {
        id: '4',
        user_id: 'user-4',
        email: 'dhanalakshmidharmana006@gmail.com',
        full_name: 'Dhanalakshmi',
        role: 'user',
        created_at: '2024-02-10T11:00:00Z',
        isOnline: true,
        currentActivity: {
          activity_type: 'documentation',
          description: 'Updating API documentation',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        productivity: {
          total_active_time: 420,
          productive_time: 380,
          idle_time: 40,
          productivity_score: 90,
        },
        currentSession: {
          id: 'session-4',
          session_start: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: '5',
        user_id: 'user-5',
        email: 'vijayakumar.jjstark@gmail.com',
        full_name: 'Vijayakumar',
        role: 'user',
        created_at: '2024-02-15T12:00:00Z',
        isOnline: true,
        currentActivity: {
          activity_type: 'testing',
          description: 'Running automated tests',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        productivity: {
          total_active_time: 300,
          productive_time: 250,
          idle_time: 50,
          productivity_score: 75,
        },
        currentSession: {
          id: 'session-5',
          session_start: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        id: '6',
        user_id: 'user-6',
        email: 'jananieshwaripalani@gmail.com',
        full_name: 'Jananieshwari',
        role: 'user',
        created_at: '2024-02-20T13:00:00Z',
        isOnline: false,
        currentActivity: {
          activity_type: 'offline',
          description: null,
          status: 'offline',
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        productivity: {
          total_active_time: 180,
          productive_time: 150,
          idle_time: 30,
          productivity_score: 85,
        },
      },
      {
        id: '7',
        user_id: 'user-7',
        email: 'yogalaksmi06@gmail.com',
        full_name: 'Yogalakshmi',
        role: 'user',
        created_at: '2024-02-25T14:00:00Z',
        isOnline: true,
        currentActivity: {
          activity_type: 'coding',
          description: 'Developing new features',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        productivity: {
          total_active_time: 380,
          productive_time: 340,
          idle_time: 40,
          productivity_score: 89,
        },
        currentSession: {
          id: 'session-7',
          session_start: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      },
    ];

    setTeamMembers(mockTeamMembers);
    setLoading(false);
  };

  useEffect(() => {
    // Using mock data for demonstration
    setMockData();
    // fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const today = new Date().toISOString().split('T')[0];

      // Fetch latest activity and productivity data for each user
      const membersWithActivities = await Promise.all(
        profiles.map(async (profile) => {
          // Get latest activity
          const { data: activity } = await supabase
            .from('team_activities')
            .select('*')
            .eq('user_id', profile.user_id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get today's productivity data
          const { data: productivity } = await supabase
            .from('daily_productivity')
            .select('*')
            .eq('user_id', profile.user_id)
            .eq('date', today)
            .maybeSingle();

          // Get current session
          const { data: currentSession } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', profile.user_id)
            .is('session_end', null)
            .order('session_start', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...profile,
            currentActivity: activity || undefined,
            productivity: productivity || undefined,
            currentSession: currentSession || undefined,
            isOnline: !!currentSession
          };
        })
      );

      setTeamMembers(membersWithActivities);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalMembers = teamMembers.length;
    const onlineMembers = teamMembers.filter(member => member.isOnline).length;
    const activeMembers = teamMembers.filter(
      member => member.currentActivity?.status === 'active'
    ).length;
    const adminCount = teamMembers.filter(member => member.role === 'admin').length;
    const avgProductivity = teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, member) => 
          sum + (member.productivity?.productivity_score || 0), 0) / teamMembers.length)
      : 0;

    return { totalMembers, onlineMembers, activeMembers, adminCount, avgProductivity };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Members</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Online Now</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.onlineMembers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Team Productivity</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.avgProductivity}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Admins</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.adminCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}