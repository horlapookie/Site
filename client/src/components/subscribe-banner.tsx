import { useEffect, useRef } from 'react';

export function SubscribeBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !bannerRef.current) return;

    let retryCount = 0;
    const maxRetries = 30; // Try for 30 seconds (30 retries * 1 second)
    let intervalId: NodeJS.Timeout | null = null;

    const loadBanner = async () => {
      retryCount++;
      
      if (window.propush) {
        try {
          await window.propush.pushSubscribe({
            type: 'banner',
            position: 'bottom',
          });
          // Success! Mark as initialized and stop polling
          hasInitialized.current = true;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        } catch (error) {
          console.error('Failed to load subscribe banner, will retry:', error);
          // Don't stop polling on error - keep trying
        }
      }
      
      // Check if we've exceeded max retries
      if (retryCount >= maxRetries && !hasInitialized.current) {
        console.warn('ProPush banner failed to load after 30 seconds, stopping retry attempts');
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Start polling immediately
    intervalId = setInterval(loadBanner, 1000);
    
    // Also try immediately
    loadBanner();

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <div 
      ref={bannerRef} 
      id="propush-banner" 
      className="fixed bottom-0 left-0 right-0 z-50"
      data-testid="subscribe-banner"
    />
  );
}
