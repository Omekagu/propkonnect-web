import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export const metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account.'
}

export default function ResetPasswordPage () {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020c06' }} />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
