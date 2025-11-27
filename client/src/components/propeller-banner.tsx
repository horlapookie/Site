import { useEffect, useRef, useCallback } from 'react';

interface PropellerBannerProps {
  width?: number;
  height?: number;
  className?: string;
  zoneId?: string;
}

export function PropellerBanner({ 
  width = 300, 
  height = 250, 
  className = "",
  zoneId = "10218851"
}: PropellerBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !bannerRef.current) return;
    
    hasInitialized.current = true;
    
    if (bannerRef.current) {
      bannerRef.current.innerHTML = '';
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://rel-s.com/4/${zoneId}?var=eclipse-md`;
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.scrolling = 'no';
    iframe.title = 'Advertisement';
    
    if (bannerRef.current) {
      bannerRef.current.appendChild(iframe);
    }
  }, [width, height, zoneId]);

  return (
    <div 
      ref={bannerRef} 
      className={`flex justify-center ${className}`}
      data-testid="propeller-banner"
      style={{ minHeight: `${height}px`, minWidth: `${width}px` }}
    />
  );
}

export function PropellerNativeBanner({ className = "" }: { className?: string }) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !bannerRef.current) return;
    
    hasInitialized.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl28115724.effectivegatecpm.com/9c/98/0b/9c980b396be0c48001d06b66f9a412ff.js';
    
    if (bannerRef.current) {
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={bannerRef} 
      className={`flex justify-center ${className}`}
      data-testid="propeller-native-banner"
    />
  );
}

const POPUNDER_URL = "https://www.effectivegatecpm.com/bzpj52hfp?key=0d8e8b5faa0f3cda56c69f3b25b0d25b";
const POPUNDER_CHANCE = 0.4;

export function usePopunderAds() {
  const lastClickTime = useRef<number>(0);
  const clickCount = useRef<number>(0);
  
  const triggerPopunder = useCallback(() => {
    const now = Date.now();
    
    if (now - lastClickTime.current < 3000) {
      return false;
    }
    
    if (clickCount.current >= 3) {
      const hourAgo = now - (60 * 60 * 1000);
      if (lastClickTime.current > hourAgo) {
        return false;
      }
      clickCount.current = 0;
    }
    
    const shouldTrigger = Math.random() < POPUNDER_CHANCE;
    
    if (shouldTrigger) {
      lastClickTime.current = now;
      clickCount.current++;
      
      const popunder = window.open(POPUNDER_URL, '_blank');
      if (popunder) {
        popunder.blur();
        window.focus();
      }
      return true;
    }
    
    return false;
  }, []);
  
  return { triggerPopunder };
}

interface PopunderWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PopunderWrapper({ children, className = "" }: PopunderWrapperProps) {
  const { triggerPopunder } = usePopunderAds();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[role="button"]') ||
      target.closest('[data-no-popunder]')
    ) {
      return;
    }
    
    triggerPopunder();
  }, [triggerPopunder]);
  
  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
}
