
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck } from "lucide-react";

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFirstName?: string;
  currentLastName?: string;
  isAdmin?: boolean;
}

export function AccountSettingsDialog({ 
  open, 
  onOpenChange, 
  currentFirstName = "", 
  currentLastName = "",
  isAdmin = false
}: AccountSettingsDialogProps) {
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const { toast } = useToast();

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
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Account Settings
            {isAdmin && (
              <BadgeCheck className="h-5 w-5 text-blue-500" title="Verified Admin" />
            )}
          </DialogTitle>
          <DialogDescription>
            Update your account information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
