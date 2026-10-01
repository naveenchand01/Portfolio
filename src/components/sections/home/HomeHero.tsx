'use client';

import { useLenis } from 'lenis/react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Clock, useMagnetic } from '@/components/motion/primitives';
import { usePageEnter } from '@/components/motion/TransitionProvider';
import { PROFILE } from '@/content/profile';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';

export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const played = useRef(false);
  const wordChars = useRef<Element[][]>([]);
  const cueRef = useMagnetic<HTMLButtonElement>(0.35);
  const lenis = useLenis();

  // Scale the title so "Naveen" and "photo + Chand" always fit their row.
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const fitTitle = () => {
      title.style.fontSize = '';
      const words = title.querySelectorAll<HTMLElement>('[data-word]');
      const photo = title.querySelector<HTMLElement>('[data-photo]');
      const line2 = title.querySelector<HTMLElement>('[data-line2]');
      if (words.length < 2 || !line2) return;
      for (let i = 0; i < 3; i++) {
        const fs = parseFloat(getComputedStyle(title).fontSize);
        const gap = parseFloat(getComputedStyle(line2).columnGap) || 0;
        const need = Math.max(
          (words[0] as HTMLElement).getBoundingClientRect().width,
          (words[1] as HTMLElement).getBoundingClientRect().width + (photo ? photo.offsetWidth + gap : 0),
        );
        if (need <= title.clientWidth) break;
        title.style.fontSize = `${fs * (title.clientWidth / need) * 0.985}px`;
      }
    };
    fitTitle();
    document.fonts?.ready.then(fitTitle);
    window.addEventListener('resize', fitTitle);
    return () => window.removeEventListener('resize', fitTitle);
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      played.current = false;
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]');
      const photo = root.current?.querySelector('[data-photo]');
      const intro = gsap.utils.toArray<HTMLElement>('[data-intro]');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([...intro, ...fades], { autoAlpha: 1 });
        played.current = true;
        return;
      }
      wordChars.current = gsap.utils.toArray<HTMLElement>('[data-word]').map((w) => {
        const s = SplitText.create(w, { type: 'words,chars', mask: 'words', wordsClass: 'w' });
        for (const m of s.masks) m.classList.add('w-mask');
        return s.chars;
      });
      gsap.set(wordChars.current.flat(), { yPercent: 115, rotate: 6 });
      if (photo) gsap.set(photo, { scale: 0, rotate: -25 });
      gsap.set(fades, { y: 30, autoAlpha: 0 });
      gsap.set(intro, { autoAlpha: 1 });

      // The two title lines drift apart as you scroll away from the hero.
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-line1]', { xPercent: -8, ease: 'none', scrollTrigger: st });
      gsap.to('[data-line2]', { xPercent: 6, ease: 'none', scrollTrigger: { ...st } });

      // Role rotor: slide through the list forever (the first item is repeated at the end).
      const list = root.current?.querySelector('[data-rotor]');
      const count = PROFILE.rotor.length;
      if (list) {
        const tl = gsap.timeline({ repeat: -1, delay: 3 });
        for (let i = 1; i <= count; i++) {
          tl.to(list, { yPercent: -(100 / (count + 1)) * i, duration: 0.9, ease: 'expo.inOut' }, '+=1.6');
        }
        tl.set(list, { yPercent: 0 });
      }
    },
    { scope: root },
  );

  const play = contextSafe(() => {
    if (played.current) return;
    played.current = true;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    wordChars.current.forEach((chars, i) => {
      tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045 }, i * 0.12);
    });
    tl.to('[data-photo]', { scale: 1, rotate: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)' }, 0.35);
    tl.to('[data-fade]', { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 0.5);
  });
  usePageEnter(play);

  return (
    <section ref={root} className="relative flex min-h-svh">
      <div className="wrap flex flex-col justify-between pt-30 pb-9">
        <div className="mono flex flex-wrap justify-between gap-x-6 gap-y-2.5 text-ink-2" data-fade>
          <span className="inline-flex items-center gap-2.5 text-ink">
            <span className="dot-live" />
            Open to software engineering roles
          </span>
          <span>
            Bengaluru, IN · <Clock />
          </span>
          <span>Portfolio / 2026</span>
        </div>

        <h1 ref={titleRef} className="hero__title" data-intro aria-label={PROFILE.name}>
          <span className="block" data-line1>
            <span data-word>{PROFILE.firstName}</span>
          </span>
          <span
            className="flex items-center justify-end gap-[2.2vw] max-[900px]:justify-start max-[600px]:gap-2"
            data-line2
          >
            <span className="hero__photo -translate-y-[4%] max-[600px]:w-[20vw]" data-photo>
              <Image
                src={PROFILE.photo.src}
                alt={PROFILE.photo.alt}
                fill
                priority
                sizes="(max-width: 600px) 20vw, 300px"
                className="scale-[1.12] object-cover object-[50%_22%]"
              />
            </span>
            <span data-word>{PROFILE.lastName}</span>
          </span>
        </h1>

        <div className="grid items-end gap-7 min-[901px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] max-[900px]:grid-cols-[1fr_auto]">
          <p
            className="max-w-[34ch] text-[clamp(1.02rem,1.35vw,1.3rem)] leading-normal text-ink-2 max-[900px]:order-1"
            data-fade
          >
            Software engineer building across <strong className="font-semibold text-ink">full-stack</strong>,{' '}
            <strong className="font-semibold text-ink">machine learning</strong> &amp;{' '}
            <strong className="font-semibold text-ink">Web3</strong>. B.Tech CSBS ’26 and a Google Cloud
            Certified Associate Cloud Engineer.
          </p>
          <div className="flex flex-col gap-2 max-[900px]:col-span-2" data-fade>
            <span className="mono text-ink-3">Currently building</span>
            <div className="rotor__win">
              <ul data-rotor>
                {[...PROFILE.rotor, PROFILE.rotor[0]].map((r, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: the first item is intentionally repeated
                  <li key={i} aria-hidden={i === PROFILE.rotor.length || undefined}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            ref={cueRef}
            type="button"
            className="scroll-cue relative grid size-29 place-items-center rounded-full max-[600px]:size-23 max-[900px]:order-2"
            aria-label="Scroll to introduction"
            onClick={() => lenis?.scrollTo('#intro', { duration: 1.6 })}
            data-fade
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <path id="circ" d="M60,60 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0" />
              </defs>
              <text>
                <textPath href="#circ">Scroll · to · explore · Scroll · to · explore ·</textPath>
              </text>
            </svg>
            <span className="grid size-11 place-items-center rounded-full bg-ink text-lg text-bg">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
