import HeaderLayout from './HeaderLayout'
import './index.scss'
import Script from 'next/script'
import { ReviewsProvider } from '@/context/ReviewsProvider'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://propnect.com'),

  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME} – Real Estate Solutions`,
    template: '%s | %s',
    append: process.env.NEXT_PUBLIC_APP_NAME
  },

  description: `${process.env.NEXT_PUBLIC_APP_DESCRIPTION} Find your dream home with ${process.env.NEXT_PUBLIC_APP_NAME}. Buy, sell or rent properties easily.`,

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

  authors: [{ name: process.env.NEXT_PUBLIC_APP_NAME }],

  creator: `${process.env.NEXT_PUBLIC_APP_NAME} Team`,

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: `${process.env.NEXT_PUBLIC_APP_NAME} – Real Estate Solutions`,
    description: `${process.env.NEXT_PUBLIC_APP_DESCRIPTION} Find your dream home with ${process.env.NEXT_PUBLIC_APP_NAME}. Buy, sell or rent properties easily.`,
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
    images: [
      {
        url: '/images/seo-banner.jpg', // put a real banner image here
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_APP_NAME} Real Estate`
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: `${process.env.NEXT_PUBLIC_APP_NAME} – Real Estate Solutions`,
    description: `${process.env.NEXT_PUBLIC_APP_DESCRIPTION} Find your dream home with ${process.env.NEXT_PUBLIC_APP_NAME}. Buy, sell or rent properties easily.`,
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: process.env.NEXT_PUBLIC_APP_NAME,
              url: process.env.NEXT_PUBLIC_APP_URL,
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              sameAs: [
                `https://facebook.com/${process.env.NEXT_PUBLIC_APP_NAME.toLowerCase()}`,
                `https://instagram.com/${process.env.NEXT_PUBLIC_APP_NAME.toLowerCase()}`,
                `https://twitter.com/${process.env.NEXT_PUBLIC_APP_NAME.toLowerCase()}`
              ]
            })
          }}
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
