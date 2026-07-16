import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Keeps bots out of your admin dashboard
    },
    sitemap: 'https://torpedo-schwefel.vercel.app/sitemap.xml',
  }
}