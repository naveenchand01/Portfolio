'use client';

import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useMagnetic } from '@/components/motion/primitives';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { PillAnchor, RollText } from '@/components/ui/Pill';
import { PROFILE } from '@/content/profile';
import { MENU_ORDER, NAV_ORDER, ROUTES, routeKeyFromPath } from '@/content/routes';
import { gsap } from '@/lib/gsap';

export function Nav() {
  const pathname = usePathname();
  const current = routeKeyFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const logoRef = useMagnetic<HTMLAnchorElement>(0.35);

  const lenis = useLenis(({ scroll, direction }) => {
    setScrolled(scroll > 40);
    setHidden(direction === 1 && scroll > 300);
  });

  // Mobile menu: stop scrolling, animate links in, close on Escape, return focus to the button.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const links = menuRef.current?.querySelectorAll('.menu__link');
    if (links) {
      gsap.fromTo(
        links,
        { yPercent: 60, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.06, ease: 'expo.out', delay: 0.25 },
      );
      (links[0] as HTMLElement | undefined)?.focus({ preventScroll: true });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const burger = burgerRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      burger?.focus({ preventScroll: true });
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`nav ${hidden && !open ? 'is-hidden' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <TransitionLink
          ref={logoRef}
          href="/"
          onClick={close}
          className="inline-flex items-center font-display text-[1.4rem] font-extrabold tracking-[-0.04em]"
          aria-label={`${PROFILE.name}, home`}
        >
          NC<span className="text-accent">.</span>
        </TransitionLink>

        <nav className="hidden gap-[clamp(18px,2.6vw,40px)] min-[901px]:flex" aria-label="Primary">
          {NAV_ORDER.map((key) => {
            const r = ROUTES[key];
            return (
              <TransitionLink
                key={key}
                href={r.href}
                className="nav__link"
                aria-current={current === key ? 'page' : undefined}
              >
                <sup>{r.index}</sup>
                <RollText>{r.label}</RollText>
              </TransitionLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3.5">
          <PillAnchor
            href={PROFILE.resume}
            className="max-[900px]:hidden"
            leading={<span className="dot-live" />}
          >
            Résumé
          </PillAnchor>
          <button
            ref={burgerRef}
            type="button"
            className="burger min-[901px]:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="menu"
        className={`menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
      >
        {MENU_ORDER.map((key) => {
          const r = ROUTES[key];
          return (
            <TransitionLink key={key} href={r.href} className="menu__link" onClick={close}>
              <span>{r.index}</span>
              {r.label}
            </TransitionLink>
          );
        })}
        <div className="mono mt-12 flex flex-wrap gap-x-5 gap-y-2.5 text-ink-2">
          {PROFILE.socials.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener">
              {s.name} ↗
            </a>
          ))}
          <a href={PROFILE.resume} target="_blank" rel="noopener">
            Résumé ↗
          </a>
        </div>
      </div>
    </>
  );
}
