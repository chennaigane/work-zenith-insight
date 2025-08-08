import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { CheckCircle, Clock } from "lucide-react";

export function ProductiveWebsites() {
  const { metrics, loading } = useProductivityMetrics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Productive Websites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const websiteData = metrics?.websiteUsage || [];
  const productiveWebsites = websiteData.filter(website => website.isProductive);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (productiveWebsites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Productive Websites</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">No productive website usage today</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Productive Websites</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productiveWebsites.map((website, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-sm">{website.domain}</p>
                  <p className="text-xs text-muted-foreground">{website.percentage}% of total time</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                <Clock className="h-4 w-4" />
                <span>{formatTime(website.time)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}