'use client';

/*
 * Small scroll-motion building blocks. Each one renders normal HTML (so the content is in the
 * server-rendered page) and adds GSAP animation on the client. useGSAP cleans every animation
 * and ScrollTrigger up when the page unmounts, so nothing leaks between routes.
 */

import { useLenis } from 'lenis/react';
import Image from 'next/image';
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type PolyProps = {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
} & Record<string, unknown>;

/** Fades and lifts an element (or each of its children, with `stagger`) into view on scroll. */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  stagger = false,
  children,
  ...rest
}: PolyProps & { delay?: number; stagger?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      gsap.from(stagger ? Array.from(el.children) : el, {
        y: stagger ? 70 : 60,
        autoAlpha: 0,
        duration: stagger ? 1.2 : 1.3,
        ease: 'expo.out',
        delay,
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

/** Splits a heading into characters that rise out of word masks when scrolled into view. */
export function SplitReveal({ as: Tag = 'h2', children, ...rest }: PolyProps) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      SplitText.create(el, {
        type: 'words,chars',
        mask: 'words',
        wordsClass: 'w',
        autoSplit: true,
        onSplit(self) {
          for (const m of self.masks) m.classList.add('w-mask');
          return gsap.from(self.chars, {
            yPercent: 115,
            rotate: 5,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.022,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
export function ScrubText({ as: Tag = 'p', children, ...rest }: PolyProps) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      const split = SplitText.create(el, { type: 'words', wordsClass: 'sw' });
      gsap.to(split.words, {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

/** Counts from 0 to `value` when scrolled into view. Renders the final value for no-JS and SEO. */
export function Counter({
  value,
  decimals = 0,
  suffix = '',
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const format = (v: number) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN'));
  useGSAP(
    () => {
      const el = numRef.current;
      if (!el || prefersReduced()) return;
      const o = { v: 0 };
      el.textContent = format(0);
      gsap.to(o, {
        v: value,
        duration: 2.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = format(o.v);
        },
      });
    },
    { scope: ref },
  );
  return (
    <span ref={ref} className={className}>
      <span ref={numRef}>{format(value)}</span>
      {suffix && <sup>{suffix}</sup>}
    </span>
  );
}

/** Image that drifts vertically inside its frame while scrolling. */
export function ParallaxImage({
  className,
  imgClassName,
  ...img
}: ComponentPropsWithoutRef<typeof Image> & { imgClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.fromTo(
        'img',
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      <Image {...img} className={`scale-[1.15] object-cover ${imgClassName ?? ''}`} />
    </div>
  );
}

/** Pulls an element toward the pointer while hovered (desktop only). */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return ref;
}

/** Infinite marquee that skews with scroll velocity. */
export function Marquee({
  items,
  reverse = false,
  label,
}: {
  items: string[];
  reverse?: boolean;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  useLenis(({ velocity }) => {
    if (!trackRef.current) return;
    const skew = gsap.utils.clamp(-12, 12, velocity * 0.4);
    gsap.to(trackRef.current, { skewX: -skew, duration: 0.5, ease: 'power3', overwrite: 'auto' });
  });
  const group = (hidden: boolean) => (
    <div className="flex flex-none items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="contents">
          <span className="marquee__item">{item}</span>
          <span className="marquee__star">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <section
      className={`marquee ${reverse ? 'marquee--rev' : ''}`}
      aria-label={label}
      aria-hidden={!label || undefined}
    >
      <div ref={trackRef} className="marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </section>
  );
}

/** Live clock in India Standard Time. */
export function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState('--:--:--');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    const tick = () => setNow(`${fmt.format(new Date())} IST`);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className={className}>{now}</span>;
}
