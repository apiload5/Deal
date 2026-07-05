'use client';

import { useEffect, useState } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className = '' }: AdBannerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`}>
        <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
          Loading Ad...
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed">
        📢 Ad Space
      </div>
    </div>
  );
}

export default AdBanner;
