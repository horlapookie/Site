import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Trash2, RotateCw, Edit, Pause, Play, Upload } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Bot {
  _id: string;
  herokuAppName: string;
  botNumber: string;
  status: "running" | "stopped" | "deploying" | "failed";
  deployedAt: string;
  expiresAt?: string;
}

interface BotCardProps {
  bot: Bot;
  onViewLogs: (botId: string) => void;
  onRestart: (botId: string) => void;
  onDelete: (botId: string) => void;
  onEdit: (botId: string) => void;
  onPause?: (botId: string) => void;
  onResume?: (botId: string) => void;
  onAutoMonitorToggle?: () => void;
  onDeployLatest?: (botId: string) => void;
}

const statusConfig = {
  running: { label: "Running", variant: "default" as const, color: "bg-green-500" },
  stopped: { label: "Stopped", variant: "secondary" as const, color: "bg-gray-500" },
  deploying: { label: "Deploying", variant: "outline" as const, color: "bg-blue-500" },
  failed: { label: "Failed", variant: "destructive" as const, color: "bg-red-500" },
};

export function BotCard({ bot, onViewLogs, onRestart, onDelete, onEdit, onPause, onResume, onDeployLatest }: BotCardProps) {
  if (!bot || !bot.status) {
    return null;
  }
  
  const config = statusConfig[bot.status];
  const canEdit = bot.status === "running" || bot.status === "failed" || bot.status === "stopped";
  const canPause = bot.status === "running";
  const canResume = bot.status === "stopped";
  const canRestart = bot.status === "running" || bot.status === "failed";
  const canDeployLatest = bot.status === "running";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
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
          {bot.expiresAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Expires: {format(new Date(bot.expiresAt), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
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
          onClick={() => onEdit(bot._id)}
          disabled={!canEdit}
          data-testid={`button-edit-${bot._id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
        {canPause && onPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPause(bot._id)}
            data-testid={`button-pause-${bot._id}`}
          >
            <Pause className="w-4 h-4" />
          </Button>
        )}
        {canResume && onResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResume(bot._id)}
            data-testid={`button-resume-${bot._id}`}
          >
            <Play className="w-4 h-4" />
          </Button>
        )}
        {canDeployLatest && onDeployLatest && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeployLatest(bot._id)}
            title="Deploy Latest Commit (10 coins)"
            data-testid={`button-deploy-latest-${bot._id}`}
          >
            <Upload className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRestart(bot._id)}
          disabled={!canRestart}
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
