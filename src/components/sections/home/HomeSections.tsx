import { Counter, ParallaxImage, Reveal, ScrubText } from '@/components/motion/primitives';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { PillAnchor, PillLink } from '@/components/ui/Pill';
import { STATS } from '@/content/profile';
import { FEATURED_PROJECT } from '@/content/projects';

export function Intro() {
  return (
    <section id="intro" className="wrap section-pad">
      <Reveal as="p" className="label">
        (01) Intro
      </Reveal>
      <ScrubText className="statement">
        I turn ideas into working software: <em>LSTM models</em> that read the market,{' '}
        <em>smart contracts</em> that move value without middlemen, and dashboards people actually enjoy
        using. I ship end to end and sweat the details.
      </ScrubText>
    </section>
  );
}

export function FeaturedProject() {
  const p = FEATURED_PROJECT;
  return (
    <section className="wrap section-pad-tight">
      <div className="mb-[clamp(32px,5vw,64px)] flex flex-wrap items-end justify-between gap-5">
        <Reveal as="p" className="label !mb-0">
          (02) Featured work
        </Reveal>
        <Reveal>
          <TransitionLink href="/work" className="link-arrow">
            All projects <span>→</span>
          </TransitionLink>
        </Reveal>
      </div>
      <Reveal
        as="article"
        className="glass grid overflow-hidden rounded-[30px] bg-[rgb(10_10_16/0.72)] min-[901px]:grid-cols-[1.25fr_1fr]"
      >
        <div className="group relative min-h-[260px] bg-[#070b10] min-[901px]:min-h-[420px]">
          {p.screenshot && (
            <ParallaxImage
              src={p.screenshot.src}
              alt={p.screenshot.alt}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className="!absolute inset-0"
              imgClassName="object-top"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-60% to-[rgb(10_10_16/0.9)] min-[901px]:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center gap-5 p-[clamp(28px,4vw,56px)]">
          <span className="mono text-ink-2">
            {p.context} · {p.period} · Live
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.9] font-extrabold tracking-[-0.045em]">
            {p.title}
          </h2>
          <p className="text-ink-2">
            An AI stock-forecasting and news platform. It blends ARIMA/SARIMA, XGBoost and LSTM forecasts with
            FinBERT sentiment on live financial news, and presents it all through an AI-avatar newsroom and
            TradingView-style dashboards.
          </p>
          <ul className="flex flex-wrap gap-2">
            {['Python', 'TensorFlow', 'LSTM', 'XGBoost', 'FinBERT', 'React', 'TypeScript', 'Node.js'].map(
              (t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ),
            )}
          </ul>
          <div className="mt-2 flex flex-wrap gap-3">
            {p.links.live && (
              <PillAnchor href={p.links.live} accent>
                Visit live site ↗
              </PillAnchor>
            )}
            <PillLink href="/work">Case study</PillLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Stats() {
  return (
    <section className="wrap section-pad">
      <Reveal as="p" className="label">
        (03) In numbers
      </Reveal>
      <Reveal stagger className="grid grid-cols-2 border-t border-line min-[901px]:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} className="stat__num" />
            <span className="max-w-[20ch] text-ink-2">{s.label}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
