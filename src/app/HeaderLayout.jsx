'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/component/footer/Footer'

export default function HeaderLayout ({ children }) {
  const pathname = usePathname()

  const hideLayout =
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/docs') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth')

  return (
    <>
      {/* {!hideLayout && <Header />} */}
      <main>{children}</main>
      {!hideLayout && <Footer />}
    </>
  )
}
