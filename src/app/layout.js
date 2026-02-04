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
  title: 'Pro Hunters',
  description:
    'Pro Hunters | Real Estate Solutions - Find Your Dream Home with Us'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <head>
        {/* Load Monnify SDK properly */}
        <Script
          src='https://sdk.monnify.com/plugin/monnify.js'
          strategy='beforeInteractive'
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
