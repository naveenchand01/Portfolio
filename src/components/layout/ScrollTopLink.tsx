'use client';

import { useLenis } from 'lenis/react';

export function ScrollTopLink() {
  const lenis = useLenis();
  return (
    <button
      type="button"
      className="mono cursor-pointer"
      onClick={() => {
        if (lenis) lenis.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      Back to top ↑
    </button>
  );
}
