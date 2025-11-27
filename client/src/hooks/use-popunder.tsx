import { createContext, useContext, useEffect, useRef, useState } from "react";

interface PopunderContextType {
  triggerPopunder: () => void;
  isPopunderLoaded: boolean;
}

const PopunderContext = createContext<PopunderContextType | undefined>(undefined);

const POPUNDER_COOLDOWN = 1 * 60 * 1000;
const POPUNDER_URL = "https://www.effectivegatecpm.com/bzpj52hfp?key=0d8e8b5faa0f3cda56c69f3b25b0d25b";

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
      const popunder = window.open(POPUNDER_URL, '_blank');
      if (popunder) {
        popunder.blur();
        window.focus();
      }
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
