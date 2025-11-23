import { createContext, useContext, useEffect, useRef, useState } from "react";

interface PopunderContextType {
  triggerPopunder: () => void;
  isPopunderLoaded: boolean;
}

const PopunderContext = createContext<PopunderContextType | undefined>(undefined);

const POPUNDER_COOLDOWN = 1 * 60 * 1000; // 1 minute cooldown between popunders
const POPUNDER_SCRIPT_URL = '//pl28115724.effectivegatecpm.com/9c/98/0b/9c980b396be0c48001d06b66f9a412ff.js';

export function PopunderProvider({ children }: { children: React.ReactNode }) {
  const [isPopunderLoaded, setIsPopunderLoaded] = useState(false);
  const lastTriggerTime = useRef<number>(0);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = POPUNDER_SCRIPT_URL;
    script.async = true;
    
    script.onload = () => {
      setIsPopunderLoaded(true);
      console.log('Popunder script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load popunder script');
      setIsPopunderLoaded(false);
    };

    scriptRef.current = script;
    document.body.appendChild(script);

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  const triggerPopunder = () => {
    const now = Date.now();
    const timeSinceLastTrigger = now - lastTriggerTime.current;

    if (timeSinceLastTrigger < POPUNDER_COOLDOWN) {
      const remainingTime = Math.ceil((POPUNDER_COOLDOWN - timeSinceLastTrigger) / 1000 / 60);
      console.log(`Popunder on cooldown. Please wait ${remainingTime} more minute(s).`);
      return false;
    }

    lastTriggerTime.current = now;
    console.log('Popunder triggered - will open on next user click');
    
    // Trigger the popunder by opening the Adsterra direct link
    // This must be called during a real user interaction
    try {
      const popunderUrl = POPUNDER_SCRIPT_URL.replace('.js', '');
      window.open(popunderUrl, '_blank');
      console.log('Popunder window opened');
      return true;
    } catch (error) {
      console.error('Failed to open popunder:', error);
      return false;
    }
  };

  return (
    <PopunderContext.Provider value={{ triggerPopunder, isPopunderLoaded }}>
      {children}
    </PopunderContext.Provider>
  );
}

export function usePopunder() {
  const context = useContext(PopunderContext);
  if (context === undefined) {
    throw new Error('usePopunder must be used within a PopunderProvider');
  }
  return context;
}
