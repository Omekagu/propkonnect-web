'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import { getReviews, postReview } from './ReviewsClient'
const reviewsClient = { getReviews, postReview }
const ReviewsContext = createContext(null)

export function ReviewsProvider ({ children, defaultSection = 'overview', lazy = false }) {
  const [currentSection, setCurrentSection] = useState(defaultSection)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const fetchReviews = useCallback(
    async (section = currentSection, { page: p = page } = {}) => {
      setLoading(true)
      try {
        const data = await reviewsClient.getReviews(section, { limit, page: p })
        setReviews(data.items || [])
        const s = data.stats && data.stats[section]
        setAvgRating(s ? s.avgRating : null)
        setPage(p)
        return data
      } finally {
        setLoading(false)
      }
    },
    [currentSection, limit, page]
  )

  useEffect(() => {
    if (lazy) return
    fetchReviews(currentSection).catch(err => {
      console.error('Failed to fetch reviews for', currentSection, err)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, lazy])

  // submitReview attaches the currentSection and handles optimistic update
  const submitReview = useCallback(
    async ({ name, email, rating, comment, metadata = {} }) => {
      // Build payload including section metadata
      const payload = {
        section: currentSection,
        name: name || undefined,
        email: email || undefined,
        rating: Number(rating),
        comment: comment || undefined,
        metadata: Object.keys(metadata).length ? metadata : undefined
      }

      // optimistic UI: create a temporary review entry
      const temp = {
        _id: `tmp-${Date.now()}`,
        section: currentSection,
        name: payload.name || 'Anonymous',
        email: payload.email || null,
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString(),
        metadata
      }

      // update UI immediately
      setReviews(prev => [temp, ...prev].slice(0, limit))

      try {
        const { review } = await reviewsClient.postReview(payload)
        // replace temp with actual saved review (match by createdAt or ID)
        setReviews(prev => {
          const replaced = prev.map(r => (r._id === temp._id ? review : r))
          // if review not present (race), ensure it's prepended
          if (!replaced.find(r => r._id === review._id))
            replaced.unshift(review)
          return replaced.slice(0, limit)
        })

        // recompute avg locally
        const all = [review, ...reviews.filter(r => r._id !== temp._id)]
        const avg = all.length
          ? all.reduce((s, it) => s + (it.rating || 0), 0) / all.length
          : null
        setAvgRating(avg ? Number(avg.toFixed(2)) : null)
        return review
      } catch (err) {
        // rollback optimistic update if desired: remove temp
        setReviews(prev => prev.filter(r => r._id !== temp._id))
        throw err
      }
    },
    [currentSection, limit, reviews]
  )

  const contextValue = {
    currentSection,
    setCurrentSection,
    reviews,
    avgRating,
    loading,
    fetchReviews,
    submitReview,
    page,
    limit
  }

  return (
    <ReviewsContext.Provider value={contextValue}>
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews () {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('useReviews must be used inside ReviewsProvider')
  return ctx
}
