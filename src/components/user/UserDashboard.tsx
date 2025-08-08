import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ApplicationUsage } from "@/components/dashboard/ApplicationUsage";
import { WebsiteUsageChart } from "@/components/dashboard/WebsiteUsageChart";
import { ProductiveWebsites } from "@/components/dashboard/ProductiveWebsites";
import { UnproductiveWebsites } from "@/components/dashboard/UnproductiveWebsites";
import { UserActivity } from "@/components/user/UserActivity";
import { ProductivityPieChart } from "@/components/user/ProductivityPieChart";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { Users, Clock, TrendingUp, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserDashboard() {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="My Activities"
          value={metrics?.totalActivities || 0}
          change={`${metrics?.activeToday || 0} active today`}
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Current Status"
          value={metrics?.currentStatus || "Unknown"}
          change="Real-time status"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Today's Time"
          value={formatDuration(metrics?.totalActiveTime || 0)}
          change={metrics?.totalActiveTime && metrics.totalActiveTime > 480 ? "Above average" : "Below average"}
          changeType={metrics?.totalActiveTime && metrics.totalActiveTime > 480 ? "positive" : "neutral"}
          icon={Clock}
        />
        <MetricCard
          title="Productivity"
          value={`${Math.round(metrics?.productivityScore || 0)}%`}
          change={metrics?.productivityScore && metrics.productivityScore > 70 ? "Good progress" : "Room for improvement"}
          changeType={metrics?.productivityScore && metrics.productivityScore > 70 ? "positive" : "neutral"}
          icon={Monitor}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Weekly Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Today's Productivity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityPieChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationUsage />
        <WebsiteUsageChart />
      </div>

      {/* Website Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductiveWebsites />
        <UnproductiveWebsites />
      </div>
    </div>
  );
}