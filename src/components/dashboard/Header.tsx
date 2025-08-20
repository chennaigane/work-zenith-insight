
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Play, Square, LogOut, User, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const [isTracking, setIsTracking] = useState(false);
  const { signOut } = useAuth();
  const { profile, isAdmin } = useProfile();
  const { toast } = useToast();

  const handleStartTracking = () => {
    setIsTracking(true);
    toast({
      title: "Tracking Started",
      description: "Your activity is now being monitored",
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking Stopped", 
      description: "Activity monitoring has been paused",
    });
  };

  const handleMonitorUsers = () => {
    // This will be handled by the parent component or routing
    toast({
      title: "User Monitoring",
      description: "Switching to real-time user monitoring view",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">Employee Tracker</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Show Monitor Users button for admins, Start/Stop Tracking for regular users */}
          {isAdmin ? (
            <Button 
              onClick={handleMonitorUsers}
              className="bg-primary hover:bg-primary/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Monitor Users
            </Button>
          ) : (
            <>
              {!isTracking ? (
                <Button 
                  onClick={handleStartTracking}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking
                </Button>
              ) : (
                <Button 
                  onClick={handleStopTracking}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Tracking  
                </Button>
              )}
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="#" alt={profile?.full_name || profile?.email} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile ? getInitials(profile.full_name, profile.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
