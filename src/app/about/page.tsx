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
        sub="Passionate about Web3 & Cybersecurity — Skilled in leveraging cutting-edge technology to secure digital landscapes and build decentralized solutions — Continuously learning and adapting in the ever-evolving tech world."
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
