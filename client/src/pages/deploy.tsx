import { useState } from "react";
import { Header } from "@/components/header";
import { DeployForm } from "@/components/deploy-form";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Deploy() {
  const [, setLocation] = useLocation();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = (config: any) => {
    setIsDeploying(true);
    console.log("Deploying with config:", config);
    setTimeout(() => {
      setIsDeploying(false);
      setLocation("/dashboard");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={true} 
        coins={10} 
        username="johndoe"
        onSignOut={() => console.log("Sign out")}
      />
      
      <main className="container px-4 py-8 md:px-6">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Deploy New Bot</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure and deploy your Eclipse-MD WhatsApp bot instance
            </p>
          </div>

          <DeployForm onDeploy={handleDeploy} isDeploying={isDeploying} />
        </div>
      </main>
    </div>
  );
}
