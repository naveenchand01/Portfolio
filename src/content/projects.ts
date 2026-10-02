export type VisualScene = 'stock' | 'nft' | 'defi' | 'forensics' | 'movies' | 'restaurant';

export type Project = {
  slug: 'stock-ai' | 'nft-vault' | 'defi-vault' | 'cyber-trigger' | 'movie-recommender' | 'restaurant-site';
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
  /** Text for the live link; defaults to "Live site". */
  liveLabel?: string;
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
  {
    slug: 'movie-recommender',
    title: 'Movie Recommender',
    tagline: 'Content-based movie suggestions from a single favourite title.',
    context: 'Machine learning',
    period: 'Jan 2024',
    summary:
      'A recommendation system that suggests 30 similar films from a dataset of 4,803 movies, using each film’s genres, keywords, tagline, cast and director.',
    highlights: [
      'TF-IDF vectors built from five combined text features',
      'Cosine similarity across a 4,803 × 4,803 matrix to rank matches',
      'Fuzzy title matching with difflib, plus exploratory charts of ratings and popularity',
    ],
    tech: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'seaborn', 'Google Colab'],
    visual: 'movies',
    links: {
      live: 'https://colab.research.google.com/github/naveenchand01/Movie-Recommendation-Project/blob/main/movie_recommendation_system_visualization_analysis.ipynb',
      repo: `${GITHUB}/Movie-Recommendation-Project`,
    },
    liveLabel: 'Open in Colab',
  },
  {
    slug: 'restaurant-site',
    title: 'Restaurant Website',
    tagline: 'A one-page, animated website for an Indian restaurant.',
    context: 'Front-end',
    period: '2023',
    summary:
      'A single-page restaurant site with a filterable menu, gallery, table booking hours, chef and testimonial sliders, FAQs, a blog and a newsletter footer.',
    highlights: [
      'Menu filtered by breakfast, lunch and dinner with MixItUp',
      'Swiper sliders for chefs and reviews, and a Fancybox gallery',
      'Smooth scrolling and parallax effects with GSAP ScrollTrigger',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'jQuery', 'GSAP', 'Swiper', 'Netlify'],
    visual: 'restaurant',
    screenshot: {
      src: '/images/restaurant.jpg',
      alt: 'Restaurant website hero: "Welcome To Our India Restaurant" next to a sushi photo',
    },
    links: { live: 'https://restaurant01111.netlify.app/', repo: `${GITHUB}/restaurant` },
  },
];

export const FEATURED_PROJECT: Project = PROJECTS.find((p) => p.featured) ?? (PROJECTS[0] as Project);
