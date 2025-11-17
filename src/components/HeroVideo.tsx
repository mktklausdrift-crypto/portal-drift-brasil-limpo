"use client";
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface HeroVideoProps {
  srcMp4: string;
  srcWebm?: string;
  poster?: string;
  className?: string;
  overlay?: boolean;
}

export function HeroVideo({ srcMp4, poster, className, overlay = true }: HeroVideoProps) {
  return (
    <div className={`absolute inset-0 w-full h-full ${className || ''}`} aria-hidden="true">
      <video
        src={srcMp4}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        preload="auto"
        className="w-full h-full object-cover"
        style={{ position: 'absolute', inset: 0 }}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 pointer-events-none" />
      )}
    </div>
  );
}

export default HeroVideo;