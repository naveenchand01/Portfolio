import { PillLink } from '@/components/ui/Pill';

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[80svh] flex-col items-start justify-center gap-6 pt-35">
      <p className="label">404</p>
      <h1 className="phero__title">
        Lost in
        <br />
        <span className="outline-text">the liquid.</span>
      </h1>
      <p className="max-w-[40ch] text-ink-2">That page doesn’t exist. Let’s get you back somewhere useful.</p>
      <PillLink href="/" accent>
        Back home →
      </PillLink>
    </section>
  );
}
