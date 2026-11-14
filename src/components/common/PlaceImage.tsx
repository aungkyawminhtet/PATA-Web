'use client';

import React, { useState } from 'react';
import { Mountain } from 'lucide-react';

interface PlaceImageProps {
  src: string | { src: string };
  alt: string;
  className?: string;
}

export const PlaceImage: React.FC<PlaceImageProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const actualSrc = typeof src === 'object' && src !== null && 'src' in src ? (src as { src: string }).src : src;

  if (failed || !actualSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#E5E9E2] text-[#26352A] p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Mountain className="w-8 h-8 text-[#406246] mb-2" />
        <span className="text-xs font-medium text-center text-[#406246] line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={actualSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
