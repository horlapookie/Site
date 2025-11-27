import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, type User } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Eye, MessageCircle, Send, Users, Video, CheckCircle2, Loader2, ExternalLink, AlertCircle, GitFork } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PropellerBanner, PopunderWrapper } from "@/components/propeller-banner";
import { SubscribeBanner } from "@/components/subscribe-banner";
import { useCumulativePopunder } from "@/hooks/useCumulativePopunder";

const TASK_ICONS: Record<string, any> = {
  Bell,
  Eye,
  MessageCircle,
  Send,
  Users,
  Video,
  GitFork,
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [viewedTasks, setViewedTasks] = useState<Set<string>>(new Set());
  const [notificationBlocked, setNotificationBlocked] = useState(false);

  useCumulativePopunder();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const toggleViewTask = (taskId: string) => {
    const newViewed = new Set(viewedTasks);
    if (newViewed.has(taskId)) {
      newViewed.delete(taskId);
    } else {
      newViewed.add(taskId);
    }
    setViewedTasks(newViewed);
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest("POST", `/api/tasks/${taskId}/complete`, {});
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setProcessingTaskId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
      setProcessingTaskId(null);
    },
  });

  const handleCompleteTask = async (taskId: string, link?: string) => {
    setProcessingTaskId(taskId);
    
    if (taskId === 'notification_permission') {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationBlocked(false);
            completeTaskMutation.mutate(taskId);
          } else if (permission === 'denied') {
            setNotificationBlocked(true);
            toast({
              title: "Notifications Blocked",
              description: "Notifications are blocked in your browser. Please enable them in your browser settings to complete this task.",
              variant: "destructive",
            });
            setProcessingTaskId(null);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to request notification permission",
            variant: "destructive",
          });
          setProcessingTaskId(null);
        }
      }
    } else if (taskId === 'view_ads_daily' || taskId === 'watch_5_ads' || taskId === 'watch_10_ads') {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl28115724.effectivegatecpm.com/9c/98/0b/9c980b396be0c48001d06b66f9a412ff.js';
      document.body.appendChild(script);
      
      toast({
        title: "Watch Ad",
        description: "Please watch the ad for 8 seconds to earn coins",
      });
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 8000);
    } else if (link) {
      window.open(link, '_blank');
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 3000);
    } else {
      completeTaskMutation.mutate(taskId);
    }
  };

  return (
    <PopunderWrapper className="min-h-screen bg-background">
      <Header
        isAuthenticated={true}
        coins={(user as User | null)?.coins || 0}
        username={(user as User | null)?.firstName || (user as User | null)?.email || "User"}
        referralCode={(user as User | null)?.referralCode}
        isAdmin={(user as User | null)?.isAdmin}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tasks & Rewards</h1>
          <p className="text-muted-foreground">
            Complete tasks to earn coins and unlock features
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <PropellerBanner width={728} height={90} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(tasks as any[])?.map((task: any) => {
              const IconComponent = TASK_ICONS[task.icon] || Bell;
              const isNotificationTask = task.id === 'notification_permission';
              
              return (
                <Card key={task.id} className={task.completed ? "bg-muted/50" : ""} data-testid={`card-task-${task.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {task.description}
                          </CardDescription>
                        </div>
                      </div>
                      {task.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {task.dailyLimit && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Daily Progress</span>
                            <span className="font-medium">
                              {task.dailyProgress || 0} / {task.dailyLimit}
                            </span>
                          </div>
                          <Progress
                            value={((task.dailyProgress || 0) / task.dailyLimit) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      {notificationBlocked && isNotificationTask && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Notifications are blocked. Please enable notifications in your browser settings (usually in the address bar icon menu) and try again.
                          </AlertDescription>
                        </Alert>
                      )}


                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-sm font-semibold">
                          +{task.reward} Coins
                        </Badge>

                        {task.completed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        ) : task.canComplete ? (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant={viewedTasks.has(task.id) ? "default" : "outline"}
                              onClick={() => toggleViewTask(task.id)}
                              data-testid={`button-view-${task.id}`}
                              data-no-popunder
                            >
                              {viewedTasks.has(task.id) ? "Close" : "View Task"}
                            </Button>
                            {viewedTasks.has(task.id) && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteTask(task.id, task.link)}
                                disabled={processingTaskId === task.id}
                                data-testid={`button-complete-${task.id}`}
                                data-no-popunder
                              >
                                {task.link && <ExternalLink className="mr-2 h-4 w-4" />}
                                {processingTaskId === task.id ? "Processing..." : "Complete"}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" disabled data-no-popunder>
                            Not Available
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <PropellerBanner width={300} height={250} />
        </div>
      </main>

      <SubscribeBanner />
    </PopunderWrapper>
  );
}
