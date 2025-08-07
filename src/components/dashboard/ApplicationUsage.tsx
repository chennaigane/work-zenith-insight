import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";

export const ApplicationUsage = () => {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Top Applications Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-2 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const applications = metrics?.applicationUsage || [];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAppIcon = (appName: string) => {
    const name = appName.toLowerCase();
    if (name.includes('code') || name.includes('visual')) return "💻";
    if (name.includes('slack') || name.includes('teams')) return "💬";
    if (name.includes('chrome') || name.includes('firefox') || name.includes('browser')) return "🌐";
    if (name.includes('figma') || name.includes('photoshop')) return "🎨";
    if (name.includes('terminal') || name.includes('cmd')) return "⌨️";
    if (name.includes('excel') || name.includes('word')) return "📊";
    return "📱";
  };
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Top Applications Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No application usage data for today
          </div>
        ) : (
          applications.map((app, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getAppIcon(app.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(app.time)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{app.percentage}%</span>
                  {app.isProductive && (
                    <div className="text-xs text-success">Productive</div>
                  )}
                </div>
              </div>
              <Progress 
                value={app.percentage} 
                className="h-2"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};