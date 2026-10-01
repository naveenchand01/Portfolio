'use client';

import { useLenis } from 'lenis/react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { ROUTES, routeKeyFromPath } from '@/content/routes';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { liquidBus } from '@/lib/liquid-bus';

/*
 * Page transitions without page reloads.
 *
 *   click link ──▶ cover (liquid wave rises + page label)
 *              ──▶ router.push(href)        (Next.js swaps the page under the cover)
 *              ──▶ reveal (wave drips away)  ──▶ "enter": the new page's intro plays
 *
 * Pages subscribe to "enter" with usePageEnter(). Back/forward skip the cover.
 */

type TransitionApi = {
  navigate: (href: Route) => void;
  onEnter: (cb: () => void) => () => void;
  completePreload: () => void;
};

const TransitionContext = createContext<TransitionApi | null>(null);

export function useTransition(): TransitionApi {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used inside <TransitionProvider>');
  return ctx;
}

/** Runs `cb` when the current page "enters" (after the preloader or the transition reveal). */
export function usePageEnter(cb: () => void) {
  const { onEnter } = useTransition();
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useLayoutEffect(() => onEnter(() => cbRef.current()), [onEnter]);
}

// SVG paths in a 100×100 viewBox (stretched to the screen).
const P = {
  hidden: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
  rising: 'M 0 100 V 55 Q 50 5 100 55 V 100 z',
  full: 'M 0 100 V 0 Q 50 0 100 0 V 100 z',
  topFull: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
  topDrip: 'M 0 0 V 45 Q 50 105 100 45 V 0 z',
  topGone: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const listeners = useRef(new Set<() => void>());
  const entered = useRef(false);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const split = useRef<SplitText | null>(null);
  const prevPath = useRef(pathname);

  const enter = useCallback(() => {
    entered.current = true;
    for (const cb of [...listeners.current]) cb();
  }, []);

  const onEnter = useCallback((cb: () => void) => {
    listeners.current.add(cb);
    if (entered.current) cb();
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  const completePreload = useCallback(() => {
    if (!entered.current) enter();
  }, [enter]);

  const setLabel = useCallback((text: string) => {
    const el = labelRef.current;
    if (!el) return [];
    split.current?.revert();
    el.textContent = text;
    split.current = SplitText.create(el, { type: 'chars', mask: 'chars' });
    return split.current.chars;
  }, []);

  const navigate = useCallback(
    (href: Route) => {
      if (busy.current) return;
      if (href === pathname) {
        lenis?.scrollTo(0, { duration: 1.2 });
        return;
      }
      const key = routeKeyFromPath(href);
      liquidBus.setRoute(key);
      liquidBus.stir();
      if (reduced || !overlayRef.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      entered.current = false;
      pending.current = href;
      lenis?.stop();

      const chars = setLabel(ROUTES[key].label);
      overlayRef.current.classList.add('is-active');
      backRef.current?.setAttribute('d', P.hidden);
      frontRef.current?.setAttribute('d', P.hidden);
      gsap.set(labelRef.current, { opacity: 1 });
      gsap.set(chars, { yPercent: 115 });

      gsap
        .timeline({ onComplete: () => router.push(href, { scroll: false }) })
        .to(backRef.current, { attr: { d: P.rising }, duration: 0.45, ease: 'power2.in' })
        .to(backRef.current, { attr: { d: P.full }, duration: 0.4, ease: 'power2.out' })
        .to(frontRef.current, { attr: { d: P.rising }, duration: 0.45, ease: 'power2.in' }, 0.12)
        .to(frontRef.current, { attr: { d: P.full }, duration: 0.4, ease: 'power2.out' })
        .to(chars, { yPercent: 0, duration: 0.6, stagger: 0.03, ease: 'expo.out' }, 0.62);
    },
    [pathname, lenis, reduced, router, setLabel],
  );

  // First load: enter immediately unless the preloader is showing (it calls completePreload).
  useEffect(() => {
    const loading = document.documentElement.classList.contains('is-loading');
    if (!loading) enter();
    // Safety net: never leave a page without its intro.
    const t = window.setTimeout(() => {
      if (!entered.current) enter();
    }, 6000);
    return () => window.clearTimeout(t);
  }, [enter]);

  // Route changed: the new page is now rendered under the cover.
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    const key = routeKeyFromPath(pathname);
    document.documentElement.dataset.page = key;
    liquidBus.setRoute(key);
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);

    if (!pending.current) {
      // Back/forward navigation: no cover, just refresh and play the intro.
      requestAnimationFrame(() => ScrollTrigger.refresh());
      if (!entered.current) enter();
      return;
    }

    pending.current = null;
    const chars = split.current?.chars ?? [];
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      backRef.current?.setAttribute('d', P.topFull);
      frontRef.current?.setAttribute('d', P.topFull);
      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
            overlayRef.current?.classList.remove('is-active');
            lenis?.start();
          },
        })
        .to(chars, { yPercent: -115, duration: 0.6, stagger: 0.025, ease: 'power3.in' }, 0.05)
        .set(labelRef.current, { opacity: 0 })
        .to(frontRef.current, { attr: { d: P.topDrip }, duration: 0.55, ease: 'power2.in' }, 0.35)
        .to(frontRef.current, { attr: { d: P.topGone }, duration: 0.55, ease: 'power2.out' })
        .to(backRef.current, { attr: { d: P.topDrip }, duration: 0.55, ease: 'power2.in' }, 0.48)
        .to(backRef.current, { attr: { d: P.topGone }, duration: 0.55, ease: 'power2.out' }, '>-0.05')
        .add(enter, 0.8);
    });
  }, [pathname, lenis, enter]);

  const api = useMemo(() => ({ navigate, onEnter, completePreload }), [navigate, onEnter, completePreload]);

  return (
    <TransitionContext.Provider value={api}>
      {children}
      <div ref={overlayRef} className="transition-overlay" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
          <path ref={backRef} className="t-back" d={P.hidden} />
          <path ref={frontRef} className="t-front" d={P.hidden} />
        </svg>
        <div ref={labelRef} className="transition-overlay__label" />
      </div>
    </TransitionContext.Provider>
  );
}
