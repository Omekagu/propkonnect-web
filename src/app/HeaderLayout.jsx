'use client'

import { usePathname } from 'next/navigation'
import Header from '@/component/header/Header'
import Footer from '@/component/footer/Footer'

export default function HeaderLayout ({ children }) {
  const pathname = usePathname()

  // Pages with their own full-screen nav or no chrome needed
  const hideLayout =
    pathname === '/' ||
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
