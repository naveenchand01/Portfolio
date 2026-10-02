import type { Metadata } from 'next';
import { PageHero } from '@/components/motion/PageHero';
import { Reveal, SplitReveal } from '@/components/motion/primitives';
import { ProjectScroller } from '@/components/sections/work/ProjectScroller';
import { PROJECTS } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected projects by Naveen Chand: STOCK AI, NFT Vault, DeFi Vault, Cyber Trigger, Movie Recommender and a restaurant website.',
  alternates: { canonical: '/work' },
};

const STEPS = [
  {
    title: 'Research the problem',
    body: 'Start from the papers and the data. For STOCK AI that meant benchmarking classical ARIMA against ML and deep-learning models before writing any UI.',
  },
  {
    title: 'Build the core',
    body: 'Get the hard part right first, whether that’s a forecasting pipeline, a lending contract or an evidence parser, then wrap it in clean APIs.',
  },
  {
    title: 'Ship & polish',
    body: 'Deploy early (Vercel, GCP, testnets), get feedback and keep iterating on the details people notice.',
  },
];

export default function WorkPage() {
  return (
    <>
      <PageHero
        label="(02) Work"
        lines={[{ text: 'Selected' }, { text: 'work.', outline: true }]}
        sub="Six projects, each shipped end to end: models, contracts, interfaces and the glue in between."
        aside={
          <div className="flex flex-col gap-2.5 min-[901px]:items-end min-[901px]:text-right">
            <span className="font-display text-[clamp(3rem,7vw,6rem)] leading-none font-extrabold tracking-[-0.05em] text-accent">
              ({String(PROJECTS.length).padStart(2, '0')})
            </span>
            <span className="mono text-ink-3">Scroll to browse →</span>
          </div>
        }
      />
      <ProjectScroller />
      <section className="wrap section-pad">
        <Reveal as="p" className="label">
          How I work
        </Reveal>
        <SplitReveal className="h2">Research. Build. Ship.</SplitReveal>
        <Reveal stagger className="mt-16 grid gap-4 min-[901px]:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="glass flex min-h-[280px] flex-col gap-3.5 rounded-[22px] px-7 py-8.5"
            >
              <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="text-ink-2">{s.body}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
