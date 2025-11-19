
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CoinClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimComplete: () => void;
}

export function CoinClaimDialog({ open, onOpenChange, onClaimComplete }: CoinClaimDialogProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimedCoins, setClaimedCoins] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [checking, setChecking] = useState(true);

  const TOTAL_COINS = 10;
  const CLAIM_DELAY = 3000; // 3 seconds per coin

  useEffect(() => {
    if (open) {
      checkClaimEligibility();
    }
  }, [open]);

  const checkClaimEligibility = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/coins/can-claim", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCanClaim(data.canClaim);
    } catch (error) {
      console.error("Error checking claim eligibility:", error);
      setCanClaim(false);
    } finally {
      setChecking(false);
    }
  };

  const startClaiming = async () => {
    if (claiming || claimedCoins >= TOTAL_COINS) return;
    
    setClaiming(true);
    
    // Claim all 10 coins with 3 second delay between each
    for (let i = 0; i < TOTAL_COINS; i++) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch("/api/coins/claim", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClaimedCoins(prev => prev + 1);
          onClaimComplete();
          
          // Close dialog if all coins claimed
          if (data.coinsRemaining === 0) {
            setTimeout(() => {
              onOpenChange(false);
              setClaimedCoins(0);
              setClaiming(false);
            }, 1000);
            return;
          }
          
          // Wait 3 seconds before claiming next coin
          if (i < TOTAL_COINS - 1) {
            await new Promise(resolve => setTimeout(resolve, CLAIM_DELAY));
          }
        } else {
          break;
        }
      } catch (error) {
        console.error("Error claiming coin:", error);
        break;
      }
    }
    
    setClaiming(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Daily Coin Claim
          </DialogTitle>
          <DialogDescription>
            Claim your daily coins (10 coins per day)
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !canClaim ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              You've already claimed your coins today. Come back in 24 hours!
            </p>
          </div>
        ) : claiming ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{claimedCoins} / {TOTAL_COINS}</p>
              <p className="text-sm text-muted-foreground">Coins claimed</p>
            </div>
            <Progress value={(claimedCoins / TOTAL_COINS) * 100} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Claiming coins...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{claimedCoins} / {TOTAL_COINS}</p>
              <p className="text-sm text-muted-foreground">Coins claimed</p>
            </div>
            <Progress value={(claimedCoins / TOTAL_COINS) * 100} className="h-2" />
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold">{TOTAL_COINS - claimedCoins}</p>
              <p className="text-sm text-muted-foreground">Coins remaining</p>
            </div>
            <Button 
              onClick={startClaiming} 
              className="w-full" 
              size="lg"
              disabled={claiming || claimedCoins >= TOTAL_COINS}
            >
              <Coins className="mr-2 h-4 w-4" />
              {claiming ? "Claiming..." : "Start Claiming Coins"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
