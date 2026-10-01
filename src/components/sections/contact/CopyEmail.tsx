'use client';

import { useState } from 'react';
import { PillButton } from '@/components/ui/Pill';
import { PROFILE } from '@/content/profile';

export function MailBlock() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-10 flex flex-wrap items-center gap-[clamp(12px,2vw,24px)]" data-fade>
      <a
        href={`mailto:${PROFILE.email}`}
        data-cursor="Write"
        className="border-b-2 border-line pb-1.5 font-display text-[clamp(1.15rem,3.4vw,3.2rem)] font-bold tracking-[-0.03em] break-all transition-colors duration-400 hover:border-accent"
      >
        {PROFILE.email}
      </a>
      <PillButton
        type="button"
        magnetic={0.3}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(PROFILE.email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            window.location.href = `mailto:${PROFILE.email}`;
          }
        }}
      >
        {copied ? 'Copied ✓' : 'Copy email'}
      </PillButton>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  );
}
