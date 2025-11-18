
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Power, Trash2, RotateCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Bot {
  _id: string;
  herokuAppName: string;
  botNumber: string;
  status: "running" | "stopped" | "deploying" | "failed";
  deployedAt: string;
}

interface BotCardProps {
  bot: Bot;
  onViewLogs: (botId: string) => void;
  onRestart: (botId: string) => void;
  onDelete: (botId: string) => void;
}

const statusConfig = {
  running: { label: "Running", variant: "default" as const, color: "bg-green-500" },
  stopped: { label: "Stopped", variant: "secondary" as const, color: "bg-gray-500" },
  deploying: { label: "Deploying", variant: "outline" as const, color: "bg-blue-500" },
  failed: { label: "Failed", variant: "destructive" as const, color: "bg-red-500" },
};

export function BotCard({ bot, onViewLogs, onRestart, onDelete }: BotCardProps) {
  if (!bot || !bot.status) {
    return null;
  }
  
  const config = statusConfig[bot.status];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-mono text-lg font-semibold">{bot.herokuAppName}</h3>
            <Badge variant={config.variant}>
              <span className={`inline-block w-2 h-2 rounded-full ${config.color} mr-1`} />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Number: {bot.botNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Deployed {formatDistanceToNow(new Date(bot.deployedAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewLogs(bot._id)}
          className="flex-1"
          data-testid={`button-view-logs-${bot._id}`}
        >
          <Terminal className="w-4 h-4 mr-2" />
          View Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRestart(bot._id)}
          disabled={bot.status !== "running"}
          data-testid={`button-restart-${bot._id}`}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(bot._id)}
          className="text-destructive"
          data-testid={`button-delete-${bot._id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
