export type Photo = {
  src: string;
  alt: string;
  caption: string;
  date: string;
  width: number;
  height: number;
  position?: string;
};

export const GALLERY: Photo[] = [
  {
    src: '/images/team.jpg',
    alt: 'Naveen with his project team holding bound reports outside the CSE Computer Hub',
    caption: 'Project submission day, with the team',
    date: 'Jul 2026',
    width: 480,
    height: 639,
  },
  {
    src: '/images/candid.jpg',
    alt: 'Naveen laughing on a college balcony',
    caption: 'Done and dusted',
    date: 'Jul 2026',
    width: 344,
    height: 450,
  },
  {
    src: '/images/iit-ism.jpg',
    alt: 'Naveen at the gate of IIT (ISM) Dhanbad',
    caption: 'Visiting IIT (ISM) Dhanbad',
    date: 'Feb 2023',
    width: 512,
    height: 600,
  },
  {
    src: '/images/temple.jpg',
    alt: 'Naveen sitting in front of a carved stone temple',
    caption: 'Weekend wandering',
    date: 'Feb 2023',
    width: 496,
    height: 600,
  },
  {
    src: '/images/naveen.jpg',
    alt: 'Naveen Chand portrait',
    caption: 'Ready for day one',
    date: '2026',
    width: 800,
    height: 1200,
    position: '50% 20%',
  },
];
