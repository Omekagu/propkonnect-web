/**
 * Dynamic sitemap — Next.js App Router convention.
 * Returns static pages + dynamic property/artisan URLs fetched from the API.
 * Access: https://yourdomain.com/sitemap.xml
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://estateproperties.ng'
const API      = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default async function sitemap () {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/buy`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/rent`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/artisan`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  // ── Dynamic property pages ────────────────────────────────────────────────
  let propertyUrls = []
  try {
    const res = await fetch(
      `${API}/api/properties?status=published&limit=500&select=_id,updatedAt`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = await res.json()
      const props = data.properties || data.data || []
      propertyUrls = props.map(p => ({
        url: `${BASE_URL}/property/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8
      }))
    }
  } catch {
    // Non-blocking — sitemap still returns static pages
  }

  // ── Dynamic artisan profile pages ─────────────────────────────────────────
  let artisanUrls = []
  try {
    const res = await fetch(
      `${API}/api/artisan?limit=200&select=_id,updatedAt`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = await res.json()
      const artisans = data.artisans || data.data || []
      artisanUrls = artisans.map(a => ({
        url: `${BASE_URL}/artisan/${a._id}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.6
      }))
    }
  } catch {
    // Non-blocking
  }

  return [...staticPages, ...propertyUrls, ...artisanUrls]
}
