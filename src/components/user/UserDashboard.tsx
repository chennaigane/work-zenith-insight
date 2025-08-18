
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ApplicationUsage } from "@/components/dashboard/ApplicationUsage";
import { ProductiveWebsites } from "@/components/dashboard/ProductiveWebsites";
import { UnproductiveWebsites } from "@/components/dashboard/UnproductiveWebsites";
import { ProductivityPieChart } from "@/components/user/ProductivityPieChart";
import { UserActivity } from "@/components/user/UserActivity";
import { TrackingControls } from "@/components/user/TrackingControls";

export function UserDashboard() {
  return (
    <div className="space-y-6">
      {/* Tracking Controls - Most Important */}
      <TrackingControls />
      
      {/* Productivity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityPieChart />
        <ActivityChart />
      </div>

      {/* Application and Website Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationUsage />
        <div className="space-y-6">
          <ProductiveWebsites />
          <UnproductiveWebsites />
        </div>
      </div>

      {/* User Activities */}
      <UserActivity />
    </div>
  );
}
