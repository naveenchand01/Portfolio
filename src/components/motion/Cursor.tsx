'use client';

import { useEffect, useRef } from 'react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import { gsap } from '@/lib/gsap';

/**
 * Custom cursor: a dot plus a lagging ring. Hovering a link or button grows the ring;
 * elements with data-cursor="View" turn it into a labelled accent bubble.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!root || !dot || !ring || !label) return;

    document.documentElement.classList.add('has-cursor');
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lag = { ...pos };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const tick = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${lag.x}px, ${lag.y}px) translate(-50%, -50%)`;
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>(
        '[data-cursor], a, button, input, textarea',
      );
      root.classList.remove('is-hover', 'is-label');
      if (!t) return;
      if (t.dataset.cursor) {
        label.textContent = t.dataset.cursor;
        root.classList.add('is-label');
      } else root.classList.add('is-hover');
    };
    const hide = () => gsap.to(root, { opacity: 0, duration: 0.3 });
    const show = () => gsap.to(root, { opacity: 1, duration: 0.3 });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.documentElement.addEventListener('pointerleave', hide);
    document.documentElement.addEventListener('pointerenter', show);
    gsap.ticker.add(tick);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.documentElement.removeEventListener('pointerenter', show);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}
