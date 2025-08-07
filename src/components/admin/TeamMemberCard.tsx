import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Activity, TrendingUp, Monitor } from 'lucide-react';

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

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string, isOnline?: boolean) => {
    if (!isOnline) return 'bg-gray-400';
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'break': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(member.full_name, member.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">
              {member.full_name || member.email}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
            {member.role}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Online Status & Current Activity */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(
              member.currentActivity?.status || 'offline', 
              member.isOnline
            )}`} />
            <span className="text-sm font-medium capitalize">
              {member.isOnline 
                ? (member.currentActivity?.status || 'online') 
                : 'offline'
              }
            </span>
          </div>
          
          {member.currentActivity && (
            <div className="flex items-start space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {member.currentActivity.activity_type}
                </p>
                {member.currentActivity.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {member.currentActivity.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Productivity Metrics */}
        {member.productivity && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Productivity</span>
              </div>
              <span className="text-xs font-medium">
                {Math.round(member.productivity.productivity_score)}%
              </span>
            </div>
            <Progress 
              value={member.productivity.productivity_score} 
              className="h-1.5"
            />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Monitor className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Active:</span>
                <span className="font-medium">
                  {formatDuration(member.productivity.total_active_time)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Productive:</span>
                <span className="font-medium">
                  {formatDuration(member.productivity.productive_time)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        {member.currentSession && (
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Online since {formatTime(member.currentSession.session_start)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}