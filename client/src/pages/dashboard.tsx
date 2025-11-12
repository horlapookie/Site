import { useState } from "react";
import { Header } from "@/components/header";
import { BotCard } from "@/components/bot-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [bots] = useState([
    {
      id: "abc123",
      botNumber: "2348028336218",
      status: "running" as const,
      deployedAt: new Date("2025-01-10T14:30:00"),
    },
    {
      id: "def456",
      botNumber: "2349012345678",
      status: "deploying" as const,
      deployedAt: new Date("2025-01-12T10:15:00"),
    },
  ]);

  const handleDeploy = () => {
    setLocation("/deploy");
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Deployments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor your Eclipse-MD bot deployments
            </p>
          </div>
          <Button onClick={handleDeploy} className="gap-2" data-testid="button-new-deployment">
            <Plus className="h-4 w-4" />
            New Deployment
          </Button>
        </div>

        {bots.length === 0 ? (
          <EmptyState onDeploy={handleDeploy} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                {...bot}
                onViewLogs={() => console.log("View logs", bot.id)}
                onRestart={() => console.log("Restart", bot.id)}
                onDelete={() => console.log("Delete", bot.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
