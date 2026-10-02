'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { PillAnchor } from '@/components/ui/Pill';
import { PROJECTS } from '@/content/projects';
import { gsap, useGSAP } from '@/lib/gsap';
import { ProjectVisual } from './ProjectVisual';

/**
 * Desktop: the section pins and the project panels scroll sideways as you scroll down.
 * Mobile (≤ 900px): a normal vertical stack.
 */
/** Long single words ("Recommender") don't fit the panel at the full title size. */
const hasLongWord = (title: string) => title.split(' ').some((w) => w.length > 8);

export function ProjectScroller() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const track = root.current?.querySelector<HTMLElement>('[data-track]');
        const bar = root.current?.querySelector<HTMLElement>('[data-bar]');
        if (!track) return;
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            pin: '[data-pin]',
            start: 'top top',
            end: () => `+=${dist()}`,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        for (const panel of gsap.utils.toArray<HTMLElement>('[data-panel]')) {
          gsap.from(panel.querySelectorAll('[data-body] > *'), {
            y: 40,
            opacity: 0,
            stagger: 0.06,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 75%', once: true },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Projects" className="relative">
      <div data-pin className="flex items-center min-[901px]:h-screen min-[901px]:overflow-hidden">
        <div
          data-track
          className="flex flex-col gap-5 px-[var(--gutter)] will-change-transform max-[900px]:w-full min-[901px]:flex-row min-[901px]:gap-[4vw]"
        >
          {PROJECTS.map((p, i) => (
            <article
              key={p.slug}
              id={p.slug}
              data-panel
              className="glass relative grid flex-none overflow-hidden rounded-[32px] bg-[rgb(10_10_16/0.78)] max-[900px]:w-full min-[901px]:h-[min(78vh,720px)] min-[901px]:w-[min(88vw,1260px)] min-[901px]:grid-cols-[1.1fr_1fr]"
            >
              <div className="relative min-h-[280px] overflow-hidden bg-[#05070b]">
                <ProjectVisual scene={p.visual} />
                {p.screenshot && (
                  <div className="shot-frame">
                    <Image
                      src={p.screenshot.src}
                      alt={p.screenshot.alt}
                      width={1168}
                      height={777}
                      sizes="(max-width: 900px) 86vw, 45vw"
                      className="h-full w-full object-cover object-top opacity-90"
                    />
                  </div>
                )}
                <span className="mono absolute top-5.5 left-6 z-[3] text-ink-2">
                  {String(i + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
                </span>
              </div>
              <div data-body className="flex flex-col gap-4.5 overflow-auto p-[clamp(26px,3.4vw,54px)]">
                <div className="mono flex flex-wrap justify-between gap-3 text-ink-3">
                  <span>{p.context}</span>
                  <span>{p.period}</span>
                </div>
                <h2
                  className={`font-display leading-[0.88] font-extrabold tracking-[-0.05em] ${
                    hasLongWord(p.title)
                      ? 'text-[clamp(1.45rem,2.9vw,2.6rem)] max-[900px]:text-[5.8vw]'
                      : 'text-[clamp(2.4rem,4.6vw,4.8rem)]'
                  }`}
                >
                  {p.title}
                </h2>
                <p className="font-display text-[clamp(1.05rem,1.4vw,1.35rem)] leading-tight font-semibold text-accent">
                  {p.tagline}
                </p>
                <p className="text-[0.98rem] text-ink-2">{p.summary}</p>
                <ul className="proj__list grid gap-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[0.94rem] text-ink-2">
                      {h}
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2.5 pt-2">
                  {p.links.live && (
                    <PillAnchor href={p.links.live} accent>
                      {p.liveLabel ?? 'Live site'} ↗
                    </PillAnchor>
                  )}
                  {p.links.repo && <PillAnchor href={p.links.repo}>GitHub ↗</PillAnchor>}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="absolute right-[var(--gutter)] bottom-[4vh] left-[var(--gutter)] h-0.5 overflow-hidden rounded-sm bg-line max-[900px]:hidden">
          <i data-bar className="absolute inset-0 origin-left [transform:scaleX(0)] bg-accent" />
        </div>
        <span className="mono absolute right-[var(--gutter)] bottom-[calc(4vh+14px)] text-ink-3 max-[900px]:hidden">
          Keep scrolling
        </span>
      </div>
    </section>
  );
}
