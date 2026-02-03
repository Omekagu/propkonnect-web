import { useState, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'

/**
 * Custom hook for artisan management
 * Handles fetching, filtering, searching, and managing artisans
 */
export const useArtisanManagement = () => {
  // State management
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedArtisan, setSelectedArtisan] = useState(null)
  const [sortBy, setSortBy] = useState('recent')

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  const endpoint = '/api/artisans'

  /**
   * Show temporary notification
   */
  const showNotice = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }, [])

  /**
   * Get authentication token
   */
  const getToken = useCallback(() => {
    return localStorage.getItem('authToken')
  }, [])

  /**
   * Fetch all artisans
   */
  const fetchArtisans = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setError('No authentication token. Please log in.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Handle multiple response formats
      let artisansData = []

      if (response.data?.success && response.data?.artisans) {
        // Format: { success: true, artisans: [...] }
        artisansData = response.data.artisans
      } else if (Array.isArray(response.data)) {
        // Format: Direct array [...]
        artisansData = response.data
      } else if (response.data?.artisans) {
        // Format: { artisans: [...] }
        artisansData = response.data.artisans
      } else if (response.data?.data) {
        // Format: { data: [...] }
        artisansData = response.data.data
      }

      if (artisansData && artisansData.length > 0) {
        setArtisans(artisansData)
        console.log('✅ Fetched artisans:', artisansData.length)
      } else {
        setArtisans([])
        console.log('No artisans found')
      }
    } catch (err) {
      console.error('❌ Error fetching artisans:', err.message)
      setError(
        err.response?.data?.message || err.message || 'Failed to load artisans'
      )
      showNotice('Failed to load artisans', 'error')
    } finally {
      setLoading(false)
    }
  }, [API_URL, endpoint, getToken, showNotice])

  /**
   * Get artisan by ID
   */
  const getArtisanById = useCallback(
    async id => {
      const token = getToken()
      if (!token) return null

      try {
        const response = await axios.get(`${API_URL}${endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        return response.data?.artisan || response.data?.data || response.data
      } catch (err) {
        console.error('Error fetching artisan:', err)
        return null
      }
    },
    [API_URL, endpoint, getToken]
  )

  /**
   * Create new artisan
   */
  const createArtisan = useCallback(
    async artisanData => {
      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return null
      }

      setLoading(true)

      try {
        const response = await axios.post(
          `${API_URL}${endpoint}`,
          artisanData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.data?.success || response.data?._id) {
          showNotice('Artisan created successfully')
          await fetchArtisans()
          return response.data
        }
      } catch (err) {
        console.error('Error creating artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to create artisan',
          'error'
        )
        return null
      } finally {
        setLoading(false)
      }
    },
    [API_URL, endpoint, getToken, showNotice, fetchArtisans]
  )

  /**
   * Update artisan
   */
  const updateArtisan = useCallback(
    async (id, artisanData) => {
      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return null
      }

      setLoading(true)

      try {
        const response = await axios.put(
          `${API_URL}${endpoint}/${id}`,
          artisanData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.data?.success || response.data?._id) {
          showNotice('Artisan updated successfully')
          // Update local state
          setArtisans(prev => prev.map(a => (a._id === id ? response.data : a)))
          return response.data
        }
      } catch (err) {
        console.error('Error updating artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to update artisan',
          'error'
        )
        return null
      } finally {
        setLoading(false)
      }
    },
    [API_URL, endpoint, getToken, showNotice]
  )

  /**
   * Delete artisan
   */
  const deleteArtisan = useCallback(
    async id => {
      if (!window.confirm('Are you sure you want to delete this artisan?')) {
        return false
      }

      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return false
      }

      setLoading(true)

      try {
        const response = await axios.delete(`${API_URL}${endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data?.success) {
          showNotice('Artisan deleted successfully')
          setArtisans(prev => prev.filter(a => a._id !== id))
          return true
        }
      } catch (err) {
        console.error('Error deleting artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to delete artisan',
          'error'
        )
        return false
      } finally {
        setLoading(false)
      }
    },
    [API_URL, endpoint, getToken, showNotice]
  )

  /**
   * Rate artisan
   */
  const rateArtisan = useCallback(
    async (id, rating, review) => {
      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return false
      }

      try {
        const response = await axios.post(
          `${API_URL}${endpoint}/${id}/rate`,
          { rating, review },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data?.success) {
          showNotice('Rating submitted successfully')
          await fetchArtisans()
          return true
        }
      } catch (err) {
        console.error('Error rating artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to submit rating',
          'error'
        )
        return false
      }
    },
    [API_URL, endpoint, getToken, showNotice, fetchArtisans]
  )

  /**
   * Filter and search artisans
   */
  const filteredArtisans = useMemo(() => {
    return artisans.filter(artisan => {
      const matchesSearch =
        artisan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.specialization
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        artisan.location?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        categoryFilter === 'All' || artisan.category === categoryFilter

      const matchesRating =
        ratingFilter === 0 || (artisan.rating && artisan.rating >= ratingFilter)

      return matchesSearch && matchesCategory && matchesRating
    })
  }, [artisans, searchQuery, categoryFilter, ratingFilter])

  /**
   * Sort artisans
   */
  const sortedArtisans = useMemo(() => {
    const sorted = [...filteredArtisans]

    switch (sortBy) {
      case 'rating_high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'rating_low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0))
      case 'name_asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      case 'name_desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      case 'recent':
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
    }
  }, [filteredArtisans, sortBy])

  /**
   * Get unique categories
   */
  const categories = useMemo(() => {
    const cats = new Set(artisans.map(a => a.category).filter(Boolean))
    return ['All', ...Array.from(cats).sort()]
  }, [artisans])

  /**
   * Get statistics
   */
  const stats = useMemo(() => {
    const totalArtisans = artisans.length
    const averageRating =
      artisans.length > 0
        ? (
            artisans.reduce((sum, a) => sum + (a.rating || 0), 0) /
            artisans.length
          ).toFixed(1)
        : 0
    const topRated = artisans.filter(a => a.rating && a.rating >= 4.5).length

    return {
      totalArtisans,
      averageRating,
      topRated,
      totalReviews: artisans.reduce((sum, a) => sum + (a.reviewCount || 0), 0)
    }
  }, [artisans])

  /**
   * Initial load
   */
  useEffect(() => {
    fetchArtisans()
  }, [fetchArtisans])

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setShowModal(false)
    setModalType(null)
    setSelectedArtisan(null)
  }, [])

  /**
   * View artisan details
   */
  const viewArtisanDetails = useCallback(artisan => {
    setSelectedArtisan(artisan)
    setModalType('details')
    setShowModal(true)
  }, [])

  return {
    // State
    artisans,
    loading,
    error,
    notice,
    showModal,
    modalType,
    selectedArtisan,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,

    // Data
    sortedArtisans,
    categories,
    stats,
    filteredArtisans,

    // Actions
    fetchArtisans,
    getArtisanById,
    createArtisan,
    updateArtisan,
    deleteArtisan,
    rateArtisan,
    viewArtisanDetails,
    closeModal,
    setShowModal,
    setModalType,
    setSelectedArtisan,
    showNotice
  }
}

export default useArtisanManagement
