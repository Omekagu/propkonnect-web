import HeaderLayout from './HeaderLayout'
import './index.scss'
import Script from 'next/script'
import { ReviewsProvider } from '@/context/ReviewsProvider'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Propnekt'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propnekt.com'
const APP_DESC =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Find your dream home.'
const APP_SLUG = APP_NAME.toLowerCase()

// ─── Schema 1: Organization ──────────────────────────────────────────────────
// Tells Google who you are, your logo, and your social profiles.
// This powers the Knowledge Panel on the right side of brand searches.
const SCHEMA_ORGANIZATION = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  url: APP_URL,
  logo: {
    '@type': 'ImageObject',
    url: `https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png`, // must be absolute URL
    width: 512,
    height: 512
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+234-000-000-0000', // ← replace with your number
    contactType: 'customer service',
    areaServed: 'NG',
    availableLanguage: 'English'
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NG',
    addressLocality: 'Lagos' // ← replace with your city
  },
  sameAs: [
    `https://facebook.com/${APP_SLUG}`,
    `https://instagram.com/${APP_SLUG}`,
    `https://twitter.com/${APP_SLUG}`,
    `https://linkedin.com/company/${APP_SLUG}`
  ]
})

const SCHEMA_WEBSITE = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: APP_NAME,
  url: APP_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${APP_URL}/search?q={search_term_string}` // ← update with your search URL pattern
    },
    'query-input': 'required name=search_term_string'
  }
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: `${APP_NAME} – Real Estate Solutions`,
    // FIX: Only one %s placeholder — the page title replaces %s
    template: `%s | ${APP_NAME}`
  },

  description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent verified properties across Nigeria easily.`,

  keywords: [
    'real estate Nigeria',
    'property for sale Lagos',
    'buy house Nigeria',
    'rent apartment Lagos',
    'property listing Nigeria',
    'luxury real estate',
    'land for sale Nigeria',
    'property management',
    'homes for rent',
    'artisan services'
  ],

  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: `${APP_NAME} Team`,
  publisher: APP_NAME,

  // ─── Open Graph ─────────────────────────────────────────────────────────────
  // This controls the preview when your link is shared on WhatsApp,
  // Facebook, LinkedIn, Slack, iMessage, etc.
  openGraph: {
    type: 'website',
    locale: 'en_NG', // Nigerian locale
    url: APP_URL,
    title: `${APP_NAME} – Real Estate Solutions`,
    description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent verified properties across Nigeria.`,
    siteName: APP_NAME,
    images: [
      {
        // FIX: absolute URL — relative URLs break WhatsApp, Slack, LinkedIn previews
        url: `https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} – Find Properties in Nigeria`,
        type: 'image/jpeg'
      }
    ]
  },

  // ─── Twitter / X Card ───────────────────────────────────────────────────────
  // summary_large_image = big banner preview. Google also reads this.
  twitter: {
    card: 'summary_large_image',
    site: `@${APP_SLUG}`,
    creator: `@${APP_SLUG}`,
    title: `${APP_NAME} – Real Estate Solutions`,
    description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent properties easily.`,
    images: [`https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png`] // FIX: absolute URL
  },

  // ─── Robots ─────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large', // allows Google to show large image previews
      'max-snippet': -1, // allows full snippet length
      'max-video-preview': -1
    }
  },

  // ─── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: 'https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png' },
      {
        url: 'https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: 'https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png',
        sizes: '32x32',
        type: 'image/png'
      }
    ],
    apple: [
      {
        url: 'https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png',
        sizes: '180x180'
      }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: 'https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png',
        color: '#000000'
      }
    ]
  },

  // ─── Manifest ───────────────────────────────────────────────────────────────
  manifest: '/site.webmanifest',

  // ─── Alternates ─────────────────────────────────────────────────────────────
  alternates: {
    canonical: APP_URL
  }
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout ({ children }) {
  return (
    <html lang='en-NG'>
      {/* Nigerian English locale */}
      <head>
        {/* Payment SDK */}
        <Script
          src='https://sdk.monnify.com/plugin/monnify.js'
          strategy='beforeInteractive'
        />

        {/* Schema: Organization — powers Knowledge Panel */}
        <Script
          id='schema-organization'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{ __html: SCHEMA_ORGANIZATION }}
        />

        {/* Schema: WebSite — powers Sitelinks + Searchbox in Google */}
        <Script
          id='schema-website'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{ __html: SCHEMA_WEBSITE }}
        />
      </head>
      <body>
        <ReviewsProvider>
          <HeaderLayout>{children}</HeaderLayout>
        </ReviewsProvider>

        {/* ── Live Chat (Smartsupp) ──────────────────────────────────────────
            Replace NEXT_PUBLIC_SMARTSUPP_KEY in your .env.local with your key.
            The chat widget is hidden on pages where a property owner chat is available.
        ──────────────────────────────────────────────────────────────────── */}
        {process.env.NEXT_PUBLIC_SMARTSUPP_KEY && (
          <Script
            id='smartsupp-chat'
            strategy='lazyOnload'
            dangerouslySetInnerHTML={{
              __html: `
                var _smartsupp = _smartsupp || {};
                _smartsupp.key = '${process.env.NEXT_PUBLIC_SMARTSUPP_KEY}';
                window.smartsupp||(function(d) {
                  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                  s=d.getElementsByTagName('script')[0];
                  c=d.createElement('script');
                  c.type='text/javascript';c.charset='utf-8';c.async=true;
                  c.src='https://www.smartsupp.com/loader.js?'+new Date().getTime();
                  s.parentNode.insertBefore(c,s);
                })(document);
              `
            }}
          />
        )}
      </body>
    </html>
  )
}
