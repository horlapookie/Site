import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import { useLocation } from "wouter";
import { PropellerBanner } from "@/components/propeller-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Terminal, Clock, Users, Star } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header isAuthenticated={false} onSignIn={handleSignIn} />
      <HeroSection onGetStarted={handleSignIn} />
      
      <div className="container px-4 py-12 md:px-6">
        <div className="flex justify-center mb-12">
          <PropellerBanner width={728} height={90} />
        </div>
        
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Eclipse-MD?</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy your bot in under 2 minutes with our streamlined process
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your credentials are encrypted and stored securely
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your bot with live logs and deployment status
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Uptime</h3>
                <p className="text-sm text-muted-foreground">
                  Your bots run continuously with auto-restart capabilities
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands of users deploying their bots with us
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Free Coins</h3>
                <p className="text-sm text-muted-foreground">
                  Earn free coins through tasks and referrals
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <PropellerBanner width={300} height={250} />
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="container mx-auto p-2 flex items-center justify-center">
          <PropellerBanner width={728} height={90} />
        </div>
      </div>
    </div>
  );
}
