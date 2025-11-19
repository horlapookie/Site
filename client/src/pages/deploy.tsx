import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { DeployForm } from "@/components/deploy-form";
import { CoinClaimDialog } from "@/components/coin-claim-dialog";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Deploy() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const deployMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest("POST", "/api/bots", config);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot deployment started! It may take a few minutes to complete.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to deploy bot",
        variant: "destructive",
      });
    },
  });

  const handleSignOut = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('auth_token');
    // Clear React Query cache
    queryClient.clear();
    // Redirect to login page
    setLocation("/login");
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

  if (isLoading) {
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
        coins={user?.coins || 0}
        username={user?.firstName || user?.email || "User"}
        onSignOut={handleSignOut}
        onClaimCoins={handleClaimCoins}
      />

      <CoinClaimDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        onClaimComplete={handleClaimComplete}
      />

      <main className="container px-4 py-8 md:px-6">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Deploy New Bot</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure and deploy your Eclipse-MD WhatsApp bot instance
            </p>
          </div>

          <DeployForm
            onDeploy={(config) => deployMutation.mutate(config)}
            isDeploying={deployMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}
