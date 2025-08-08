import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  productive: "hsl(var(--chart-2))",
  unproductive: "hsl(var(--chart-1))",
};

export function WebsiteUsageChart() {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  const websiteData = metrics?.websiteUsage || [];
  
  if (websiteData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Usage</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No website usage data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = websiteData.map(website => ({
    name: website.domain,
    value: website.time,
    percentage: website.percentage,
    fill: website.isProductive ? COLORS.productive : COLORS.unproductive
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percentage }) => `${name} (${percentage}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatTime(value), "Time"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span>Productive websites</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span>Unproductive websites</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}