'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { type ReactNode, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/** Drives Lenis from GSAP's ticker so smooth scroll and ScrollTrigger stay in sync. */
function GsapSync() {
  const lenis = useLenis(ScrollTrigger.update);
  useEffect(() => {
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: reduced ? 0 : 1.15,
        smoothWheel: !reduced,
        easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      }}
    >
      <GsapSync />
      {children}
    </ReactLenis>
  );
}
