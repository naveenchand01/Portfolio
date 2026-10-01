import type { Metadata } from 'next';
import { PageHero } from '@/components/motion/PageHero';
import { Clock, Reveal } from '@/components/motion/primitives';
import { ContactForm } from '@/components/sections/contact/ContactForm';
import { MailBlock } from '@/components/sections/contact/CopyEmail';
import { PROFILE } from '@/content/profile';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Naveen Chand. Open to software engineering roles and available immediately.',
  alternates: { canonical: '/contact' },
};

const SOCIALS = [...PROFILE.socials, { name: 'Résumé', handle: 'PDF · 1 page', href: PROFILE.resume }];

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="(04) Contact"
        lines={[{ text: 'Let’s' }, { text: 'talk.' }]}
        sub="Hiring for a software engineer, SDE-1, full-stack, backend or cloud role? I’m available immediately and happy to relocate."
        titleClassName="contact-title"
        sectionClassName="flex min-h-svh items-center pt-35 pb-15"
        gridClassName="grid w-full"
      >
        <MailBlock />
      </PageHero>

      <section className="wrap section-pad-tight">
        <Reveal stagger className="grid gap-4 min-[901px]:grid-cols-3">
          {[
            ['Looking for', PROFILE.lookingFor],
            ['Location', 'Bengaluru, India. Open to relocate anywhere.'],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-[22px] p-6">
              <span className="mono mb-2.5 block text-ink-3">{k}</span>
              <strong className="block font-display text-[clamp(1.15rem,1.6vw,1.5rem)] leading-tight tracking-[-0.02em]">
                {v}
              </strong>
            </div>
          ))}
          <div className="glass rounded-[22px] p-6">
            <span className="mono mb-2.5 block text-ink-3">Local time</span>
            <strong className="block font-display text-[clamp(1.15rem,1.6vw,1.5rem)] leading-tight tracking-[-0.02em]">
              <Clock />
            </strong>
          </div>
        </Reveal>
      </section>

      <section className="wrap section-pad">
        <div className="grid items-start gap-[clamp(28px,5vw,80px)] min-[901px]:grid-cols-2">
          <div>
            <Reveal as="p" className="label">
              (01) Find me
            </Reveal>
            <Reveal as="ul" stagger className="border-t border-line">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="social grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-6"
                  >
                    <span className="social__text transition-transform duration-600 ease-[var(--ease)]">
                      <span className="block font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-[-0.035em]">
                        {s.name}
                      </span>
                      <span className="mt-1 block font-mono text-[0.78rem] text-ink-3">{s.handle}</span>
                    </span>
                    <span className="social__arrow grid size-13 place-items-center rounded-full border border-line text-xl">
                      {s.name === 'Résumé' ? '↓' : '→'}
                    </span>
                  </a>
                </li>
              ))}
            </Reveal>
          </div>
          <div className="relative">
            <Reveal as="p" className="label">
              (02) Send a note
            </Reveal>
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
