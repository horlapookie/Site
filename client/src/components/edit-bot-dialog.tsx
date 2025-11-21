import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Bot {
  _id: string;
  botNumber: string;
  sessionData: string;
  prefix: string;
  openaiKey?: string;
  geminiKey?: string;
  autoViewMessage: boolean;
  autoViewStatus: boolean;
  autoReactStatus: boolean;
  autoReact: boolean;
  autoTyping: boolean;
  autoRecording: boolean;
}

interface EditBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: Bot | null;
}

export function EditBotDialog({ open, onOpenChange, bot }: EditBotDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    botNumber: "",
    sessionData: "",
    prefix: ".",
    openaiKey: "",
    geminiKey: "",
    autoViewMessage: false,
    autoViewStatus: false,
    autoReactStatus: false,
    autoReact: false,
    autoTyping: false,
    autoRecording: false,
  });

  useEffect(() => {
    if (bot) {
      setFormData({
        botNumber: bot.botNumber || "",
        sessionData: bot.sessionData || "",
        prefix: bot.prefix || ".",
        openaiKey: bot.openaiKey || "",
        geminiKey: bot.geminiKey || "",
        autoViewMessage: bot.autoViewMessage || false,
        autoViewStatus: bot.autoViewStatus || false,
        autoReactStatus: bot.autoReactStatus || false,
        autoReact: bot.autoReact || false,
        autoTyping: bot.autoTyping || false,
        autoRecording: bot.autoRecording || false,
      });
    }
  }, [bot]);

  const updateBotMutation = useMutation({
    mutationFn: async () => {
      if (!bot) throw new Error("No bot selected");
      return await apiRequest("PATCH", `/api/bots/${bot._id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Success",
        description: "Bot updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bot",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBotMutation.mutate();
  };

  if (!bot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Bot Configuration
          </DialogTitle>
          <DialogDescription>
            Update your bot settings. The bot will restart with the new configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="botNumber">WhatsApp Number</Label>
            <Input
              id="botNumber"
              value={formData.botNumber}
              onChange={(e) => setFormData({ ...formData, botNumber: e.target.value })}
              placeholder="e.g., 2348000000000"
              required
              data-testid="input-edit-bot-number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionData">Session Data</Label>
            <Textarea
              id="sessionData"
              value={formData.sessionData}
              onChange={(e) => setFormData({ ...formData, sessionData: e.target.value })}
              placeholder="Paste your session ID here"
              rows={4}
              required
              data-testid="input-edit-session"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Bot Prefix</Label>
            <Input
              id="prefix"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              placeholder="."
              data-testid="input-edit-prefix"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key (Optional)</Label>
              <Input
                id="openaiKey"
                type="password"
                value={formData.openaiKey}
                onChange={(e) => setFormData({ ...formData, openaiKey: e.target.value })}
                placeholder="sk-..."
                data-testid="input-edit-openai"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="geminiKey">Gemini API Key (Optional)</Label>
              <Input
                id="geminiKey"
                type="password"
                value={formData.geminiKey}
                onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                placeholder="AIza..."
                data-testid="input-edit-gemini"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-base">Auto Features</Label>
            <div className="space-y-3">
              {[
                { key: "autoViewMessage", label: "Auto View Messages" },
                { key: "autoViewStatus", label: "Auto View Status" },
                { key: "autoReactStatus", label: "Auto React to Status" },
                { key: "autoReact", label: "Auto React to Messages" },
                { key: "autoTyping", label: "Auto Typing Indicator" },
                { key: "autoRecording", label: "Auto Recording Indicator" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label htmlFor={item.key} className="cursor-pointer">
                    {item.label}
                  </Label>
                  <Switch
                    id={item.key}
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [item.key]: checked })
                    }
                    data-testid={`switch-edit-${item.key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateBotMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateBotMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
