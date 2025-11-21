import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, User, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFirstName?: string;
  currentLastName?: string;
  autoMonitor?: number;
}

export function SettingsDialog({ 
  open, 
  onOpenChange, 
  currentFirstName = "", 
  currentLastName = "",
  autoMonitor = 0
}: SettingsDialogProps) {
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [autoMonitorEnabled, setAutoMonitorEnabled] = useState(autoMonitor === 1);
  const { toast } = useToast();

  useEffect(() => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
    setAutoMonitorEnabled(autoMonitor === 1);
  }, [currentFirstName, currentLastName, autoMonitor]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/auth/user/profile", {
        firstName,
        lastName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateAutoMonitorMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest("PATCH", "/api/auth/user/auto-monitor", {
        autoMonitor: enabled ? 1 : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Auto-monitor setting updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update auto-monitor",
        variant: "destructive",
      });
      setAutoMonitorEnabled(!autoMonitorEnabled);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleAutoMonitorToggle = (enabled: boolean) => {
    setAutoMonitorEnabled(enabled);
    updateAutoMonitorMutation.mutate(enabled);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account and bot monitoring settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="monitor" className="gap-2">
              <Shield className="h-4 w-4" />
              Bot Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 pt-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  data-testid="input-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  data-testid="input-lastname"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="auto-monitor" className="text-base font-medium">
                    Auto-Monitor Bots
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically restart your bots when they go offline
                  </p>
                </div>
                <Switch
                  id="auto-monitor"
                  checked={autoMonitorEnabled}
                  onCheckedChange={handleAutoMonitorToggle}
                  disabled={updateAutoMonitorMutation.isPending}
                  data-testid="switch-auto-monitor"
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> When enabled, the system will check your bots every 10 minutes and automatically restart any that are offline.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
