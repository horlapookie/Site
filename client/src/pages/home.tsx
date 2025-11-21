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
    <div className="min-h-screen bg-background pb-24">
      <Header isAuthenticated={false} onSignIn={handleSignIn} />
      <HeroSection onGetStarted={handleSignIn} />
      
      {/* Bottom Banner Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="container mx-auto p-2 flex items-center justify-center">
          <iframe
            src="https://rel-s.com/4/10218851"
            style={{
              width: '100%',
              maxWidth: '728px',
              height: '90px',
              border: 'none',
              display: 'block'
            }}
            scrolling="no"
            title="Advertisement"
          />
        </div>
      </div>
    </div>
  );
}
