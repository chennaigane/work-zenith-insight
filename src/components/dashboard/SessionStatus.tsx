
import { Badge } from "@/components/ui/badge";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { Clock, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";

export function SessionStatus() {
  const { isTracking, getSessionDuration } = useActivityTracker();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setDuration(getSessionDuration());
      }, 60000); // Update every minute

      // Initial update
      setDuration(getSessionDuration());

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

  if (!isTracking) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Square className="h-3 w-3" />
        <span>Not Tracking</span>
      </Badge>
    );
  }

  return (
    <Badge className="flex items-center space-x-1 bg-green-500 hover:bg-green-600">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <Clock className="h-3 w-3" />
      <span>{formatDuration(duration)}</span>
    </Badge>
  );
}
