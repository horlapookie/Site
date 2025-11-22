import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {  Bell, Eye, MessageCircle, Send, Users, Video, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

const TASK_ICONS: Record<string, any> = {
  Bell,
  Eye,
  MessageCircle,
  Send,
  Users,
  Video,
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

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
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          completeTaskMutation.mutate(taskId);
        } else {
          toast({
            title: "Permission Denied",
            description: "Please allow notifications to complete this task",
            variant: "destructive",
          });
          setProcessingTaskId(null);
        }
      }
    } else if (link) {
      // Open link in new tab
      window.open(link, '_blank');
      // Wait a moment then allow claiming
      setTimeout(() => {
        completeTaskMutation.mutate(taskId);
      }, 3000);
    } else {
      completeTaskMutation.mutate(taskId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={true}
        coins={user?.coins || 0}
        username={user?.firstName || user?.email || "User"}
        referralCode={user?.referralCode}
        isAdmin={user?.isAdmin}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tasks & Rewards</h1>
          <p className="text-muted-foreground">
            Complete tasks to earn coins and unlock features
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks?.map((task: any) => {
              const IconComponent = TASK_ICONS[task.icon] || Bell;
              return (
                <Card key={task.id} className={task.completed ? "bg-muted/50" : ""} data-testid={`card-task-${task.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
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
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
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

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm font-semibold">
                          +{task.reward} Coins
                        </Badge>

                        {task.completed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        ) : task.canComplete ? (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTask(task.id, task.link)}
                            disabled={processingTaskId === task.id}
                            data-testid={`button-complete-${task.id}`}
                          >
                            {task.link && <ExternalLink className="mr-2 h-4 w-4" />}
                            {processingTaskId === task.id ? "Processing..." : "Complete"}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
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
      </main>
    </div>
  );
}
