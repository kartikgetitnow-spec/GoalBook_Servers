import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalbook.app';

  const routes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/sign-in',
    '/sign-up',
    '/dashboard',
    '/library',
    '/ai-assistant',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/dashboard' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/pricing' || route === '/dashboard' ? 0.8 : 0.6,
  }));
}
