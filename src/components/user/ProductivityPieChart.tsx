import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";

export function ProductivityPieChart() {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Productivity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: 'Productive Time',
      value: metrics?.productiveTime || 0,
      color: 'hsl(var(--success))'
    },
    {
      name: 'Idle Time',
      value: metrics?.idleTime || 0,
      color: 'hsl(var(--warning))'
    },
    {
      name: 'Offline Time',
      value: Math.max(0, (8 * 60) - (metrics?.totalActiveTime || 0)), // Assuming 8-hour workday
      color: 'hsl(var(--muted))'
    }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Productivity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No productivity data available for today
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Today's Productivity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${formatTime(value)}`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatTime(value), 'Duration']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}: {formatTime(entry.payload?.value || 0)}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {metrics && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(metrics.productivityScore)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Productivity Score
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}