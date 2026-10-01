export type VisualScene = 'stock' | 'nft' | 'defi' | 'forensics';

export type Project = {
  slug: 'stock-ai' | 'nft-vault' | 'defi-vault' | 'cyber-trigger';
  title: string;
  tagline: string;
  context: string;
  period: string;
  summary: string;
  highlights: string[];
  tech: string[];
  visual: VisualScene;
  screenshot?: { src: string; alt: string };
  links: { live?: string; repo?: string };
  featured?: boolean;
};

const GITHUB = 'https://github.com/naveenchand01';

export const PROJECTS: Project[] = [
  {
    slug: 'stock-ai',
    title: 'STOCK AI',
    tagline: 'AI-driven stock forecasting & an avatar-presented market newsroom.',
    context: 'Final-year project',
    period: 'Jul 2026 – present',
    summary:
      'The platform predicts prices with statistical, machine-learning and deep-learning models and analyzes real-time financial news alongside them.',
    highlights: [
      'ARIMA/SARIMA baselines compared against XGBoost and LSTM forecasts',
      'FinBERT sentiment scoring on live headlines',
      'AI-avatar news briefings, technical indicators and TradingView charts',
    ],
    tech: [
      'Python',
      'TensorFlow',
      'scikit-learn',
      'FinBERT',
      'Yahoo Finance API',
      'React',
      'TypeScript',
      'Node.js',
      'Tailwind',
    ],
    visual: 'stock',
    screenshot: {
      src: '/images/stockai.jpg',
      alt: 'STOCK AI landing page: AI-driven avatar system for real-time stock market news',
    },
    links: { live: 'https://stock-ai-snowy.vercel.app/', repo: GITHUB },
    featured: true,
  },
  {
    slug: 'nft-vault',
    title: 'NFT Vault',
    tagline: 'Decentralized asset management for creators.',
    context: 'Open source · Web3',
    period: 'Mar 2025',
    summary:
      'An open-source platform where artists mint, manage and monetize NFTs, with royalties enforced on-chain and media authenticity backed by decentralized storage.',
    highlights: [
      'Multi-chain deployment on Ethereum and Polygon',
      'Lazy minting, auctions and creator dashboards',
      'IPFS-backed provenance tracking for every asset',
    ],
    tech: ['Solidity', 'Ethereum', 'Polygon', 'Web3.js', 'IPFS', 'Chainlink', 'Hardhat', 'React'],
    visual: 'nft',
    links: { repo: GITHUB },
  },
  {
    slug: 'defi-vault',
    title: 'DeFi Vault',
    tagline: 'Lend, borrow and earn with no intermediaries.',
    context: 'DeFi protocol',
    period: 'Dec 2024',
    summary:
      'A decentralized lending and yield platform where smart contracts automate collateral, interest and liquidity, with real-time analytics on top.',
    highlights: [
      'Collateralized loans with dynamic interest rates',
      'Yield-farming pools for liquidity providers',
      'Chainlink oracle price feeds to keep liquidity healthy and limit risk',
    ],
    tech: ['Solidity', 'Ethereum', 'Chainlink', 'Web3.js', 'React', 'Hardhat', 'IPFS'],
    visual: 'defi',
    links: { repo: GITHUB },
  },
  {
    slug: 'cyber-trigger',
    title: 'Cyber Trigger',
    tagline: 'An ML-powered digital forensics assistant.',
    context: 'Smart India Hackathon',
    period: 'Sep 2024',
    summary:
      'Built for SIH, it speeds up digital forensic investigations by automating how incident data is collected, analyzed and reported, so responders spend less time and make fewer mistakes.',
    highlights: [
      'Evidence import from disk images (libewf, pytsk3)',
      'AI/ML anomaly detection across collected artifacts',
      'Investigator-friendly interface with full reporting',
    ],
    tech: ['Python', 'pytsk3', 'libewf', 'Wireshark', 'Solidity', 'Hardhat'],
    visual: 'forensics',
    links: { repo: GITHUB },
  },
];

export const FEATURED_PROJECT: Project = PROJECTS.find((p) => p.featured) ?? (PROJECTS[0] as Project);
