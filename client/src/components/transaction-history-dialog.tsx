import { useQuery } from "@tanstack/react-query";
import { History, ArrowUpRight, ArrowDownRight, Coins, Minus, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Transaction {
  id: string;
  type: "claim" | "transfer_sent" | "transfer_received" | "deduction" | "refund" | "referral_bonus";
  amount: number;
  description: string;
  relatedEmail?: string;
  balanceAfter: number;
  createdAt: string;
}

export function TransactionHistoryDialog({
  open,
  onOpenChange,
}: TransactionHistoryDialogProps) {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: open,
  });

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "claim":
        return <Coins className="h-4 w-4 text-green-600" />;
      case "transfer_sent":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "transfer_received":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "deduction":
        return <Minus className="h-4 w-4 text-orange-600" />;
      case "referral_bonus":
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </DialogTitle>
          <DialogDescription>
            View all your coin transactions and account activity.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No transactions yet
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="mt-0.5">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {transaction.description}
                        </p>
                        {transaction.relatedEmail && (
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.relatedEmail}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(transaction.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p
                          className={`text-sm font-semibold ${getTransactionColor(
                            transaction.amount
                          )}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Balance: {transaction.balanceAfter}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
