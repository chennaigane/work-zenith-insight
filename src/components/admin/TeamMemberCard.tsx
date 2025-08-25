
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Clock, 
  Activity, 
  Shield, 
  Key,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  password_status?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getPasswordStatusColor = (status: string) => {
    switch (status) {
      case 'Recent':
        return 'bg-success text-success-foreground';
      case 'Good':
        return 'bg-primary text-primary-foreground';
      case 'Needs Update':
        return 'bg-warning text-warning-foreground';
      case 'Reset Required':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      // Mark user as requiring password reset
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ requires_password_reset: true })
        .eq('user_id', member.user_id);

      if (updateError) throw updateError;

      // Send password reset email (this would typically be handled by admin)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        member.email,
        {
          redirectTo: `${window.location.origin}/auth`
        }
      );

      if (resetError) throw resetError;

      toast({
        title: "Password Reset Initiated",
        description: `Password reset email sent to ${member.email}`,
      });
    } catch (error: any) {
      console.error('Error initiating password reset:', error);
      toast({
        title: "Error",
        description: "Failed to initiate password reset",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionDuration = () => {
    if (!member.currentSession) return null;
    const start = new Date(member.currentSession.session_start);
    const now = new Date();
    const duration = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return formatTime(duration);
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(member.full_name, member.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">
                  {member.full_name || 'Unnamed User'}
                </h3>
                {member.role === 'admin' && (
                  <Shield className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={member.isOnline ? "default" : "secondary"}
              className={member.isOnline ? "bg-success text-success-foreground" : ""}
            >
              {member.isOnline ? 'Online' : 'Offline'}
            </Badge>
            {member.role === 'admin' && (
              <Badge variant="outline" className="border-primary text-primary">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Password Status Section */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Password Status:</span>
            </div>
            <Badge className={getPasswordStatusColor(member.password_status || 'Unknown')}>
              {member.password_status || 'Unknown'}
            </Badge>
          </div>
          
          {(member.password_status === 'Needs Update' || member.password_status === 'Reset Required') && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasswordReset}
                disabled={loading}
                className="w-full"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                {loading ? 'Sending...' : 'Send Password Reset'}
              </Button>
            </div>
          )}
        </div>

        {/* Current Activity */}
        {member.currentActivity && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Current Activity</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium capitalize text-foreground">
                  {member.currentActivity.activity_type.replace('_', ' ')}
                </span>
                <Badge 
                  variant={member.currentActivity.status === 'active' ? "default" : "secondary"}
                  className={member.currentActivity.status === 'active' ? "bg-success text-success-foreground" : ""}
                >
                  {member.currentActivity.status}
                </Badge>
              </div>
              {member.currentActivity.description && (
                <p className="text-xs text-muted-foreground">
                  {member.currentActivity.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Session Info */}
        {member.isOnline && getSessionDuration() && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Active Session</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Duration: {getSessionDuration()}
              </p>
            </div>
          </div>
        )}

        {/* Productivity Stats */}
        {member.productivity && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Today's Productivity</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {member.productivity.productivity_score}%
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {formatTime(member.productivity.total_active_time)}
                </div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {formatTime(member.productivity.productive_time)}
                </div>
                <div className="text-xs text-muted-foreground">Productive</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-warning">
                  {formatTime(member.productivity.idle_time)}
                </div>
                <div className="text-xs text-muted-foreground">Idle</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
