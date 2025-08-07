import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const applications = [
  { name: "VS Code", time: "4h 32m", percentage: 85, icon: "💻" },
  { name: "Slack", time: "1h 15m", percentage: 23, icon: "💬" },
  { name: "Chrome", time: "2h 45m", percentage: 52, icon: "🌐" },
  { name: "Figma", time: "1h 48m", percentage: 34, icon: "🎨" },
  { name: "Terminal", time: "45m", percentage: 14, icon: "⌨️" },
];

export const ApplicationUsage = () => {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Top Applications Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.map((app, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{app.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.time}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{app.percentage}%</span>
            </div>
            <Progress 
              value={app.percentage} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};