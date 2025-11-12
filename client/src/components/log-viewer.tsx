import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Maximize2, Minimize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LogViewerProps {
  botId: string;
  onClose?: () => void;
}

export function LogViewer({ botId, onClose }: LogViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockLogs = [
    { time: "2025-01-12 10:23:45", level: "INFO", message: "Starting Eclipse-MD bot..." },
    { time: "2025-01-12 10:23:46", level: "INFO", message: "Connecting to WhatsApp..." },
    { time: "2025-01-12 10:23:48", level: "SUCCESS", message: "Connected successfully" },
    { time: "2025-01-12 10:23:49", level: "INFO", message: "Loading plugins..." },
    { time: "2025-01-12 10:23:50", level: "INFO", message: "Loaded 45 plugins" },
    { time: "2025-01-12 10:23:51", level: "SUCCESS", message: "Bot is ready and running" },
    { time: "2025-01-12 10:24:15", level: "INFO", message: "Received message from +234..." },
  ];

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "text-red-400";
      case "SUCCESS":
        return "text-green-400";
      case "WARN":
        return "text-yellow-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <Card className={`${isFullscreen ? "h-full rounded-none border-0" : ""}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Bot Logs</CardTitle>
            <p className="text-sm font-mono text-muted-foreground">eclipse-md-{botId.slice(0, 6)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
                data-testid="switch-auto-scroll"
              />
              <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll</Label>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-download-logs">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              data-testid="button-toggle-fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-logs">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className={`${isFullscreen ? "h-[calc(100vh-8rem)]" : "h-96"}`} ref={scrollRef}>
            <div className="bg-black p-4 font-mono text-sm">
              {mockLogs.map((log, index) => (
                <div key={index} className="mb-1 flex gap-4 text-gray-300">
                  <span className="text-gray-500">{log.time}</span>
                  <span className={`font-semibold ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
