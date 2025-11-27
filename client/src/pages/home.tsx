import { Header } from "@/components/header";
import { useLocation } from "wouter";
import { PropellerBanner } from "@/components/propeller-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Terminal, Clock, Users, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} onSignIn={handleSignIn} />
      
      {/* Multi-color Animated Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDuration: '12s', animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6 inline-block">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-white">
                <Zap className="h-4 w-4" />
                <span>Lightning Fast Deployment</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Deploy Your WhatsApp Bot <span className="bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent">In Seconds</span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Eclipse-MD hosting platform makes it easy to deploy and manage your WhatsApp bots. No complex setup required — just configure and deploy.
            </p>

            <div className="flex gap-4 justify-center flex-wrap mb-12">
              <Button 
                size="lg" 
                onClick={() => setLocation("/signup")}
                className="bg-white text-purple-900 hover:bg-purple-50"
                data-testid="button-get-started"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleSignIn}
                className="border-white text-white hover:bg-white/10"
                data-testid="button-login-hero"
              >
                Sign In
              </Button>
            </div>

            <div className="flex justify-center mb-12">
              <PropellerBanner width={728} height={90} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-20 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Eclipse-MD?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to run powerful WhatsApp bots</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="border-purple-200/50 hover:border-purple-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy your bot in under 2 minutes with our streamlined process
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200/50 hover:border-blue-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your credentials are encrypted and stored securely
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-cyan-200/50 hover:border-cyan-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <Terminal className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your bot with live logs and deployment status
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200/50 hover:border-purple-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Uptime</h3>
                <p className="text-sm text-muted-foreground">
                  Your bots run continuously with auto-restart capabilities
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200/50 hover:border-blue-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands of users deploying their bots with us
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-cyan-200/50 hover:border-cyan-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Free Coins</h3>
                <p className="text-sm text-muted-foreground">
                  Earn free coins through tasks and referrals
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mb-12">
            <PropellerBanner width={300} height={250} />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">Join thousands of developers deploying bots with Eclipse-MD</p>
            <Button 
              size="lg"
              onClick={() => setLocation("/signup")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-testid="button-signup-cta"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg">
        <div className="container mx-auto p-2 flex items-center justify-center">
          <PropellerBanner width={728} height={90} />
        </div>
      </div>
    </div>
  );
}
