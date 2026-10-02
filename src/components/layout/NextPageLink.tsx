'use client';

import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { useTransition } from '@/components/motion/TransitionProvider';
import { ROUTES, routeKeyFromPath } from '@/content/routes';

/** Time between reaching the bottom of the page and the next page opening (ms). */
const DELAY = 1100;

/**
 * Scrolling to the bottom of the page opens the next page. A bar fills while it counts down,
 * and scrolling back up cancels it.
 */
function useScrollToNext(href: Route, enabled: boolean, bar: RefObject<HTMLElement | null>) {
  const { navigate } = useTransition();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;

    const fill = (on: boolean) => {
      const el = bar.current;
      if (!el) return;
      el.style.transitionDuration = on ? `${DELAY}ms` : '250ms';
      el.style.transitionTimingFunction = on ? 'linear' : 'ease-out';
      el.style.transform = `scaleX(${on ? 1 : 0})`;
    };
    const cancel = () => {
      if (!timer) return;
      window.clearTimeout(timer);
      timer = 0;
      fill(false);
      setArmed(false);
    };
    // Only real scrolling counts, so a page that loads already at its end doesn't jump away.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const atBottom = max > 0 && window.scrollY >= max - 4;
      if (!atBottom) return cancel();
      if (timer) return;
      fill(true);
      setArmed(true);
      timer = window.setTimeout(() => {
        timer = 0;
        setArmed(false);
        fill(false);
        navigate(href);
      }, DELAY);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      fill(false);
      setArmed(false);
    };
  }, [href, enabled, navigate, bar]);

  return armed;
}

/** Big "next page" link at the bottom of every page: Home → About → Work → Stack → Contact → Home. */
export function NextPageLink() {
  const current = ROUTES[routeKeyFromPath(usePathname())];
  const next = ROUTES[current.next];
  // Contact is the last page; scrolling to its end shouldn't loop back to Home.
  const auto = current.key !== 'contact';
  const bar = useRef<HTMLElement>(null);
  const armed = useScrollToNext(next.href, auto, bar);

  return (
    <section className="wrap pt-[clamp(90px,12vw,180px)] pb-10" aria-label="Next page">
      <TransitionLink href={next.href} className="next__link block" data-cursor="Go">
        <span className="mono mb-4.5 block text-ink-3">{current.nextKicker}</span>
        <span className="next__title">
          <span className="txt">{next.label}</span>
          <span className="arr">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </TransitionLink>
      {auto && (
        <div className="mt-8 flex items-center gap-4" aria-hidden="true">
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-sm bg-line">
            <i
              ref={bar}
              data-next-progress
              className="absolute inset-0 origin-left [transform:scaleX(0)] bg-accent transition-transform"
            />
          </div>
          <span className="mono whitespace-nowrap text-ink-3">
            {armed ? `Opening ${next.label}…` : 'Scroll to the end to continue'}
          </span>
        </div>
      )}
    </section>
  );
}
