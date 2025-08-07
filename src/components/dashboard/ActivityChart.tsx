import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', productive: 6.5, idle: 1.5, offline: 0 },
  { name: 'Tue', productive: 7.2, idle: 0.8, offline: 0 },
  { name: 'Wed', productive: 5.8, idle: 2.0, offline: 0.2 },
  { name: 'Thu', productive: 7.5, idle: 0.5, offline: 0 },
  { name: 'Fri', productive: 6.8, idle: 1.2, offline: 0 },
  { name: 'Sat', productive: 2.5, idle: 0.5, offline: 5.0 },
  { name: 'Sun', productive: 1.0, idle: 0.2, offline: 6.8 },
];

export const ActivityChart = () => {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Weekly Activity Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="productive" stackId="a" fill="hsl(var(--productive))" name="Productive" />
            <Bar dataKey="idle" stackId="a" fill="hsl(var(--idle))" name="Idle" />
            <Bar dataKey="offline" stackId="a" fill="hsl(var(--inactive))" name="Offline" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};