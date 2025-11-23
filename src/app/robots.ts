import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = 'https://your-domain.com/sitemap.xml'; // Replace with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/'],
    },
    sitemap: sitemapUrl,
  };
}
