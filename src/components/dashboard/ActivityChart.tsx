import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";

export const ActivityChart = () => {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Weekly Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const data = metrics?.weeklyData || [];
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Weekly Activity Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-72 text-muted-foreground">
            No activity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}h`, 'Hours']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="productive" stackId="a" fill="hsl(var(--success))" name="Productive" />
              <Bar dataKey="idle" stackId="a" fill="hsl(var(--warning))" name="Idle" />
              <Bar dataKey="offline" stackId="a" fill="hsl(var(--muted))" name="Offline" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};