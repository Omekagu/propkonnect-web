// app/sitemap.js
// ─────────────────────────────────────────────────────────────────────────────
// FIX: During Netlify builds, APP_URL is not reachable, so fetching from
// our own API returns an HTML error page → JSON.parse crashes the build.
// Solution: query the database directly instead of calling our own API.
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propnekt.com'

// ── Import your DB client directly (pick one, uncomment it) ─────────────────
// import { db } from '@/lib/db'           // Prisma / Drizzle
// import Listing from '@/models/Listing'  // Mongoose
// import { createClient } from '@/lib/supabase'

async function getAllListings () {
  // ── Prisma ───────────────────────────────────────────────────────────────
  // return db.listing.findMany({ select: { id: true, updatedAt: true }, where: { published: true } })

  // ── Mongoose ─────────────────────────────────────────────────────────────
  // await connectDB()
  // return Listing.find({ published: true }).select('_id updatedAt').lean()

  // ── Supabase ─────────────────────────────────────────────────────────────
  // const supabase = createClient()
  // const { data } = await supabase.from('listings').select('id, updated_at').eq('published', true)
  // return data ?? []

  // Fallback — remove once you wire up a DB call above
  return []
}

export default async function sitemap () {
  let listings = []
  try {
    listings = await getAllListings()
  } catch (err) {
    // Don't crash the build if DB is unavailable — static pages still render
    console.warn('[sitemap] Could not fetch listings:', err.message)
  }

  const listingUrls = listings.map(listing => ({
    url: `${APP_URL}/listings/${listing.id || listing._id}`,
    lastModified: new Date(
      listing.updatedAt || listing.updated_at || Date.now()
    ),
    changeFrequency: 'daily',
    priority: 0.8
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
