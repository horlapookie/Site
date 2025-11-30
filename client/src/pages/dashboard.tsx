import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { BotCard } from "@/components/bot-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth, type User } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { LogViewer } from "@/components/log-viewer";
import { CoinClaimDialog } from "@/components/coin-claim-dialog";
import { TransferCoinsDialog } from "@/components/transfer-coins-dialog";
import { TransactionHistoryDialog } from "@/components/transaction-history-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { Footer } from "@/components/footer";
import { EditBotDialog } from "@/components/edit-bot-dialog";
import { FullscreenAdModal } from "@/components/fullscreen-ad-modal";
import { PropellerBanner, PopunderWrapper } from "@/components/propeller-banner";
import { SubscribeBanner } from "@/components/subscribe-banner";
import { useCumulativePopunder } from "@/hooks/useCumulativePopunder";
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
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedBot, setSelectedBot] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showDashboardAd, setShowDashboardAd] = useState(false);
  const [showDeleteFailedDialog, setShowDeleteFailedDialog] = useState(false);

  useCumulativePopunder();

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

  const pauseMutation = useMutation({
    mutationFn: async (botId: string) => {
      await apiRequest("POST", `/api/bots/${botId}/pause`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot paused successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to pause bot",
        variant: "destructive",
      });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async (botId: string) => {
      await apiRequest("POST", `/api/bots/${botId}/resume`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot resumed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to resume bot",
        variant: "destructive",
      });
    },
  });

  const deployLatestMutation = useMutation({
    mutationFn: async (botId: string) => {
      await apiRequest("POST", `/api/bots/${botId}/deploy-latest`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deploy latest commit started (10 coins deducted)",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to deploy latest commit",
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

  const deleteAllFailedMutation = useMutation({
    mutationFn: async () => {
      const failedBots = bots.filter((bot: any) => bot.status === "failed");
      for (const bot of failedBots) {
        await apiRequest("DELETE", `/api/bots/${bot._id}`);
      }
    },
    onSuccess: () => {
      const failedCount = bots.filter((bot: any) => bot.status === "failed").length;
      toast({
        title: "Success",
        description: `Deleted ${failedCount} failed bot${failedCount !== 1 ? 's' : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowDeleteFailedDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete bot",
        variant: "destructive",
      });
    },
  });


  const enableAutoMonitorMutation = useMutation({
    mutationFn: async ({ botId, enable }: { botId: string; enable: boolean }) => {
      const response = await apiRequest("POST", `/api/bots/${botId}/auto-monitor`, { enable });
      return response;
    },
    onSuccess: (data, variables) => {
      const action = variables.enable ? "enabled" : "disabled";
      toast({
        title: "Success",
        description: `Auto-monitor ${action} successfully. This is a FREE service!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update auto-monitor setting",
        variant: "destructive",
      });
    },
  });


  const handleDeploy = () => {
    setLocation("/deploy");
  };

  const handleSignOut = async () => {
    localStorage.removeItem('auth_token');
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    await queryClient.resetQueries({ queryKey: ["/api/auth/user"] });
    queryClient.clear();
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

  const handleTransferComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };

  const handleViewLogs = (botId: string) => {
    setSelectedBotForLogs(botId);
  };

  const handleDelete = (botId: string) => {
    setBotToDelete(botId);
  };

  const handleEdit = (botId: string) => {
    const bot = bots?.find((b: any) => b._id === botId);
    if (bot) {
      setSelectedBot(bot);
      setEditDialogOpen(true);
    }
  };

  const handleAutoMonitorToggle = async (botId: string, currentStatus: boolean) => {
    await enableAutoMonitorMutation.mutateAsync({ botId, enable: !currentStatus });
  };

  const [confirmDeployBotId, setConfirmDeployBotId] = useState<string | null>(null);

  const handleDeployLatest = async (botId: string) => {
    setConfirmDeployBotId(botId);
  };

  const confirmDeployLatest = async () => {
    if (confirmDeployBotId) {
      await deployLatestMutation.mutateAsync(confirmDeployBotId);
      setConfirmDeployBotId(null);
    }
  };

  if (isLoading || isLoadingBots) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PopunderWrapper className="min-h-screen bg-background">
      <Header
        isAuthenticated={true}
        coins={(user as User | null)?.coins ?? 0}
        username={(user as User | null)?.firstName ?? "User"}
        referralCode={(user as User | null)?.referralCode}
        isAdmin={(user as User | null)?.isAdmin}
        onSignOut={handleSignOut}
        onClaimCoins={() => setShowClaimDialog(true)}
        onTransferCoins={() => setShowTransferDialog(true)}
        onViewHistory={() => setShowHistoryDialog(true)}
        onSettings={() => setShowSettingsDialog(true)}
      />

      <CoinClaimDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        onClaimComplete={handleClaimComplete}
      />

      <TransferCoinsDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        onTransferComplete={handleTransferComplete}
      />

      <TransactionHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
      />

      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        currentFirstName={(user as User | null)?.firstName}
        currentLastName={(user as User | null)?.lastName}
        autoMonitor={(user as User | null)?.autoMonitor}
      />

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Deployments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor your Eclipse-MD bot deployments
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleDeploy} className="gap-2" data-testid="button-new-deployment" data-no-popunder>
              <Plus className="h-4 w-4" />
              New Deployment
            </Button>
            {bots.some((bot: any) => bot.status === "failed") && (
              <Button 
                onClick={() => setShowDeleteFailedDialog(true)}
                variant="destructive"
                className="gap-2"
                data-testid="button-delete-failed"
                data-no-popunder
              >
                <Trash2 className="h-4 w-4" />
                Delete Failed
              </Button>
            )}
          </div>
        </div>


        {bots.length === 0 ? (
          <EmptyState onDeploy={handleDeploy} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bots.filter((bot: any) => bot && bot._id).map((bot: any) => (
              <BotCard
                key={bot._id}
                bot={bot}
                onViewLogs={() => handleViewLogs(bot._id)}
                onRestart={() => restartMutation.mutate(bot._id)}
                onDelete={() => handleDelete(bot._id)}
                onEdit={handleEdit}
                onPause={() => pauseMutation.mutate(bot._id)}
                onResume={() => resumeMutation.mutate(bot._id)}
                onAutoMonitorToggle={() => handleAutoMonitorToggle(bot._id, bot.autoMonitor)}
                onDeployLatest={handleDeployLatest}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedBotForLogs && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4 md:p-6">
          <LogViewer
            botId={selectedBotForLogs}
            onClose={() => setSelectedBotForLogs(null)}
          />
        </div>
      )}

      <AlertDialog open={!!confirmDeployBotId} onOpenChange={() => setConfirmDeployBotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy Latest Commit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will redeploy your bot with the latest commit from your repository. This costs 10 coins.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeployLatest}>
              Deploy (10 coins)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogCancel data-no-popunder>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => botToDelete && deleteMutation.mutate(botToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-no-popunder
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteFailedDialog} onOpenChange={setShowDeleteFailedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Failed Deployments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all failed bot deployments? This will permanently remove
              all failed bots from Heroku and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-no-popunder>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllFailedMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-no-popunder
              disabled={deleteAllFailedMutation.isPending}
            >
              {deleteAllFailedMutation.isPending ? "Deleting..." : "Delete All Failed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditBotDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        bot={selectedBot}
      />


      <SubscribeBanner />
    </PopunderWrapper>
  );
}
