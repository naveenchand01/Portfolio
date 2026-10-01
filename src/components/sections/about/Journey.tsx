'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Reveal, SplitReveal } from '@/components/motion/primitives';
import { GALLERY } from '@/content/gallery';
import { TIMELINE } from '@/content/timeline';
import { gsap, useGSAP } from '@/lib/gsap';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Timeline whose gradient rail fills as you scroll; each milestone slides in. */
export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reduced()) {
        gsap.set('[data-progress]', { scaleY: 1 });
        return;
      }
      gsap.to('[data-progress]', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom 60%', scrub: true },
      });
      for (const item of gsap.utils.toArray<HTMLElement>('.tl')) {
        gsap.from(item, {
          x: 40,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        });
      }
    },
    { scope: ref },
  );

  return (
    <section className="wrap section-pad">
      <Reveal as="p" className="label">
        (03) The journey
      </Reveal>
      <SplitReveal className="h2">Milestones so far.</SplitReveal>
      <div ref={ref} className="relative mt-16 pl-[clamp(28px,6vw,90px)]">
        <div className="absolute top-0 bottom-0 left-[clamp(8px,2vw,30px)] w-0.5 overflow-hidden rounded-sm bg-line">
          <div className="timeline__progress" data-progress />
        </div>
        <ol>
          {TIMELINE.map((t) => (
            <li
              key={t.title}
              className="tl relative grid gap-1.5 border-b border-line py-8.5 min-[901px]:grid-cols-[180px_1fr] min-[901px]:gap-7"
            >
              <span className="font-display text-[clamp(1.3rem,2vw,1.8rem)] font-bold tracking-[-0.03em] text-accent">
                {t.period}
              </span>
              <div>
                <h3 className="font-display text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.05] font-bold tracking-[-0.03em]">
                  {t.title}
                </h3>
                <p className="mt-2 max-w-[62ch] text-ink-2">{t.body}</p>
                {t.tag && <span className="mono mt-2.5 block text-ink-3">{t.tag}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Instagram moments that drift sideways while the section scrolls past. */
export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reduced()) return;
      const track = ref.current?.querySelector<HTMLElement>('[data-track]');
      if (!track) return;
      gsap.fromTo(
        track,
        { x: () => window.innerWidth * 0.1 },
        {
          x: () => -(track.scrollWidth - window.innerWidth) - window.innerWidth * 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      for (const img of gsap.utils.toArray<HTMLElement>('[data-shot] img')) {
        gsap.fromTo(
          img,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }
    },
    { scope: ref },
  );

  return (
    <section className="section-pad-tight">
      <div className="wrap">
        <Reveal as="p" className="label">
          (04) Off the screen
        </Reveal>
        <SplitReveal className="h2">Moments in between.</SplitReveal>
      </div>
      <div ref={ref} className="mt-16 overflow-hidden py-5 max-[900px]:overflow-x-auto">
        <div data-track className="flex w-max gap-[clamp(14px,2vw,28px)] px-[var(--gutter)]">
          {GALLERY.map((g) => (
            <figure
              key={g.src + g.caption}
              className="w-[clamp(240px,26vw,380px)] flex-none even:mt-10 min-[901px]:even:mt-[70px]"
            >
              <div data-shot className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                <Image
                  src={g.src}
                  alt={g.alt}
                  width={g.width}
                  height={g.height}
                  sizes="(max-width: 900px) 70vw, 26vw"
                  className="h-full w-full scale-[1.15] object-cover"
                  style={g.position ? { objectPosition: g.position } : undefined}
                />
              </div>
              <figcaption className="mt-3.5 flex justify-between gap-2.5 text-[0.92rem] text-ink-2">
                <span>{g.caption}</span>
                <span className="mono text-ink-3">{g.date}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
