// minimal reviews client used by the ReviewsProvider

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function getReviews (section, { limit = 20, page = 1 } = {}) {
  const url = `${API_BASE}/api/reviews?section=${encodeURIComponent(
    section
  )}&limit=${limit}&page=${page}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const err = await res.text().catch(() => 'Failed to fetch')
    throw new Error(err)
  }
  return res.json()
}

export async function postReview (payload) {
  const url = `${API_BASE}/api/reviews`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg =
      (body && body.errors && body.errors.map(e => e.msg).join(', ')) ||
      (body && body.error) ||
      'Failed to post review'
    throw new Error(msg)
  }
  return res.json()
}
