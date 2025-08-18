
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SessionStatus } from "@/components/dashboard/SessionStatus";

export const Header = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNotifications = () => {
    console.log("Notifications clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  return (
    <header className="bg-card shadow-card border-b border-border/40 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Metrx</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 min-w-0 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Search activities, apps, websites..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Session Status Indicator */}
          <SessionStatus />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotifications}
            className="relative hover:bg-accent"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
              3
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettings}
            className="hover:bg-accent"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Employee</p>
            </div>
            <div className="h-8 w-8 bg-gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
