import type { Metadata } from 'next';
import { PageHero } from '@/components/motion/PageHero';
import { Marquee } from '@/components/motion/primitives';
import { Certifications, Orbit, Toolbox } from '@/components/sections/stack/StackSections';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'Languages, frameworks, platforms and certifications of Naveen Chand, including Google Cloud Associate Cloud Engineer.',
  alternates: { canonical: '/stack' },
};

export default function StackPage() {
  return (
    <>
      <PageHero
        label="(03) Stack"
        lines={[{ text: 'The' }, { text: 'stack.', outline: true }]}
        sub="The languages, frameworks and platforms I’ve shipped with, plus the certifications that back them up."
        aside={<Orbit />}
        gridClassName="grid w-full items-center gap-10 min-[901px]:grid-cols-2"
      />
      <Marquee items={['Build', 'Train', 'Deploy', 'Secure', 'Repeat']} reverse />
      <Toolbox />
      <Certifications />
    </>
  );
}
