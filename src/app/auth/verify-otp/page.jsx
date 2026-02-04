import { Suspense } from 'react'
import VerifyOTPClient from './VerifyOTPClient'

export default function VerifyOTPPage () {
  return (
    <Suspense fallback={<div />}>
      <VerifyOTPClient />
    </Suspense>
  )
}
