
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Play, Square, Clock, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export function TrackingControls() {
  const { isTracking, trackingStartTime, startTracking, stopTracking, getSessionDuration } = useActivityTracker();
  const [currentDuration, setCurrentDuration] = useState(0);

  // Update duration every minute
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setCurrentDuration(getSessionDuration());
      }, 60000); // Update every minute

      // Initial update
      setCurrentDuration(getSessionDuration());

      return () => clearInterval(interval);
    }
  }, [isTracking, getSessionDuration]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Work Session Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <div>
              <p className="text-sm font-medium">
                Status: <Badge variant={isTracking ? "default" : "secondary"}>
                  {isTracking ? "Tracking Active" : "Not Tracking"}
                </Badge>
              </p>
              {trackingStartTime && (
                <p className="text-xs text-muted-foreground">
                  Started at {formatTime(trackingStartTime)}
                </p>
              )}
            </div>
          </div>
          
          {isTracking ? (
            <Button 
              onClick={stopTracking} 
              variant="destructive" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Stop Tracking</span>
            </Button>
          ) : (
            <Button 
              onClick={startTracking} 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Tracking</span>
            </Button>
          )}
        </div>

        {isTracking && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Session Duration:</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatDuration(currentDuration)}
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click "Start Tracking" to begin monitoring your work activities</p>
          <p>• Applications and websites will be tracked during active sessions</p>
          <p>• Time when tracking is stopped is considered break time</p>
          <p>• All data is stored securely and only visible to you and admins</p>
        </div>
      </CardContent>
    </Card>
  );
}
