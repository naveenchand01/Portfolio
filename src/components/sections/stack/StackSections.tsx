import Image from 'next/image';
import type { CSSProperties } from 'react';
import { TiltCard } from '@/components/motion/Interactive';
import { Reveal, SplitReveal } from '@/components/motion/primitives';
import { ACE_CERTIFICATE, CERTIFICATIONS } from '@/content/certifications';
import { ORBIT_RINGS, SKILL_GROUPS } from '@/content/skills';

/**
 * Pure-CSS orbit: each ring spins, and every label counter-spins at the same speed so it stays upright.
 * Ring sizes use container query units (cqw), so the orbit scales with its box.
 */
export function Orbit() {
  return (
    <div
      className="orbit relative mx-auto aspect-square w-[min(92vw,640px)]"
      role="img"
      aria-label="Technologies orbiting around Naveen"
    >
      {ORBIT_RINGS.map((ring) => {
        const style = {
          '--r': ring.radius,
          '--dur': `${ring.duration}s`,
          '--dir': ring.reverse ? 'reverse' : 'normal',
          '--rdir': ring.reverse ? 'normal' : 'reverse',
        } as CSSProperties;
        return (
          <div key={ring.radius} className="ring" style={style}>
            <div className="ring__spin">
              {ring.items.map((item, i) => (
                <span
                  key={item}
                  className="ring__item"
                  style={{ '--a': `${(360 * i) / ring.items.length + ring.radius * 3}deg` } as CSSProperties}
                >
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
      <div className="orbit-core absolute top-1/2 left-1/2 grid aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-[clamp(1.4rem,3vw,2.4rem)] font-extrabold tracking-[-0.05em] text-bg">
        NC
      </div>
    </div>
  );
}

export function Toolbox() {
  return (
    <section className="wrap section-pad">
      <Reveal as="p" className="label">
        (01) Toolbox
      </Reveal>
      <SplitReveal className="h2">What I reach for.</SplitReveal>
      <Reveal stagger className="mt-16 grid gap-4 min-[601px]:grid-cols-2 min-[1101px]:grid-cols-3">
        {SKILL_GROUPS.map((g) => (
          <div key={g.title} className="glass flex flex-col gap-4.5 rounded-[22px] px-6.5 py-7.5">
            <div className="flex items-baseline justify-between gap-2.5">
              <h3 className="h3">{g.title}</h3>
              <span className="mono text-ink-3">{String(g.items.length).padStart(2, '0')}</span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function Certifications() {
  return (
    <section className="wrap section-pad-tight">
      <Reveal as="p" className="label">
        (02) Certifications
      </Reveal>
      <SplitReveal className="h2">Verified, not just claimed.</SplitReveal>
      <div className="mt-16 grid gap-4 min-[901px]:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <TiltCard
            as="figure"
            className="cert-hero relative overflow-hidden rounded-[22px] border border-line bg-white"
          >
            <Image
              src={ACE_CERTIFICATE.src}
              alt={ACE_CERTIFICATE.alt}
              width={ACE_CERTIFICATE.width}
              height={ACE_CERTIFICATE.height}
              sizes="(max-width: 900px) 92vw, 55vw"
              className="h-full w-full object-contain"
            />
            <div className="cert-shine" />
          </TiltCard>
        </Reveal>
        <Reveal as="ol" stagger className="flex flex-col border-t border-line">
          {CERTIFICATIONS.map((c, i) => (
            <li
              key={c.name}
              className="grid grid-cols-[30px_1fr] items-center gap-x-3.5 border-b border-line py-4.5 transition-[padding] duration-500 hover:pl-2.5 min-[601px]:grid-cols-[40px_1fr_auto]"
            >
              <span className="mono text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <span className="leading-tight font-bold">{c.name}</span>
              <span className="text-[0.85rem] text-ink-3 max-[600px]:col-start-2 min-[601px]:text-right">
                {c.issuer}
                {c.year ? ` · ${c.year}` : ''}
              </span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
