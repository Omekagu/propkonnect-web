import { Suspense } from 'react'
import PropertiesClient from './PropertiesClient'

export const metadata = {
  title: 'Browse Properties | PropNect',
  description:
    'Search and filter thousands of properties for sale, rent, and short stays across Nigeria.'
}

export default function PropertiesPage () {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020c06' }} />}>
      <PropertiesClient />
    </Suspense>
  )
}
