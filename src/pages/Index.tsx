import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmployeeCard } from "@/components/dashboard/EmployeeCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ApplicationUsage } from "@/components/dashboard/ApplicationUsage";
import { Users, Clock, TrendingUp, Monitor } from "lucide-react";

const Index = () => {
  const employees = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      avatar: "/placeholder.svg",
      status: "active" as const,
      productivity: 92,
      activeTime: "7h 23m",
      currentActivity: "Working on React components"
    },
    {
      name: "Mike Chen",
      role: "Backend Developer", 
      avatar: "/placeholder.svg",
      status: "idle" as const,
      productivity: 76,
      activeTime: "6h 45m",
      currentActivity: "Code review on GitHub"
    },
    {
      name: "Emma Wilson",
      role: "UI/UX Designer",
      avatar: "/placeholder.svg", 
      status: "active" as const,
      productivity: 88,
      activeTime: "7h 52m",
      currentActivity: "Designing in Figma"
    },
    {
      name: "Alex Rodriguez",
      role: "DevOps Engineer",
      avatar: "/placeholder.svg",
      status: "offline" as const,
      productivity: 45,
      activeTime: "3h 12m",
      currentActivity: "Last seen: 2h ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Employees"
            value="23"
            change="+2 from yesterday"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Average Productivity"
            value="87%"
            change="+5% from last week"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Active Time"
            value="142h"
            change="+12h from yesterday"
            changeType="positive"
            icon={Clock}
          />
          <MetricCard
            title="Applications Used"
            value="47"
            change="3 new this week"
            changeType="neutral"
            icon={Monitor}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Team Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((employee, index) => (
                <EmployeeCard key={index} {...employee} />
              ))}
            </div>
          </div>

          {/* Application Usage */}
          <div>
            <ApplicationUsage />
          </div>
        </div>

        {/* Activity Chart */}
        <ActivityChart />
      </main>
    </div>
  );
};

export default Index;
