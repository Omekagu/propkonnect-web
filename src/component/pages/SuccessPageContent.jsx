'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function SuccessPageContent () {
  const params = useSearchParams()
  const trxRef = params.get('transactionReference')
  const [status, setStatus] = useState('Verifying...')

  useEffect(() => {
    if (!trxRef) return

    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/verify-monnify-transaction?transactionReference=${trxRef}`
      )
      .then(res => {
        setStatus(res.data.responseBody.paymentStatus)
      })
      .catch(() => setStatus('Verification failed'))
  }, [trxRef])

  return (
    <div style={{ paddingTop: 100, height: '100vh', textAlign: 'center' }}>
      <h1>Payment Status</h1>
      <h2>{status}</h2>
    </div>
  )
}
