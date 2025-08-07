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

  useEffect(() => {
    fetchTeamMembers();
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