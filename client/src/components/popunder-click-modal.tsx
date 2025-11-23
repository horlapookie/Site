import { useState } from 'react';
import { usePopunder } from '@/hooks/use-popunder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PopunderClickModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function PopunderClickModal({ 
  open, 
  onOpenChange, 
  title = "Click to View Ad",
  description = "Click below to see an exclusive offer. You'll earn rewards for viewing!"
}: PopunderClickModalProps) {
  const { triggerPopunder } = usePopunder();
  const [isClicking, setIsClicking] = useState(false);

  const handleClickAd = () => {
    setIsClicking(true);
    triggerPopunder();
    // Close after a short delay
    setTimeout(() => {
      onOpenChange(false);
      setIsClicking(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-primary/10 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to view an ad and complete this task
            </p>
          </div>
          <Button
            onClick={handleClickAd}
            disabled={isClicking}
            size="lg"
            className="w-full"
            data-testid="button-click-popunder"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isClicking ? "Opening..." : "Click to View Ad"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-popunder"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
