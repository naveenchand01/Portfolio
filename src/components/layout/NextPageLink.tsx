'use client';

import { usePathname } from 'next/navigation';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { ROUTES, routeKeyFromPath } from '@/content/routes';

/** Big "next page" link at the bottom of every page: Home → About → Work → Stack → Contact → Home. */
export function NextPageLink() {
  const current = ROUTES[routeKeyFromPath(usePathname())];
  const next = ROUTES[current.next];
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
    </section>
  );
}
