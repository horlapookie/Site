import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { BotCard } from "@/components/bot-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { LogViewer } from "@/components/log-viewer";
import { CoinClaimDialog } from "@/components/coin-claim-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedBotForLogs, setSelectedBotForLogs] = useState<string | null>(null);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const { data: bots = [], isLoading: isLoadingBots } = useQuery<any[]>({
    queryKey: ["/api/bots"],
  });

  const restartMutation = useMutation({
    mutationFn: async (botId: string) => {
      await apiRequest("POST", `/api/bots/${botId}/restart`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot restarted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to restart bot",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (botId: string) => {
      await apiRequest("DELETE", `/api/bots/${botId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setBotToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete bot",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = () => {
    setLocation("/deploy");
  };

  const handleSignOut = async () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('auth_token');
    // Invalidate and reset the auth query immediately
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    await queryClient.resetQueries({ queryKey: ["/api/auth/user"] });
    // Clear all cached data
    queryClient.clear();
    // Force a hard redirect to login page
    window.location.href = "/login";
  };

  const handleClaimCoins = () => {
    setShowClaimDialog(true);
  };

  const handleClaimComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    toast({
      title: "Success",
      description: "Coins claimed successfully!",
    });
  };

  if (isLoading || isLoadingBots) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={true}
        coins={user?.coins ?? 0}
        username={user?.firstName ?? "User"}
        referralCode={user?.referralCode}
        onSignOut={handleSignOut}
        onClaimCoins={() => setShowClaimDialog(true)}
      />

      <CoinClaimDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        onClaimComplete={handleClaimComplete}
      />

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Deployments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor your Eclipse-MD bot deployments
            </p>
          </div>
          <Button onClick={handleDeploy} className="gap-2" data-testid="button-new-deployment">
            <Plus className="h-4 w-4" />
            New Deployment
          </Button>
        </div>

        {bots.length === 0 ? (
          <EmptyState onDeploy={handleDeploy} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bots.filter((bot: any) => bot && bot._id).map((bot: any) => (
              <BotCard
                key={bot._id}
                bot={bot}
                onViewLogs={() => setSelectedBotForLogs(bot._id)}
                onRestart={() => restartMutation.mutate(bot._id)}
                onDelete={() => setBotToDelete(bot._id)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedBotForLogs && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4 md:p-6">
          <LogViewer
            botId={selectedBotForLogs}
            onClose={() => setSelectedBotForLogs(null)}
          />
        </div>
      )}

      <AlertDialog open={!!botToDelete} onOpenChange={() => setBotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot Deployment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bot deployment? This will permanently remove
              the bot from Heroku and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => botToDelete && deleteMutation.mutate(botToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}