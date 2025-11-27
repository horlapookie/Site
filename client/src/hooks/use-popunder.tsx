import { createContext, useContext, useEffect, useRef, useState } from "react";

interface PopunderContextType {
  triggerPopunder: () => void;
  isPopunderLoaded: boolean;
}

const PopunderContext = createContext<PopunderContextType | undefined>(undefined);

const POPUNDER_COOLDOWN = 1 * 60 * 1000;
const POPUNDER_SCRIPT = '//pl28115724.effectivegatecpm.com/9c/98/0b/9c980b396be0c48001d06b66f9a412ff.js';

export function PopunderProvider({ children }: { children: React.ReactNode }) {
  const [isPopunderLoaded, setIsPopunderLoaded] = useState(true);
  const lastTriggerTime = useRef<number>(0);

  const triggerPopunder = () => {
    const now = Date.now();
    const timeSinceLastTrigger = now - lastTriggerTime.current;

    if (timeSinceLastTrigger < POPUNDER_COOLDOWN) {
      return false;
    }

    lastTriggerTime.current = now;
    
    try {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = POPUNDER_SCRIPT;
      document.body.appendChild(script);
      return true;
    } catch (error) {
      console.error('Failed to load popunder script:', error);
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
