'use client';

import { type ReactNode, useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { usePageEnter } from './TransitionProvider';

export type HeroLine = { text: string; outline?: boolean };

/**
 * Hero for the inner pages. The title characters rise out of masks and the rest fades up
 * when the page "enters" (after the preloader or the page transition).
 */
export function PageHero({
  label,
  lines,
  sub,
  aside,
  children,
  titleClassName = 'phero__title',
  sectionClassName = 'flex min-h-[92svh] items-end pt-35 pb-15',
  gridClassName = 'grid w-full items-end gap-10 min-[901px]:grid-cols-[1fr_auto]',
}: {
  label: string;
  lines: HeroLine[];
  sub?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  sectionClassName?: string;
  gridClassName?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const played = useRef(false);
  const lineChars = useRef<Element[][]>([]);

  const { contextSafe } = useGSAP(
    () => {
      played.current = false;
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]');
      const intro = gsap.utils.toArray<HTMLElement>('[data-intro]');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([...intro, ...fades], { autoAlpha: 1 });
        played.current = true;
        return;
      }
      lineChars.current = gsap.utils.toArray<HTMLElement>('[data-line]').map((line) => {
        const s = SplitText.create(line, { type: 'words,chars', mask: 'words', wordsClass: 'w' });
        for (const m of s.masks) m.classList.add('w-mask');
        return s.chars;
      });
      gsap.set(lineChars.current.flat(), { yPercent: 115, rotate: 6 });
      gsap.set(fades, { y: 30, autoAlpha: 0 });
      gsap.set(intro, { autoAlpha: 1 });
    },
    { scope: root },
  );

  const play = contextSafe(() => {
    if (played.current) return;
    played.current = true;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    lineChars.current.forEach((chars, i) => {
      tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045 }, i * 0.12);
    });
    tl.to(
      gsap.utils.toArray('[data-fade]', root.current),
      { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08 },
      0.5,
    );
  });
  usePageEnter(play);

  return (
    <section ref={root} className={sectionClassName}>
      <div className="wrap">
        <div className={gridClassName}>
          <div>
            <p className="label" data-fade>
              {label}
            </p>
            <h1 className={titleClassName} data-intro aria-label={lines.map((l) => l.text).join(' ')}>
              {lines.map((l, i) => (
                <span key={l.text}>
                  {i > 0 && <br />}
                  <span data-line className={l.outline ? 'outline-text' : undefined}>
                    {l.text}
                  </span>
                </span>
              ))}
            </h1>
            {sub && (
              <p className="mt-7 max-w-[40ch] text-[clamp(1rem,1.3vw,1.25rem)] text-ink-2" data-fade>
                {sub}
              </p>
            )}
            {children}
          </div>
          {aside && <div data-fade>{aside}</div>}
        </div>
      </div>
    </section>
  );
}
