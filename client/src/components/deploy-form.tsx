import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExternalLink, ChevronDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DeployFormProps {
  onDeploy?: (config: any) => void;
  isDeploying?: boolean;
}

export function DeployForm({ onDeploy, isDeploying = false }: DeployFormProps) {
  const [optionalOpen, setOptionalOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Deploy triggered with config:", formData);
    onDeploy?.(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Deploy New Bot</CardTitle>
          <CardDescription>
            Configure your Eclipse-MD bot deployment. Fill in the required fields below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionData">Session ID *</Label>
                <a
                  href="https://eclipse-session.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                  data-testid="link-session-help"
                >
                  Need help getting session ID?
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Input
                id="sessionData"
                placeholder="Enter your session ID"
                className="font-mono text-sm"
                value={formData.sessionData}
                onChange={(e) => setFormData({ ...formData, sessionData: e.target.value })}
                required
                data-testid="input-session-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="botNumber">WhatsApp Number *</Label>
              <Input
                id="botNumber"
                placeholder="e.g., 2348028336218"
                className="font-mono"
                value={formData.botNumber}
                onChange={(e) => setFormData({ ...formData, botNumber: e.target.value })}
                required
                data-testid="input-bot-number"
              />
              <p className="text-xs text-muted-foreground">
                Your WhatsApp number without + or country code prefix
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefix">Command Prefix</Label>
              <Input
                id="prefix"
                placeholder="."
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                data-testid="input-prefix"
              />
              <p className="text-xs text-muted-foreground">
                Default is "." (dot)
              </p>
            </div>
          </div>

          <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                type="button"
                data-testid="button-toggle-optional"
              >
                Optional Features
                <ChevronDown className={`h-4 w-4 transition-transform ${optionalOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <Input
                  id="openaiKey"
                  type="password"
                  placeholder="sk-..."
                  className="font-mono text-sm"
                  value={formData.openaiKey}
                  onChange={(e) => setFormData({ ...formData, openaiKey: e.target.value })}
                  data-testid="input-openai-key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geminiKey">Gemini API Key</Label>
                <Input
                  id="geminiKey"
                  type="password"
                  placeholder="..."
                  className="font-mono text-sm"
                  value={formData.geminiKey}
                  onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                  data-testid="input-gemini-key"
                />
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-sm font-medium">Auto Features</h4>
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
                      <Label htmlFor={item.key} className="text-sm font-normal">
                        {item.label}
                      </Label>
                      <Switch
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, [item.key]: checked })
                        }
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium">Deployment Cost</p>
              <p className="text-xs text-muted-foreground">One-time charge</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">10</p>
              <p className="text-xs text-muted-foreground">coins</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={isDeploying}
            data-testid="button-deploy"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              "Deploy Bot"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
