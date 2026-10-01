'use client';

import { useLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '@/content/profile';
import { gsap } from '@/lib/gsap';
import { useTransition } from './TransitionProvider';

/** First visit per browser session: counts to 100 while the name fills with the gradient. */
export function Preloader() {
  const { completePreload } = useTransition();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (lenis && document.documentElement.classList.contains('is-loading')) lenis.stop();
  }, [lenis]);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('is-loading')) {
      setDone(true);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const o = { v: 0 };
    const finish = () => {
      html.classList.remove('is-loading');
      try {
        sessionStorage.setItem('nc-seen', '1');
      } catch {}
      lenisRef.current?.start();
      setDone(true);
    };
    const tl = gsap
      .timeline()
      .to(o, {
        v: 100,
        duration: reduce ? 0.3 : 2.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(o.v)).padStart(3, '0');
          if (fillRef.current) fillRef.current.style.clipPath = `inset(${100 - o.v}% 0 0 0)`;
        },
      })
      .to(rootRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
      .add(completePreload, '<0.45')
      .add(finish);
    return () => {
      tl.kill();
    };
  }, [completePreload]);

  if (done) return null;

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="absolute inset-0 flex flex-col justify-between px-[var(--gutter)] py-7">
        <div className="mono flex justify-between text-ink-3">
          <span>{PROFILE.name} · Portfolio</span>
          <span>Loading the liquid</span>
        </div>
        <div className="flex items-end justify-between gap-5">
          <div className="preloader__name">
            <span className="ghost">
              {PROFILE.firstName}
              <br />
              {PROFILE.lastName}
            </span>
            <span ref={fillRef} className="fill">
              {PROFILE.firstName}
              <br />
              {PROFILE.lastName}
            </span>
          </div>
          <div
            ref={countRef}
            className="font-display text-[clamp(3rem,9vw,7rem)] leading-none font-bold tabular-nums"
          >
            000
          </div>
        </div>
      </div>
    </div>
  );
}
