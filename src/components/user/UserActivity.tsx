import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, Activity } from 'lucide-react';

interface TeamActivity {
  id: string;
  activity_type: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function UserActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: '',
    description: '',
    status: 'active'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!newActivity.activity_type.trim()) {
      toast({
        title: "Error",
        description: "Activity type is required",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('team_activities')
        .insert({
          user_id: user?.id,
          activity_type: newActivity.activity_type,
          description: newActivity.description || null,
          status: newActivity.status
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity added successfully",
      });

      setNewActivity({ activity_type: '', description: '', status: 'active' });
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const updateActivityStatus = async (activityId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('team_activities')
        .update({ status })
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchActivities();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'away': return 'secondary';
      case 'busy': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Activity type (e.g., Meeting, Development, Review)"
              value={newActivity.activity_type}
              onChange={(e) => setNewActivity(prev => ({ ...prev, activity_type: e.target.value }))}
            />
            <Select 
              value={newActivity.status} 
              onValueChange={(value) => setNewActivity(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={newActivity.description}
            onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <Button onClick={addActivity} disabled={adding}>
            {adding ? 'Adding...' : 'Add Activity'}
          </Button>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>My Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found. Add your first activity above!
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{activity.activity_type}</h3>
                        <Badge 
                          variant={getStatusVariant(activity.status)}
                          className="capitalize"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Created {formatTime(activity.created_at)}</span>
                        </div>
                        {activity.updated_at !== activity.created_at && (
                          <div className="flex items-center space-x-1">
                            <span>Updated {formatTime(activity.updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Select 
                        value={activity.status} 
                        onValueChange={(value) => updateActivityStatus(activity.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}