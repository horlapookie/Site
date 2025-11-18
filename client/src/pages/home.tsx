import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} onSignIn={handleSignIn} />
      <HeroSection onGetStarted={handleSignIn} />
    </div>
  );
}
