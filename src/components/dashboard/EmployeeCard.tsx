import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  name: string;
  role: string;
  avatar?: string;
  status: 'active' | 'idle' | 'offline';
  productivity: number;
  activeTime: string;
  currentActivity?: string;
}

export const EmployeeCard = ({
  name,
  role,
  avatar,
  status,
  productivity,
  activeTime,
  currentActivity
}: EmployeeCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-productive';
      case 'idle': return 'bg-idle';
      case 'offline': return 'bg-inactive';
      default: return 'bg-inactive';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'idle': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
            getStatusColor(status)
          )} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{name}</h4>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
            <Badge variant={getStatusVariant(status)} className="text-xs">
              {status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Productivity</span>
              <span className="font-medium text-foreground">{productivity}%</span>
            </div>
            <Progress value={productivity} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Active Time</span>
            <span className="font-medium text-foreground">{activeTime}</span>
          </div>
          
          {currentActivity && (
            <p className="text-xs text-muted-foreground truncate">
              Currently: {currentActivity}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};