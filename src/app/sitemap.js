// app/sitemap.js
// ─────────────────────────────────────────────────────────────────────────────
// Next.js auto-generates /sitemap.xml from this file.
// Submit the URL https://propnekt.com/sitemap.xml to Google Search Console.
// This tells Google every page that exists on your site, prioritising listings.
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propnekt.com'

export default async function sitemap () {
  // Fetch all listing IDs — replace with your actual query
  const listings = await fetch(`${APP_URL}/api/listings/ids`).then(r =>
    r.json()
  )

  const listingUrls = listings.map(listing => ({
    url: `${APP_URL}/listings/${listing.id}`,
    lastModified: new Date(listing.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8 // listings are high priority
  }))

  // Static pages
  const staticPages = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0 // homepage = highest priority
    },
    {
      url: `${APP_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: `${APP_URL}/listings?purpose=sale`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${APP_URL}/listings?purpose=rent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${APP_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    }
  ]

  return [...staticPages, ...listingUrls]
}
