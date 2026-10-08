'use client'

import { usePathname } from 'next/navigation'
import Header from '@/component/header/Header'
import Footer from '@/component/footer/Footer'

export default function HeaderLayout ({ children }) {
  const pathname = usePathname()

  // Pages that should NOT show the global header/footer
  const hideLayout =
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/docs') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/feed')

  return (
    <>
      {!hideLayout && <Header />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
    </>
  )
}
