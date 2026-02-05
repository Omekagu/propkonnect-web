import HeaderLayout from './HeaderLayout'
import { Geist, Geist_Mono } from 'next/font/google'
import './index.scss'
import Script from 'next/script'
import { ReviewsProvider } from '@/context/ReviewsProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata = {
  metadataBase: new URL('https://propnect.com'), // change to your real domain

  title: {
    default: 'Propnect – Real Estate Solutions',
    template: '%s | Propnect'
  },

  description:
    'Find your dream home with Propnect. Trusted real estate platform for buying, selling, renting properties and connecting you to artisans with ease.',

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

  authors: [{ name: 'Propnect' }],

  creator: 'Propnect',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://propnect.com',
    title: 'Propnect – Real Estate Solutions',
    description:
      'Find your dream home with Propnect. Buy, sell or rent properties easily.',
    siteName: 'Propnect',
    images: [
      {
        url: '/images/seo-banner.jpg', // put a real banner image here
        width: 1200,
        height: 630,
        alt: 'Propnect Real Estate'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Propnect – Real Estate Solutions',
    description:
      'Find your dream home with Propnect. Buy, sell or rent properties easily.',
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
              name: 'Pro Hunters',
              url: 'https://prohunters.com',
              logo: 'https://prohunters.com/logo.png',
              sameAs: [
                'https://facebook.com/prohunters',
                'https://instagram.com/prohunters',
                'https://twitter.com/prohunters'
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReviewsProvider>
          <HeaderLayout>{children}</HeaderLayout>
        </ReviewsProvider>
      </body>
    </html>
  )
}
