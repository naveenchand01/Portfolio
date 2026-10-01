'use client';

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { PillButton } from '@/components/ui/Pill';
import { PROFILE } from '@/content/profile';
import { type ContactField, contactSchema, fieldErrors } from '@/lib/contact-schema';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const mailto = (name: string, message: string) =>
  `mailto:${PROFILE.email}?subject=${encodeURIComponent(`Hello Naveen, from ${name || 'your portfolio'}`)}&body=${encodeURIComponent(message)}`;

/** Sends to POST /api/contact; if the backend is down, offers a pre-filled email instead. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [draft, setDraft] = useState({ name: '', message: '' });
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''),
      startedAt: startedAt.current,
    };
    setDraft({ name: payload.name, message: payload.message });

    const check = contactSchema.safeParse(payload);
    if (!check.success) {
      const errs = fieldErrors(check.error);
      setErrors(errs);
      const first = (['name', 'email', 'message'] as const).find((k) => errs[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { fields?: Partial<Record<ContactField, string>> };
      if (res.ok) {
        setStatus('sent');
        formRef.current?.reset();
      } else if (res.status === 400 && body.fields && Object.keys(body.fields).length) {
        setErrors(body.fields);
        setStatus('idle');
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="glass flex min-h-[420px] flex-col items-start justify-center gap-4 rounded-[22px] p-[clamp(24px,3.4vw,44px)]"
        role="status"
      >
        <span className="grid size-14 place-items-center rounded-full bg-accent text-2xl text-bg">✓</span>
        <h3 className="h3">Thanks, message sent.</h3>
        <p className="text-ink-2">I’ll reply within a day. You can also reach me at {PROFILE.email}.</p>
        <button type="button" className="link-arrow mt-2" onClick={() => setStatus('idle')}>
          Send another <span>→</span>
        </button>
      </div>
    );
  }

  const field = (name: ContactField, label: string, input: ReactNode) => (
    <div className="field flex flex-col gap-2" data-invalid={errors[name] ? 'true' : undefined}>
      <label htmlFor={`f-${name}`} className="mono text-ink-3">
        {label}
      </label>
      {input}
      {errors[name] && (
        <p id={`f-${name}-err`} className="text-[0.85rem] text-[#ff8a8a]">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: ContactField) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `f-${name}-err` : undefined,
  });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="glass flex flex-col gap-4.5 rounded-[22px] p-[clamp(24px,3.4vw,44px)]"
    >
      {field(
        'name',
        'Your name',
        <input id="f-name" name="name" autoComplete="name" placeholder="Jane from Acme" {...aria('name')} />,
      )}
      {field(
        'email',
        'Your email',
        <input
          id="f-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jane@acme.com"
          {...aria('email')}
        />,
      )}
      {field(
        'message',
        'Message',
        <textarea
          id="f-message"
          name="message"
          rows={5}
          placeholder="We’re hiring for…"
          {...aria('message')}
        />,
      )}
      {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="f-company">Company</label>
        <input id="f-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div
          className="rounded-2xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/10 p-4 text-[0.95rem]"
          role="alert"
        >
          Couldn’t send right now.{' '}
          <a className="font-semibold underline" href={mailto(draft.name, draft.message)}>
            Email me directly
          </a>{' '}
          and your message will be pre-filled.
        </div>
      )}

      <PillButton type="submit" accent className="mt-2 self-start" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </PillButton>
    </form>
  );
}
