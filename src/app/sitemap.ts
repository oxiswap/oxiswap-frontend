import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://oxiswap.com',
      lastModified: new Date('2024-10-19'), 
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://app.oxiswap.com/swap',
      lastModified: new Date('2024-10-19'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://app.oxiswap.com/pool',
      lastModified: new Date('2024-10-19'), 
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://app.oxiswap.com/explore/pool',
      lastModified: new Date('2024-10-19'),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
}