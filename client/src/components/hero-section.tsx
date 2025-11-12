import { Button } from "@/components/ui/button";
import { Zap, Shield, Terminal } from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container relative px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4" />
            <span>Get 10 free coins on signup</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Deploy Your WhatsApp Bot
            <span className="block text-muted-foreground">In Seconds</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Eclipse-MD hosting platform makes it easy to deploy and manage your WhatsApp bots. 
            No complex setup required — just configure and deploy.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" onClick={onGetStarted} data-testid="button-get-started">
              Get Started Free
              <Zap className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.open("https://github.com/horlapookie/Eclipse-MD", "_blank")}
              data-testid="button-view-docs"
            >
              View Documentation
            </Button>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Deploy your bot in under 2 minutes with our streamlined process
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Real-time Logs</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your bot with live logs and deployment status
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted and your bots run 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
