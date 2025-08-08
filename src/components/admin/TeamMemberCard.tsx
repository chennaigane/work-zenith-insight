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
    if (!isOnline) return 'bg-inactive';
    switch (status) {
      case 'active': return 'bg-success';
      case 'break': return 'bg-warning';
      case 'away': return 'bg-warning';
      case 'busy': return 'bg-destructive';
      case 'idle': return 'bg-warning';
      default: return 'bg-inactive';
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
    <Card className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src="#" alt={member.full_name || member.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {getInitials(member.full_name, member.email)}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(
                  member.currentActivity?.status || 'offline', 
                  member.isOnline
                )}`} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {member.full_name || 'Unknown User'}
              </h3>
              <p className="text-xs text-muted-foreground">{member.email}</p>
              <Badge 
                variant={member.role === 'admin' ? 'default' : 'secondary'} 
                className="text-xs mt-1"
              >
                {member.role}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium ${
              member.isOnline ? 'text-success' : 'text-muted-foreground'
            }`}>
              {member.isOnline ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
        
        {/* Current Activity */}
        {member.currentActivity && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                member.currentActivity.status === 'active' ? 'bg-success' :
                member.currentActivity.status === 'idle' ? 'bg-warning' : 'bg-muted-foreground'
              }`}></div>
              <span className="text-xs font-medium capitalize text-foreground">
                {member.currentActivity.activity_type}
              </span>
            </div>
            {member.currentActivity.description && (
              <p className="text-xs text-muted-foreground ml-4">
                {member.currentActivity.description}
              </p>
            )}
          </div>
        )}
        
        {/* Productivity Metrics */}
        {member.productivity && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Productivity</span>
              <span className="text-sm font-bold text-primary">
                {member.productivity.productivity_score}%
              </span>
            </div>
            <Progress 
              value={member.productivity.productivity_score} 
              className="h-2 bg-muted/50"
            />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Active: </span>
                <span className="font-medium text-foreground">
                  {formatDuration(member.productivity.total_active_time)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Productive: </span>
                <span className="font-medium text-foreground">
                  {formatDuration(member.productivity.productive_time)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Session Info */}
        {member.currentSession && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Clock className="h-3 w-3" />
            <span>Online since {formatTime(member.currentSession.session_start)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}