'use client';

import { useEffect, useRef } from 'react';
import type { VisualScene } from '@/content/projects';

/** Animated canvas for a project. Only draws while on screen; one still frame with reduced motion. */
export function ProjectVisual({ scene }: { scene: VisualScene }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let draw:
      | ((c: CanvasRenderingContext2D, w: number, h: number, t: number, st: Record<string, unknown>) => void)
      | null = null;
    const state: Record<string, unknown> = {};
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now() - Math.random() * 5000;
    let visible = false;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const frame = (now: number) => {
      if (!draw) return;
      draw(ctx, w, h, (now - start) / 1000, state);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };

    // Scene code is loaded lazily so it isn't in the first page bundle.
    let cancelled = false;
    import('@/lib/visuals').then(({ SCENES }) => {
      if (cancelled) return;
      draw = SCENES[scene];
      resize();
      raf = requestAnimationFrame(frame);
    });

    const ro = new ResizeObserver(() => {
      resize();
      if (!visible || reduce) frame(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = !!entry?.isIntersecting;
        if (visible && !was) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: '100px' },
    );
    io.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [scene]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" tabIndex={-1} />;
}
