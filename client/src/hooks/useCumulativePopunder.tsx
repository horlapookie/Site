import { useEffect } from 'react';

const CUMULATIVE_TIME_KEY = 'eclipse_ad_cumulative_time';
const LAST_ACTIVITY_KEY = 'eclipse_ad_last_activity';
const POPUNDER_THRESHOLD = 15000; // 15 seconds
const RESET_THRESHOLD = 60000; // Reset if inactive for 60 seconds

export const useCumulativePopunder = () => {
  useEffect(() => {
    // Add social bar script
    const socialScript = document.createElement('script');
    socialScript.type = 'text/javascript';
    socialScript.async = true;
    socialScript.src = '//pl28144084.effectivegatecpm.com/5b/b8/2b/5bb82b437084e0a5fb0fc271087ce7f1.js';
    document.body.appendChild(socialScript);

    const getCurrentCumulativeTime = () => {
      const stored = localStorage.getItem(CUMULATIVE_TIME_KEY);
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      const now = Date.now();

      // If inactive for 60 seconds, reset
      if (lastActivity && now - parseInt(lastActivity) > RESET_THRESHOLD) {
        localStorage.removeItem(CUMULATIVE_TIME_KEY);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        return 0;
      }

      return stored ? parseInt(stored) : 0;
    };

    const showPopunder = () => {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl28115724.effectivegatecpm.com/9c/98/0b/9c980b396be0c48001d06b66f9a412ff.js';
      document.body.appendChild(script);

      // Reset cumulative time after showing popunder
      localStorage.removeItem(CUMULATIVE_TIME_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    };

    let startTime = Date.now();
    let popunderShown = false;
    let cumulativeTime = getCurrentCumulativeTime();

    const updateCumulativeTime = () => {
      const now = Date.now();
      const sessionTime = now - startTime;
      const newCumulativeTime = cumulativeTime + sessionTime;

      localStorage.setItem(CUMULATIVE_TIME_KEY, newCumulativeTime.toString());
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

      if (newCumulativeTime >= POPUNDER_THRESHOLD && !popunderShown) {
        popunderShown = true;
        showPopunder();
      }
    };

    // Check on mount if threshold already reached
    if (cumulativeTime >= POPUNDER_THRESHOLD) {
      popunderShown = true;
      showPopunder();
    }

    // Update cumulative time periodically (every second)
    const interval = setInterval(updateCumulativeTime, 1000);

    // Update before leaving
    const handleBeforeUnload = () => {
      updateCumulativeTime();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateCumulativeTime(); // Final update
    };
  }, []);
};
