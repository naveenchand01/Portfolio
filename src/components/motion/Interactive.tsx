'use client';

import Image from 'next/image';
import { type CSSProperties, type PointerEvent, type ReactNode, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const canTilt = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Card whose glow follows the pointer; with `tilt`, it also tilts in 3D. */
export function TiltCard({
  as: Tag = 'article',
  tilt = true,
  className,
  style,
  children,
}: {
  as?: 'article' | 'div' | 'figure';
  tilt?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <Tag
      // @ts-expect-error: ref type differs per tag; all are HTMLElements
      ref={ref}
      className={className}
      style={style}
      onPointerMove={(e: PointerEvent<HTMLElement>) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        if (tilt && canTilt()) {
          gsap.to(el, {
            rotateY: (px - 0.5) * 10,
            rotateX: (0.5 - py) * 10,
            transformPerspective: 900,
            duration: 0.6,
            ease: 'power3',
          });
        }
      }}
      onPointerLeave={() => {
        if (tilt && ref.current)
          gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
      }}
    >
      {children}
    </Tag>
  );
}

/** Portrait that ripples like liquid while hovered (SVG turbulence + displacement filter). */
export function LiquidImage({
  src,
  alt,
  width,
  height,
  caption,
  role,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  role: string;
}) {
  const state = useRef({ scale: 0, raf: 0 });

  const loop = () => {
    const disp = document.querySelector('#liquid-distort feDisplacementMap');
    const turb = document.querySelector('#liquid-distort feTurbulence');
    const t = performance.now() / 1000;
    turb?.setAttribute(
      'baseFrequency',
      `${0.012 + Math.sin(t * 0.9) * 0.004} ${0.02 + Math.cos(t * 0.7) * 0.006}`,
    );
    disp?.setAttribute('scale', state.current.scale.toFixed(2));
    state.current.raf = state.current.scale > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (!state.current.raf) state.current.raf = requestAnimationFrame(loop);
  };

  return (
    <figure
      className="relative aspect-[4/5] overflow-hidden rounded-[22px]"
      data-cursor="Hello"
      onPointerEnter={() => {
        if (!canTilt()) return;
        gsap.to(state.current, { scale: 38, duration: 0.6, ease: 'power2.out', onUpdate: kick });
      }}
      onPointerLeave={() => {
        gsap.to(state.current, { scale: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)', onUpdate: kick });
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 900px) 90vw, 40vw"
        className="h-full w-full scale-[1.08] object-cover object-[50%_18%] [filter:url(#liquid-distort)]"
      />
      <figcaption className="absolute right-4 bottom-4 left-4 flex justify-between gap-2.5 rounded-[14px] bg-bg/55 px-4 py-3 text-[0.9rem] backdrop-blur-md">
        <span>{caption}</span>
        <span className="mono text-ink-2">{role}</span>
      </figcaption>
    </figure>
  );
}
