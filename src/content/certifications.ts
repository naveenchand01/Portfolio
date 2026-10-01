export type Certification = { name: string; issuer: string; year?: string };

export const CERTIFICATIONS: Certification[] = [
  { name: 'Associate Cloud Engineer', issuer: 'Google Cloud', year: '2025' },
  { name: 'Google Cybersecurity Specialization', issuer: 'Google' },
  { name: 'Google AI Essentials', issuer: 'Google' },
  { name: 'Prompt Design in Vertex AI', issuer: 'Google Cloud' },
  { name: 'Develop GenAI Apps with Gemini and Streamlit', issuer: 'Google Cloud' },
  { name: 'Introduction to Generative AI', issuer: 'Google Cloud' },
  { name: 'ChatGPT Prompt Engineering for Developers', issuer: 'DeepLearning.AI' },
  { name: 'Blockchain Security', issuer: 'Certification' },
];

export const ACE_CERTIFICATE = {
  src: '/images/ace-certificate.jpg',
  alt: 'Google Cloud Certified Associate Cloud Engineer certificate issued to Naveen Chand, September 14, 2025',
  width: 1000,
  height: 772,
};
