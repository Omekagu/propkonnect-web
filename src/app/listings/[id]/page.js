// app/listings/[id]/page.js
// ─────────────────────────────────────────────────────────────────────────────
// This is what makes individual property listings show up in Google with:
//  • Their own title and description snippet
//  • The property photo as the link preview image
//  • Rich result data (price, location, type)
//  • Breadcrumbs like: Propnekt > Lagos > 3-bed apartment
// ─────────────────────────────────────────────────────────────────────────────

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Propnekt'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propnekt.com'

// ─── Dynamic metadata per listing ─────────────────────────────────────────
// Next.js calls this at build time (SSG) or request time (SSR).
// Google uses the og:image as the preview image next to search results.
export async function generateMetadata ({ params }) {
  const listing = await fetchListing(params.id) // your data fetching function

  const title = `${listing.title} in ${listing.city} | ${APP_NAME}`
  const description = `${listing.type} for ${listing.purpose} in ${
    listing.city
  }. ₦${listing.price.toLocaleString()}. ${listing.bedrooms} beds, ${
    listing.bathrooms
  } baths. ${listing.description?.slice(0, 120)}...`
  const imageUrl = listing.images?.[0] || `${APP_URL}/images/seo-banner.jpg`
  const pageUrl = `${APP_URL}/listings/${params.id}`

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      images: [
        {
          url: imageUrl, // the property photo — makes Google show it next to your link
          width: 1200,
          height: 630,
          alt: listing.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    }
  }
}

// ─── Page Component ───────────────────────────────────────────────────────
export default async function ListingPage ({ params }) {
  const listing = await fetchListing(params.id)

  // Schema: PropertyListing — makes Google show rich result cards
  // (price, location, property type) directly in search results
  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'PropertyListing',
    name: listing.title,
    description: listing.description,
    url: `${APP_URL}/listings/${params.id}`,
    datePosted: listing.createdAt,
    image: listing.images,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.state,
      addressCountry: 'NG'
    },
    numberOfRooms: listing.bedrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: listing.area,
      unitCode: 'MTK' // square metres
    }
  }

  // Schema: BreadcrumbList — makes Google show navigation path below your
  // result link (e.g. "Propnekt > Lagos > For Sale > 3-bed Apartment")
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: APP_NAME,
        item: APP_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: listing.city,
        item: `${APP_URL}/listings?city=${listing.city.toLowerCase()}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.purpose === 'sale' ? 'For Sale' : 'For Rent',
        item: `${APP_URL}/listings?purpose=${listing.purpose}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: listing.title,
        item: `${APP_URL}/listings/${params.id}`
      }
    ]
  }

  return (
    <>
      {/* Inject schemas into the page <head> */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Your actual listing page UI here */}
      <main>
        <h1>{listing.title}</h1>
        {/* ... */}
      </main>
    </>
  )
}

async function fetchListing (id) {
  // Replace with your actual API call
  const res = await fetch(`${APP_URL}/api/listings/${id}`, {
    next: { revalidate: 3600 }
  })
  return res.json()
}
