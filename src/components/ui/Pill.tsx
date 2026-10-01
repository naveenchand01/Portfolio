'use client';

import type { Route } from 'next';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useMagnetic } from '@/components/motion/primitives';
import { TransitionLink } from '@/components/motion/TransitionLink';

/** Text that rolls up to a copy of itself on hover. */
export function RollText({ children }: { children: ReactNode }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

type Base = {
  children: ReactNode;
  accent?: boolean;
  magnetic?: number;
  className?: string;
  leading?: ReactNode;
};

const cls = (accent?: boolean, className?: string) =>
  `pill ${accent ? 'pill--accent' : ''} ${className ?? ''}`;

/** External link (opens in a new tab) styled as a pill. */
export function PillAnchor({
  href,
  children,
  accent,
  magnetic = 0.25,
  className,
  leading,
}: Base & { href: string }) {
  const ref = useMagnetic<HTMLAnchorElement>(magnetic);
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener" className={cls(accent, className)}>
      {leading}
      <RollText>{children}</RollText>
    </a>
  );
}

/** Internal link that uses the liquid page transition. */
export function PillLink({
  href,
  children,
  accent,
  magnetic = 0.25,
  className,
  leading,
}: Base & { href: Route }) {
  const ref = useMagnetic<HTMLAnchorElement>(magnetic);
  return (
    <TransitionLink ref={ref} href={href} className={cls(accent, className)}>
      {leading}
      <RollText>{children}</RollText>
    </TransitionLink>
  );
}

export function PillButton({
  children,
  accent,
  magnetic = 0.25,
  className,
  leading,
  ...rest
}: Base & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useMagnetic<HTMLButtonElement>(magnetic);
  return (
    <button ref={ref} className={cls(accent, className)} {...rest}>
      {leading}
      <RollText>{children}</RollText>
    </button>
  );
}
