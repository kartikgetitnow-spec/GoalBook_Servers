import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalbook.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/reader/', '/dashboard/reader/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
