'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { useTransition } from './TransitionProvider';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Route };

/** Internal link that plays the liquid page transition before navigating. */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const { navigate } = useTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}
