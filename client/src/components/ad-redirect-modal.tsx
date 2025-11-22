import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface AdRedirectModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  adUrl?: string;
}

export function AdRedirectModal({ open, onClose, onComplete, adUrl = 'https://propush.io' }: AdRedirectModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [pageVisibilityChecked, setPageVisibilityChecked] = useState(false);
  const windowRef = useRef<Window | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef<(event: Event) => void>(() => {});

  useEffect(() => {
    if (!open) {
      setTimeRemaining(10);
      setPageVisibilityChecked(false);
      setIsWindowOpen(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close();
      }
      return;
    }

    // Open the ad URL in a new window
    windowRef.current = window.open(adUrl, 'ad_window', 'width=800,height=600');
    setIsWindowOpen(true);

    // Set up visibility change listener to detect when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setPageVisibilityChecked(true);
        document.removeEventListener('visibilitychange', visibilityRef.current);
      }
    };

    visibilityRef.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also check if window lost focus (user clicked ad window)
    const handleFocus = () => {
      setPageVisibilityChecked(true);
    };

    window.addEventListener('focus', handleFocus);

    // Start countdown timer
    let seconds = 10;
    setTimeRemaining(10);

    timerRef.current = setInterval(() => {
      seconds--;
      setTimeRemaining(seconds);

      // If time is up and user has visited the ad, complete
      if (seconds <= 0 && pageVisibilityChecked) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete();
        onClose();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close();
      }
    };
  }, [open, onComplete, onClose, adUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="ad-redirect-modal">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Visit Ad Page</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Visit the ad page that just opened and spend {10} seconds there to earn coins.
            </p>
          </div>

          {!isWindowOpen && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Please allow pop-ups if the ad window didn't open automatically. Click "Open Ad Page" below.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {isWindowOpen && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {pageVisibilityChecked ? 'Waiting for timer...' : 'Spend time on the ad page...'}
                </p>
                <div className="text-3xl font-bold text-primary">
                  {timeRemaining}s
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {pageVisibilityChecked ? 'Return to this page complete the task' : 'Visit the ad page to continue'}
                </p>
              </div>
            )}

            {!isWindowOpen && (
              <Button 
                onClick={() => {
                  windowRef.current = window.open(adUrl, 'ad_window', 'width=800,height=600');
                  setIsWindowOpen(true);
                }}
                className="w-full"
                data-testid="button-open-ad-page"
              >
                Open Ad Page
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              disabled={isWindowOpen && !pageVisibilityChecked}
              className="w-full"
              data-testid="button-close-ad-modal"
            >
              Close
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Make sure to keep the ad window open or return to this page to complete the task.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
