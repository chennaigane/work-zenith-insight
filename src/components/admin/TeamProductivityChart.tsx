import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  productive: "hsl(var(--chart-2))",
  idle: "hsl(var(--chart-4))",
  offline: "hsl(var(--chart-3))",
};

interface TeamProductivityChartProps {
  teamData: Array<{
    name: string;
    productive: number;
    idle: number;
    offline: number;
  }>;
}

export function TeamProductivityChart({ teamData }: TeamProductivityChartProps) {
  // Calculate totals across all team members
  const totals = teamData.reduce(
    (acc, member) => ({
      productive: acc.productive + member.productive,
      idle: acc.idle + member.idle,
      offline: acc.offline + member.offline,
    }),
    { productive: 0, idle: 0, offline: 0 }
  );

  const chartData = [
    {
      name: "Productive",
      value: totals.productive,
      fill: COLORS.productive,
    },
    {
      name: "Idle",
      value: totals.idle,
      fill: COLORS.idle,
    },
    {
      name: "Offline",
      value: totals.offline,
      fill: COLORS.offline,
    },
  ].filter(item => item.value > 0);

  const formatTime = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-400">Team Productivity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No team data available</p>
          </div>
        ) : (
          <>
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
                  label={({ name, value }) => `${name}: ${formatTime(value)}`}
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
                <span>Productive time</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                <span>Idle time</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                <span>Offline time</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}