import { Marquee } from '@/components/motion/primitives';
import { ExploreList } from '@/components/sections/home/ExploreList';
import { HomeHero } from '@/components/sections/home/HomeHero';
import { FeaturedProject, Intro, Stats } from '@/components/sections/home/HomeSections';
import { MARQUEE } from '@/content/profile';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Marquee items={MARQUEE} label="Technologies I work with" />
      <Intro />
      <FeaturedProject />
      <Stats />
      <ExploreList />
    </>
  );
}
