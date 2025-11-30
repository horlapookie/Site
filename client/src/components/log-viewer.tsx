import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Maximize2, Minimize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

interface LogViewerProps {
  botId: string;
  onClose?: () => void;
}

export function LogViewer({ botId, onClose }: LogViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: logsData } = useQuery<{ logs: string }>({
    queryKey: ["/api/bots", botId, "logs"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const logs = logsData?.logs || "";
  const logLines = logs.split("\n").filter((line: string) => line.trim());

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [autoScroll]);

  const getLogColor = (line: string) => {
    const lowerLine = line.toLowerCase();
    
    // Error patterns
    if (lowerLine.includes('error') || 
        lowerLine.includes('failed') || 
        lowerLine.includes('exception') ||
        lowerLine.includes('❌') ||
        lowerLine.includes('✗')) {
      return "text-red-600";
    }
    
    // Warning patterns
    if (lowerLine.includes('warn') || 
        lowerLine.includes('warning') ||
        lowerLine.includes('⚠')) {
      return "text-yellow-600";
    }
    
    // Success patterns
    if (lowerLine.includes('success') || 
        lowerLine.includes('completed') || 
        lowerLine.includes('connected') ||
        lowerLine.includes('✓') ||
        lowerLine.includes('✔')) {
      return "text-green-600";
    }
    
    // Info/Debug patterns
    if (lowerLine.includes('info') || 
        lowerLine.includes('debug')) {
      return "text-blue-600";
    }
    
    // Deployment/Starting patterns
    if (lowerLine.includes('deploy') || 
        lowerLine.includes('start') ||
        lowerLine.includes('running')) {
      return "text-cyan-600";
    }
    
    // Default color
    return "text-gray-700";
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
            <div className="bg-white p-4 font-mono text-sm">
              {logLines.length > 0 ? (
                logLines.map((line: string, index: number) => (
                  <div key={index} className={`mb-1 ${getLogColor(line)}`}>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400">No logs available yet...</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
