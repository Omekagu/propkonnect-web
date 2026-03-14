import HeaderLayout from './HeaderLayout'
import './index.scss'
import Script from 'next/script'
import { ReviewsProvider } from '@/context/ReviewsProvider'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'propnekt'
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL  || 'https://propnekt.com'
const APP_DESC = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Find your dream home.'
const APP_SLUG = APP_NAME.toLowerCase()

const SCHEMA_ORG = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  sameAs: [
    `https://facebook.com/${APP_SLUG}`,
    `https://instagram.com/${APP_SLUG}`,
    `https://twitter.com/${APP_SLUG}`
  ]
})

export const metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: `${APP_NAME} – Real Estate Solutions`,
    template: '%s | %s',
    append: APP_NAME
  },

  description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent properties easily.`,

  keywords: [
    'real estate',
    'property for sale',
    'buy house',
    'rent house',
    'real estate Nigeria',
    'property listing',
    'apartments',
    'homes',
    'artisans',
    'property management',
    'luxury real estate'
  ],

  authors: [{ name: APP_NAME }],

  creator: `${APP_NAME} Team`,

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: `${APP_NAME} – Real Estate Solutions`,
    description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent properties easily.`,
    siteName: APP_NAME,
    images: [
      {
        url: '/images/seo-banner.jpg',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} Real Estate`
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} – Real Estate Solutions`,
    description: `${APP_DESC} Find your dream home with ${APP_NAME}. Buy, sell or rent properties easily.`,
    images: ['/images/seo-banner.jpg']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <head>
        <Script
          src='https://sdk.monnify.com/plugin/monnify.js'
          strategy='beforeInteractive'
        />

        <Script
          id='schema-org'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{ __html: SCHEMA_ORG }}
        />
      </head>
      <body>
        <ReviewsProvider>
          <HeaderLayout>{children}</HeaderLayout>
        </ReviewsProvider>
      </body>
    </html>
  )
}
