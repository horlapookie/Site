import { Coins, Moon, Sun, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "./theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isAuthenticated?: boolean;
  coins?: number;
  username?: string;
  referralCode?: string;
  onSignOut?: () => void;
  onSignIn?: () => void;
  onClaimCoins?: () => void;
}

export function Header({ isAuthenticated = false, coins = 0, username = "User", referralCode, onSignOut, onSignIn, onClaimCoins }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <img 
            src="/eclipse-md-logo.jpg" 
            alt="Eclipse-MD Logo" 
            className="h-9 w-9 rounded-md object-cover"
          />
          <span className="text-xl font-bold">Eclipse-MD</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5" data-testid="text-coin-balance">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{coins}</span>
              <span className="text-xs text-muted-foreground">coins</span>
            </div>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {coins} coins available
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Your Referral Code</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={copyReferralLink}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block">
                    {referralCode || "XXXXXX"}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your link to earn bonus coins!
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClaimCoins} data-testid="button-claim-coins">
                  <Coins className="mr-2 h-4 w-4" />
                  Claim Coins
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")} data-testid="button-theme-toggle">
                  {theme === "light" ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} data-testid="button-signout">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={onSignIn} data-testid="button-signin">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
