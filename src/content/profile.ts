export const PROFILE = {
  name: 'Naveen Chand',
  firstName: 'Naveen',
  lastName: 'Chand',
  role: 'Software Engineer',
  headline: 'Software engineer building across full-stack, machine learning & Web3.',
  email: 'naveenchand01042002@gmail.com',
  location: 'Bengaluru, India',
  timezone: 'Asia/Kolkata',
  availability: 'Immediate',
  lookingFor: 'Software Engineer · SDE-1 · Full-stack · Cloud',
  resume: '/Naveen_Chand_Resume.pdf',
  photo: { src: '/images/naveen.jpg', alt: 'Portrait of Naveen Chand in a navy suit and tie' },
  education: {
    degree: 'B.Tech, Computer Science & Business Systems',
    school: 'Meghnad Saha Institute of Technology',
    city: 'Kolkata',
    years: '2022–2026',
    cgpa: '7.66',
  },
  rotor: ['AI stock forecasting', 'smart contracts', 'full-stack products', 'cloud-native systems'],
  socials: [
    { name: 'LinkedIn', handle: '/in/naveenchand01', href: 'https://www.linkedin.com/in/naveenchand01/' },
    { name: 'GitHub', handle: '@naveenchand01', href: 'https://github.com/naveenchand01' },
    { name: 'X / Twitter', handle: '@_Naveen_Chand', href: 'https://x.com/_Naveen_Chand' },
    { name: 'Instagram', handle: '@naveen__chand_', href: 'https://www.instagram.com/naveen__chand_/' },
  ],
} as const;

export const STATS = [
  {
    value: 4,
    decimals: 0,
    suffix: '',
    label: 'End-to-end projects shipped, across ML, DeFi, NFTs and forensics',
  },
  { value: 8, decimals: 0, suffix: '', label: 'Certifications, including Google Cloud ACE' },
  { value: 7000, decimals: 0, suffix: '+', label: 'Developers reached through GDG Kolkata workshops' },
  { value: 7.66, decimals: 2, suffix: '', label: 'CGPA, B.Tech in Computer Science & Business Systems' },
] as const;

export const MARQUEE = [
  'React',
  'TypeScript',
  'Python',
  'Solidity',
  'TensorFlow',
  'Node.js',
  'Google Cloud',
  'C++',
];
