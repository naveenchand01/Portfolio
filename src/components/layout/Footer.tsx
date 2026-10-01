import type { ReactNode } from 'react';
import { ScrollTopLink } from '@/components/layout/ScrollTopLink';
import { Clock } from '@/components/motion/primitives';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { PROFILE } from '@/content/profile';
import { MENU_ORDER, ROUTES } from '@/content/routes';

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-bg/50 pt-9 pb-7.5 backdrop-blur-sm">
      <div className="wrap">
        <div className="grid gap-7 min-[601px]:grid-cols-2 min-[1101px]:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none font-extrabold tracking-[-0.04em]">
              {PROFILE.name}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-[30ch] text-ink-2">
              Software engineer: full-stack, machine learning and Web3. Based in Bengaluru, happy to relocate.
            </p>
          </div>
          <FooterCol title="Pages">
            {MENU_ORDER.map((k) => (
              <TransitionLink
                key={k}
                href={ROUTES[k].href}
                className="block py-0.5 text-ink-2 hover:text-ink"
              >
                {ROUTES[k].label}
              </TransitionLink>
            ))}
          </FooterCol>
          <FooterCol title="Elsewhere">
            {PROFILE.socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener"
                className="block py-0.5 text-ink-2 hover:text-ink"
              >
                {s.name} ↗
              </a>
            ))}
          </FooterCol>
          <FooterCol title="Say hello">
            <a href={`mailto:${PROFILE.email}`} className="block py-0.5 break-all text-ink-2 hover:text-ink">
              {PROFILE.email}
            </a>
            <p className="mt-4 text-ink-2">
              <Clock />
              <br />
              {PROFILE.location}
            </p>
          </FooterCol>
        </div>
        <div className="mono mt-12 flex flex-wrap justify-between gap-4 text-ink-3">
          <span>© 2026 {PROFILE.name}. Built with Next.js, GSAP &amp; WebGL.</span>
          <ScrollTopLink />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mono mb-3.5 font-normal text-ink-3">{title}</h2>
      {children}
    </div>
  );
}
