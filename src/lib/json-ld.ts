import { PROFILE } from '@/content/profile';
import { SITE_URL } from './site';

/** schema.org Person data so search engines understand who the site is about. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: PROFILE.role,
    email: `mailto:${PROFILE.email}`,
    url: SITE_URL,
    image: `${SITE_URL}${PROFILE.photo.src}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: PROFILE.education.school },
    knowsAbout: [
      'Software Engineering',
      'React',
      'TypeScript',
      'Machine Learning',
      'Solidity',
      'Google Cloud',
    ],
    sameAs: PROFILE.socials.map((s) => s.href),
  };
}
