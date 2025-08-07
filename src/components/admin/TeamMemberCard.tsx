import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  currentActivity?: {
    activity_type: string;
    description: string | null;
    status: string;
    updated_at: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
      
      <CardContent className="pt-0">
        {member.currentActivity ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(member.currentActivity.status)}`} />
              <span className="text-sm font-medium capitalize">
                {member.currentActivity.status}
              </span>
            </div>
            
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
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatTime(member.currentActivity.updated_at)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm">No current activity</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}