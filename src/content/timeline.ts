export type TimelineItem = { period: string; title: string; body: string; tag?: string };

export const TIMELINE: TimelineItem[] = [
  {
    period: '2021',
    title: 'Class XII, Army Public School',
    body: 'Completed CBSE Class XII at Army Public School, Nehru Road, Lucknow, scoring 89.6%.',
  },
  {
    period: '2022',
    title: 'Started B.Tech at MSIT, Kolkata',
    body: 'Computer Science & Business Systems, with coursework in blockchain, cybersecurity, AI, ML, networking and databases.',
  },
  {
    period: 'Sep 2024',
    title: 'Smart India Hackathon: Cyber Trigger Tool',
    body: 'Built an ML-powered digital forensics assistant that automates evidence collection, anomaly detection and reporting.',
    tag: 'Hackathon',
  },
  {
    period: 'Sep 2024',
    title: 'Google Developer Group Kolkata',
    body: 'Organized events and ran workshops that reached more than 7,000 developers. Joined the Phoenix Cultural Society to lead technical and soft-skills training.',
    tag: 'Community',
  },
  {
    period: 'Dec 2024 – Mar 2025',
    title: 'DeFi Vault & NFT Vault',
    body: 'Shipped a decentralized lending and yield protocol, then a multi-chain NFT platform with royalties, lazy minting and IPFS provenance.',
    tag: 'Web3',
  },
  {
    period: 'Sep 2025',
    title: 'Google Cloud Certified: Associate Cloud Engineer',
    body: 'Earned the Associate Cloud Engineer certification, valid through September 2028.',
    tag: 'Certification',
  },
  {
    period: 'Jul 2026',
    title: 'STOCK AI & graduation',
    body: 'Submitted my final-year project, STOCK AI, and graduated. The platform is live and still evolving.',
    tag: 'Now',
  },
];

export const LEADERSHIP = [
  {
    org: 'Google Developer Group Kolkata · Sep–Oct 2024',
    big: '7,000+',
    title: 'Developers reached',
    body: 'Organized events and ran hands-on workshops for the Kolkata developer community.',
  },
  {
    org: 'Phoenix Cultural Society, MSIT · Sep 2024 – Jul 2026',
    big: '2 yrs',
    title: 'Training peers',
    body: 'Ran online and offline technical and soft-skills training sessions for fellow students.',
  },
];
