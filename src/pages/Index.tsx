import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmployeeCard } from "@/components/dashboard/EmployeeCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ApplicationUsage } from "@/components/dashboard/ApplicationUsage";
import { TeamOverview } from "@/components/admin/TeamOverview";
import { UserActivity } from "@/components/user/UserActivity";
import { useProfile } from "@/hooks/useProfile";
import { Users, Clock, TrendingUp, Monitor, Shield } from "lucide-react";

const Index = () => {
  const { profile, loading, isAdmin } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Role-based Welcome */}
        <div className="flex items-center space-x-3 mb-6">
          {isAdmin && <Shield className="h-6 w-6 text-primary" />}
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {profile?.full_name || profile?.email}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Admin Dashboard - View and manage all team members' : 'User Dashboard - Manage your activities'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          // Admin View - Can see all team members and their activities
          <>
            <TeamOverview />
          </>
        ) : (
          // Regular User View - Can only see their own activities
          <>
            {/* User Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="My Activities"
                value="5"
                change="2 active today"
                changeType="positive"
                icon={Users}
              />
              <MetricCard
                title="Current Status"
                value="Active"
                change="Working on tasks"
                changeType="positive"
                icon={TrendingUp}
              />
              <MetricCard
                title="Today's Time"
                value="6h 45m"
                change="Above average"
                changeType="positive"
                icon={Clock}
              />
              <MetricCard
                title="Productivity"
                value="85%"
                change="Good progress"
                changeType="positive"
                icon={Monitor}
              />
            </div>
            
            <UserActivity />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
