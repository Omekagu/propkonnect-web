'use client'

import SuccessPageContent from '@/component/pages/SuccessPageContent'
import { Suspense } from 'react'

export default function SuccessPageWrapper () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}
