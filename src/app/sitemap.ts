import type { MetadataRoute } from 'next';
import { ROUTES } from '@/content/routes';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(ROUTES).map((r) => ({
    url: `${SITE_URL}${r.href === '/' ? '' : r.href}`,
    changeFrequency: 'monthly',
    priority: r.key === 'home' ? 1 : 0.8,
  }));
}
