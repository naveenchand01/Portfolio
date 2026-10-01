'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ROUTES, type RouteKey, routeKeyFromPath } from '@/content/routes';
import { liquidBus } from '@/lib/liquid-bus';
import { LIQUID_FRAG, LIQUID_VERT } from '@/lib/shaders/liquid';

type RGB = [number, number, number];
type Palette = [RGB, RGB, RGB];

const hexToRgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const paletteOf = (key: RouteKey): Palette => ROUTES[key].liquid.map(hexToRgb) as Palette;

const BLEND_MS = 1800;

/**
 * Full-screen WebGL liquid. Mounted once in the root layout, so it survives page changes:
 * when the route changes, the palette blends from the current colours to the new page's colours.
 */
export function LiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const routeRef = useRef<RouteKey>(routeKeyFromPath(pathname));
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      setFallback(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error('shader');
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, LIQUID_VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, LIQUID_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL method, not a React hook
    gl.useProgram(prog);

    // One big triangle that covers the screen.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = Object.fromEntries(
      ['uRes', 'uTime', 'uMouse', 'uIntensity', 'uScroll', 'uC1', 'uC2', 'uC3'].map((n) => [
        n,
        gl.getUniformLocation(prog, n),
      ]),
    ) as Record<string, WebGLUniformLocation | null>;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quality = window.matchMedia('(max-width: 700px)').matches ? 0.42 : 0.5;

    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * quality));
      const h = Math.max(1, Math.floor(window.innerHeight * quality));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // Palette blending
    let current: Palette = paletteOf(routeRef.current);
    let from: Palette = current;
    let to: Palette = current;
    let blendStart = 0;
    const unsubscribe = liquidBus.subscribe((key) => {
      if (key === routeRef.current) return;
      routeRef.current = key;
      from = current;
      to = paletteOf(key);
      blendStart = performance.now();
    });

    let intensity = 1;
    let time = 20 + Math.random() * 40;
    let last = performance.now();
    let raf = 0;
    let running = true;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt * (1 + liquidBus.pulse * 6);
      liquidBus.pulse *= 0.94;

      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      const k = blendStart ? Math.min(1, (now - blendStart) / BLEND_MS) : 1;
      const e = 1 - (1 - k) ** 3;
      current = [0, 1, 2].map((i) =>
        (from[i] as RGB).map((v, c) => v + (((to[i] as RGB)[c] as number) - v) * e),
      ) as Palette;

      const sy = window.scrollY / window.innerHeight;
      intensity += (Math.max(0.42, 1 - sy * 0.45) - intensity) * 0.06;

      gl.uniform2f(U.uRes ?? null, canvas.width, canvas.height);
      gl.uniform1f(U.uTime ?? null, time);
      gl.uniform2f(U.uMouse ?? null, mouse.x, mouse.y);
      gl.uniform1f(U.uIntensity ?? null, intensity);
      gl.uniform1f(U.uScroll ?? null, sy);
      gl.uniform3fv(U.uC1 ?? null, current[0]);
      gl.uniform3fv(U.uC2 ?? null, current[1]);
      gl.uniform3fv(U.uC3 ?? null, current[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (running && (!reduce || k < 1)) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(raf);
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // With reduced motion the liquid is a still frame that only redraws on scroll or palette change.
    const onScroll = () => {
      if (reduce) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      unsubscribe();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (fallback) return <div className="liquid-fallback" aria-hidden="true" />;
  return <canvas ref={canvasRef} className="liquid-canvas" aria-hidden="true" tabIndex={-1} />;
}
