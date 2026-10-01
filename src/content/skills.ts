export type SkillGroup = { title: string; items: string[] };

export const SKILL_GROUPS: SkillGroup[] = [
  { title: 'Languages', items: ['C++', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'Solidity'] },
  {
    title: 'Frontend & backend',
    items: ['React', 'Tailwind CSS', 'Node.js', 'Django', 'Firebase', 'Supabase'],
  },
  {
    title: 'ML & AI',
    items: [
      'TensorFlow',
      'scikit-learn',
      'Pandas',
      'NumPy',
      'LSTM',
      'XGBoost',
      'ARIMA / SARIMA',
      'FinBERT',
      'AWS Bedrock',
      'Vertex AI',
    ],
  },
  {
    title: 'Blockchain',
    items: ['Solidity', 'Hardhat', 'Ethereum', 'Polygon', 'Web3.js', 'Chainlink', 'IPFS'],
  },
  {
    title: 'Security',
    items: ['Network security', 'SIEM', 'Intrusion detection', 'Wireshark', 'Digital forensics'],
  },
  {
    title: 'Data, cloud & tools',
    items: [
      'Google Cloud',
      'AWS',
      'MySQL',
      'SQLite',
      'MongoDB',
      'Git',
      'Linux',
      'Jira',
      'Claude Code',
      'Codex',
    ],
  },
];

/** Rings of the orbit on the Stack page. `radius` is a % of the orbit's width. */
export const ORBIT_RINGS = [
  { radius: 21, duration: 26, reverse: false, items: ['Python', 'C++', 'JavaScript', 'TypeScript', 'SQL'] },
  {
    radius: 32,
    duration: 40,
    reverse: true,
    items: ['React', 'Node.js', 'TensorFlow', 'Django', 'Firebase', 'Supabase', 'Tailwind'],
  },
  {
    radius: 44,
    duration: 60,
    reverse: false,
    items: ['Solidity', 'Hardhat', 'Google Cloud', 'AWS', 'MongoDB', 'Git', 'Linux', 'Chainlink', 'IPFS'],
  },
];

export type LaneIcon = 'monitor' | 'chart' | 'cube' | 'cloud';

export const LANES: { title: string; color: string; icon: LaneIcon; body: string; chips: string[] }[] = [
  {
    title: 'Full-stack web',
    color: '#ffb547',
    icon: 'monitor',
    body: 'React and TypeScript front ends with Node.js, Django, Firebase or Supabase behind them. Dashboards, auth and real-time data.',
    chips: ['React', 'Node.js', 'Tailwind', 'Django'],
  },
  {
    title: 'Machine learning',
    color: '#ff5d8f',
    icon: 'chart',
    body: 'Time-series forecasting and NLP, from ARIMA/SARIMA baselines to LSTM and XGBoost, plus FinBERT sentiment on live news.',
    chips: ['TensorFlow', 'scikit-learn', 'Pandas'],
  },
  {
    title: 'Web3 & DeFi',
    color: '#8a6bff',
    icon: 'cube',
    body: 'Solidity contracts with Hardhat, Chainlink oracles and IPFS storage: lending pools, royalties, lazy minting and auctions.',
    chips: ['Solidity', 'Hardhat', 'Chainlink'],
  },
  {
    title: 'Cloud & security',
    color: '#00d1c1',
    icon: 'cloud',
    body: 'Google Cloud certified, comfortable on AWS, and trained in network security, SIEM, intrusion detection and digital forensics.',
    chips: ['GCP', 'AWS', 'Wireshark'],
  },
];
