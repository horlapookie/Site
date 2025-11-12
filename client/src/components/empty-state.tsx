import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface EmptyStateProps {
  onDeploy?: () => void;
}

export function EmptyState({ onDeploy }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Rocket className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No bots deployed yet</h3>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Get started by deploying your first Eclipse-MD bot. It only takes a few minutes!
      </p>
      <Button onClick={onDeploy} data-testid="button-deploy-first">
        Deploy Your First Bot
      </Button>
    </div>
  );
}
