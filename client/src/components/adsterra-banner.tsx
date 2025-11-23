import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  width?: number;
  height?: number;
  className?: string;
}

export function AdsterraBanner({ width = 300, height = 250, className = "" }: AdsterraBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !bannerRef.current) return;
    
    hasInitialized.current = true;
    
    // Clear the container
    if (bannerRef.current) {
      bannerRef.current.innerHTML = '';
    }

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
        'key' : 'd6669b74008f39b4b286c1c5951dc3ee',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    if (bannerRef.current) {
      bannerRef.current.appendChild(configScript);
    }

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/d6669b74008f39b4b286c1c5951dc3ee/invoke.js';
    if (bannerRef.current) {
      bannerRef.current.appendChild(invokeScript);
    }
  }, [width, height]);

  return (
    <div 
      ref={bannerRef} 
      className={`flex justify-center ${className}`}
      data-testid="adsterra-banner"
      style={{ minHeight: `${height}px` }}
    />
  );
}
