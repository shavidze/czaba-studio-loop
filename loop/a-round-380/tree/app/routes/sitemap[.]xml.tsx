import type { LoaderFunctionArgs } from '@remix-run/node';
import { apiClient } from '~/services/api/client';

export async function loader({ request }: LoaderFunctionArgs) {
  const baseUrl = 'https://czaba.store';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/collections/music', priority: '0.9', changefreq: 'daily' },
    { url: '/collections/sfx', priority: '0.9', changefreq: 'daily' },
    { url: '/collections/presets', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/hire-us', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/cookies', priority: '0.3', changefreq: 'yearly' },
  ];

  let productUrls: { url: string; priority: string; changefreq: string }[] = [];

  try {
    const result = await apiClient.getProducts({ pageSize: 100 });
    productUrls = result.items.map((product) => ({
      url: `/products/${product.handle}`,
      priority: '0.8',
      changefreq: 'weekly',
    }));
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  const allUrls = [...staticPages, ...productUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
