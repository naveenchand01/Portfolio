import type { CSSProperties, ReactNode } from 'react';
import { LiquidImage, TiltCard } from '@/components/motion/Interactive';
import { Reveal, SplitReveal } from '@/components/motion/primitives';
import { PROFILE } from '@/content/profile';
import { LANES, type LaneIcon } from '@/content/skills';
import { LEADERSHIP } from '@/content/timeline';

export function Bio() {
  return (
    <section className="wrap section-pad-tight">
      <div className="grid items-start gap-[clamp(32px,6vw,110px)] min-[901px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal className="max-w-[480px] min-[901px]:sticky min-[901px]:top-[110px] min-[901px]:max-w-none">
          <LiquidImage
            src={PROFILE.photo.src}
            alt={PROFILE.photo.alt}
            width={800}
            height={1200}
            caption={PROFILE.name}
            role={PROFILE.role}
          />
        </Reveal>
        <div className="flex flex-col gap-6.5">
          <Reveal
            as="p"
            className="font-display text-[clamp(1.7rem,3.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.035em]"
          >
            I like building things that sit where hard problems meet real people: markets, money, security.
          </Reveal>
          <Reveal as="p" className="max-w-[58ch] text-[clamp(1rem,1.2vw,1.15rem)] text-ink-2">
            I’m a 2026 B.Tech graduate in Computer Science &amp; Business Systems from Meghnad Saha Institute
            of Technology. Over four years I moved from smart contracts and cryptography to machine learning
            and full-stack products, and I’ve shipped something end to end in each.
          </Reveal>
          <Reveal as="p" className="max-w-[58ch] text-[clamp(1rem,1.2vw,1.15rem)] text-ink-2">
            My final-year project, <strong className="text-ink">STOCK AI</strong>, forecasts stock prices with
            statistical, ML and deep-learning models, reads live financial news with FinBERT, and presents the
            results through an AI-avatar newsroom. Before that I built a DeFi lending protocol, a multi-chain
            NFT platform and an ML-powered forensics assistant for Smart India Hackathon.
          </Reveal>
          <Reveal as="p" className="max-w-[58ch] text-[clamp(1rem,1.2vw,1.15rem)] text-ink-2">
            I’m a Google Cloud Certified Associate Cloud Engineer, I use Claude Code and Codex every day, and
            I’m sharpening my DSA in C++. I’m looking for my first software engineering role, and I can start
            immediately.
          </Reveal>
          <Reveal as="dl" stagger className="mt-3 grid border-t border-line min-[601px]:grid-cols-2">
            {[
              ['Based in', 'Bengaluru · open to relocate'],
              ['Focus', 'Full-stack · ML · Web3 · Cloud'],
              ['Languages', 'C++, Python, JavaScript/TS, SQL'],
              ['Availability', PROFILE.availability],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-b border-line py-4.5 min-[601px]:odd:pr-4.5">
                <dt className="mono text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const ICONS: Record<LaneIcon, ReactNode> = {
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3M7 9l2 2-2 2M12 13h4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17l5-6 4 3 6-8 3 4" />
      <path d="M3 21h18" />
    </>
  ),
  cube: (
    <>
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z" />
      <path d="M12 11l8-4.5M12 11v9M12 11L4 6.5" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 11a3.5 3.5 0 0 1-.5 7z" />
      <path d="M12 12v4M10 14h4" />
    </>
  ),
};

export function Lanes() {
  return (
    <section className="wrap section-pad">
      <Reveal as="p" className="label">
        (02) What I do
      </Reveal>
      <SplitReveal className="h2 mb-[clamp(32px,5vw,64px)]">Four lanes, one craft.</SplitReveal>
      <Reveal stagger className="grid gap-4 min-[601px]:grid-cols-2 min-[1101px]:grid-cols-4">
        {LANES.map((lane, i) => (
          <TiltCard
            key={lane.title}
            className="card glass flex min-h-[340px] flex-col gap-4 rounded-[22px] px-6 pt-7 pb-6.5 max-[600px]:min-h-0"
            style={{ '--c': lane.color } as CSSProperties}
          >
            <span className="mono absolute top-6 right-6 text-ink-3">{String(i + 1).padStart(2, '0')}</span>
            <div className="lane-icon grid size-13.5 place-items-center rounded-2xl border border-line bg-white/5">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {ICONS[lane.icon]}
              </svg>
            </div>
            <h3 className="h3">{lane.title}</h3>
            <p className="text-[0.95rem] text-ink-2">{lane.body}</p>
            <ul className="mt-auto flex flex-wrap gap-2">
              {lane.chips.map((c) => (
                <li key={c} className="chip">
                  {c}
                </li>
              ))}
            </ul>
          </TiltCard>
        ))}
      </Reveal>
    </section>
  );
}

export function Leadership() {
  return (
    <section className="wrap section-pad">
      <Reveal as="p" className="label">
        (05) Leadership
      </Reveal>
      <Reveal stagger className="grid gap-4 min-[901px]:grid-cols-2">
        {LEADERSHIP.map((l) => (
          <div
            key={l.title}
            className="glass flex flex-col gap-3.5 rounded-[22px] p-[clamp(28px,3.4vw,44px)]"
          >
            <span className="mono text-ink-2">{l.org}</span>
            <span className="font-display text-[clamp(3rem,6vw,5.4rem)] leading-[0.9] font-extrabold tracking-[-0.05em] text-accent">
              {l.big}
            </span>
            <h3 className="h3">{l.title}</h3>
            <p className="text-ink-2">{l.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
