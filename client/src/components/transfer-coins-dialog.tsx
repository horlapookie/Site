import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferComplete?: () => void;
}

export function TransferCoinsDialog({
  open,
  onOpenChange,
  onTransferComplete,
}: TransferCoinsDialogProps) {
  const { toast } = useToast();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");

  const transferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/coins/transfer", {
        recipientEmail,
        amount: parseInt(amount),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      setRecipientEmail("");
      setAmount("");
      onOpenChange(false);
      onTransferComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer coins",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and amount",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Transfer Coins
          </DialogTitle>
          <DialogDescription>
            Send coins to another user by entering their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={transferMutation.isPending}
              data-testid="input-recipient-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={transferMutation.isPending}
              data-testid="input-transfer-amount"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={transferMutation.isPending}
              className="flex-1"
              data-testid="button-cancel-transfer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transferMutation.isPending}
              className="flex-1"
              data-testid="button-confirm-transfer"
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
