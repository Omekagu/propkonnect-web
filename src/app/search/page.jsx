import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata = {
  title: 'Search Properties | PropNect',
  description: 'Search and filter properties for sale, rent, and short stays across Nigeria.'
}

export default function SearchPage () {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020c06' }} />}>
      <SearchClient />
    </Suspense>
  )
}
