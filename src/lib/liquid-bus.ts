import type { RouteKey } from '@/content/routes';

type Listener = (key: RouteKey) => void;

/**
 * Tiny shared channel between the page-transition system and the liquid canvas.
 * Lets a transition start the colour change and "stir" the liquid before the route changes.
 */
export const liquidBus = {
  pulse: 0,
  listeners: new Set<Listener>(),
  setRoute(key: RouteKey) {
    for (const l of this.listeners) l(key);
  },
  stir() {
    this.pulse = 1;
  },
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  },
};
