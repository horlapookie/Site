import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Play, Trash2, Circle } from "lucide-react";
import { format } from "date-fns";

interface BotCardProps {
  id: string;
  botNumber: string;
  status: "running" | "stopped" | "deploying";
  deployedAt: Date;
  onViewLogs?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  running: { label: "Running", color: "text-green-500", bg: "bg-green-500/10" },
  stopped: { label: "Stopped", color: "text-red-500", bg: "bg-red-500/10" },
  deploying: { label: "Deploying", color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

export function BotCard({ id, botNumber, status, deployedAt, onViewLogs, onRestart, onDelete }: BotCardProps) {
  const config = statusConfig[status];

  return (
    <Card className="hover-elevate" data-testid={`card-bot-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Circle className={`h-2 w-2 fill-current ${config.color}`} />
            <Badge variant="secondary" className={`${config.bg} ${config.color} border-0`}>
              {config.label}
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground" data-testid={`text-bot-number-${id}`}>
            +{botNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Deployed</p>
          <p className="text-sm font-medium">{format(deployedAt, "MMM d, yyyy")}</p>
          <p className="text-xs text-muted-foreground">{format(deployedAt, "h:mm a")}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">App Name</span>
            <span className="font-mono font-medium">eclipse-md-{id.slice(0, 6)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 flex-1"
          onClick={onViewLogs}
          data-testid={`button-view-logs-${id}`}
        >
          <Terminal className="h-4 w-4" />
          View Logs
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRestart}
          data-testid={`button-restart-${id}`}
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDelete}
          data-testid={`button-delete-${id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
