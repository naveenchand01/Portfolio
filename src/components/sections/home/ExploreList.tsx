'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/primitives';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { ROUTES, type RouteKey } from '@/content/routes';
import { gsap } from '@/lib/gsap';

const ITEMS: { key: Exclude<RouteKey, 'home'>; desc: string; preview: string; fit?: 'contain' }[] = [
  { key: 'about', desc: 'Story, education, leadership and life off-screen', preview: '/images/candid.jpg' },
  { key: 'work', desc: 'Six projects, from AI forecasting to DeFi', preview: '/images/stockai.jpg' },
  {
    key: 'stack',
    desc: 'Languages, frameworks, tools and certifications',
    preview: '/images/ace-certificate.jpg',
    fit: 'contain',
  },
  { key: 'contact', desc: 'Hiring? Let’s talk. Available immediately.', preview: '/images/naveen.jpg' },
];

/** Page index with a floating image preview that follows the cursor (desktop). */
export function ExploreList() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(el, {
        rotate: gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6),
        duration: 0.6,
        ease: 'power3',
      });
      lastX = e.clientX;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    if (!previewRef.current) return;
    gsap.to(previewRef.current, {
      opacity: active ? 1 : 0,
      scale: active ? 1 : 0.6,
      duration: active ? 0.5 : 0.4,
      ease: active ? 'expo.out' : 'power3',
    });
  }, [active]);

  return (
    <section className="wrap section-pad-tight">
      <Reveal as="p" className="label">
        (04) Explore
      </Reveal>
      <Reveal as="ul" stagger className="explore border-t border-line">
        {ITEMS.map((item) => {
          const r = ROUTES[item.key];
          return (
            <li key={item.key}>
              <TransitionLink
                href={r.href}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-5 py-[clamp(22px,3vw,38px)] min-[901px]:grid-cols-[70px_1fr_auto_60px]"
                onPointerEnter={() => setActive(item.key)}
                onPointerLeave={() => setActive(null)}
              >
                <span className="mono explore__muted text-ink-3">{r.index}</span>
                <span className="font-display text-[clamp(2.4rem,6.5vw,6rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                  {r.label}
                </span>
                <span className="explore__muted max-w-[26ch] text-right text-ink-2 transition-colors max-[900px]:hidden">
                  {item.desc}
                </span>
                <span className="explore__arrow justify-self-end text-[2rem]">→</span>
              </TransitionLink>
            </li>
          );
        })}
      </Reveal>
      <div ref={previewRef} className="hover-preview max-[900px]:hidden" aria-hidden="true">
        {ITEMS.map((item) => (
          // biome-ignore lint/performance/noImgElement: tiny decorative previews, already optimized JPGs
          <img
            key={item.key}
            src={item.preview}
            alt=""
            loading="lazy"
            className={active === item.key ? 'is-on' : ''}
            style={
              item.fit === 'contain'
                ? { objectFit: 'contain', background: '#fff' }
                : { objectPosition: '50% 20%' }
            }
          />
        ))}
      </div>
    </section>
  );
}
