import type { Metadata } from 'next';
import { PageHero } from '@/components/motion/PageHero';
import { Bio, Lanes, Leadership } from '@/components/sections/about/AboutSections';
import { Gallery, Timeline } from '@/components/sections/about/Journey';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Naveen Chand is: education, milestones, leadership and life off-screen.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="(01) About"
        lines={[{ text: 'Curious' }, { text: 'by default.', outline: true }]}
        sub="An army kid (#ArmyBrat) who went to school in Lucknow, studied engineering in Kolkata and now builds software in Bengaluru."
        aside={
          <div className="mono flex flex-col gap-2.5 text-ink-2 min-[901px]:items-end min-[901px]:text-right">
            <span>B.Tech CSBS · 2022–2026</span>
            <span>MSIT, Kolkata</span>
            <span>Bengaluru, India</span>
          </div>
        }
      />
      <Bio />
      <Lanes />
      <Timeline />
      <Gallery />
      <Leadership />
    </>
  );
}
