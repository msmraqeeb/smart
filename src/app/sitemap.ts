import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/data';

const BASE_URL = 'https://your-domain.com'; // Replace with your actual domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Add product pages
  const products = await getProducts();
  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.createdAt ? product.createdAt.toDate() : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Add category pages
  const categories = await getCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${BASE_URL}/products?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
