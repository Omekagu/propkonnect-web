import { useState, useCallback, useEffect, useMemo } from 'react'
import { artisans as artisansApi } from '@/libs/api'

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

  /**
   * Show temporary notification
   */
  const showNotice = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }, [])

  /**
   * Fetch all artisans
   */
  const fetchArtisans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await artisansApi.getPublic()

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
  }, [showNotice])

  /**
   * Get artisan by ID
   */
  const getArtisanById = useCallback(
    async id => {
      try {
        const response = await artisansApi.getById(id)
        return response.data?.artisan || response.data?.data || response.data
      } catch (err) {
        console.error('Error fetching artisan:', err)
        return null
      }
    },
    []
  )

  /**
   * Create new artisan
   */
  const createArtisan = useCallback(
    async artisanData => {
      setLoading(true)
      try {
        const response = await artisansApi.create(artisanData)
        if (response.data?.success || response.data?._id) {
          showNotice('Artisan created successfully')
          await fetchArtisans()
          return response.data
        }
      } catch (err) {
        console.error('Error creating artisan:', err)
        showNotice(err.response?.data?.message || 'Failed to create artisan', 'error')
        return null
      } finally {
        setLoading(false)
      }
    },
    [showNotice, fetchArtisans]
  )

  /**
   * Update artisan
   */
  const updateArtisan = useCallback(
    async (id, artisanData) => {
      setLoading(true)
      try {
        const response = await artisansApi.update(id, artisanData)
        if (response.data?.success || response.data?._id) {
          showNotice('Artisan updated successfully')
          setArtisans(prev => prev.map(a => (a._id === id ? response.data : a)))
          return response.data
        }
      } catch (err) {
        console.error('Error updating artisan:', err)
        showNotice(err.response?.data?.message || 'Failed to update artisan', 'error')
        return null
      } finally {
        setLoading(false)
      }
    },
    [showNotice]
  )

  /**
   * Delete artisan
   */
  const deleteArtisan = useCallback(
    async id => {
      if (!window.confirm('Are you sure you want to delete this artisan?')) return false
      setLoading(true)
      try {
        const response = await artisansApi.remove(id)
        if (response.data?.success) {
          showNotice('Artisan deleted successfully')
          setArtisans(prev => prev.filter(a => a._id !== id))
          return true
        }
      } catch (err) {
        console.error('Error deleting artisan:', err)
        showNotice(err.response?.data?.message || 'Failed to delete artisan', 'error')
        return false
      } finally {
        setLoading(false)
      }
    },
    [showNotice]
  )

  /**
   * Rate artisan
   */
  const rateArtisan = useCallback(
    async (id, rating, review) => {
      try {
        const response = await artisansApi.rate(id, { rating, review })
        if (response.data?.success) {
          showNotice('Rating submitted successfully')
          await fetchArtisans()
          return true
        }
      } catch (err) {
        console.error('Error rating artisan:', err)
        showNotice(err.response?.data?.message || 'Failed to submit rating', 'error')
        return false
      }
    },
    [showNotice, fetchArtisans]
  )

  /**
   * Filter and search artisans
   */
  const filteredArtisans = useMemo(() => {
    return artisans.filter(artisan => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        artisan.name?.toLowerCase().includes(q) ||
        artisan.category?.toLowerCase().includes(q) ||
        artisan.specialization?.toLowerCase().includes(q) ||
        artisan.location?.toLowerCase().includes(q)

      const matchesCategory =
        categoryFilter === 'All' || artisan.category === categoryFilter

      const artisanRating = artisan.rating ?? artisan.stats?.averageRating ?? 0
      const matchesRating = ratingFilter === 0 || artisanRating >= ratingFilter

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
    const getRating = a => a.rating ?? a.stats?.averageRating ?? 0
    const getReviews = a => a.reviewCount ?? a.stats?.reviewCount ?? 0
    const averageRating =
      artisans.length > 0
        ? (
            artisans.reduce((sum, a) => sum + getRating(a), 0) / artisans.length
          ).toFixed(1)
        : 0
    const topRated = artisans.filter(a => getRating(a) >= 4.5).length

    return {
      totalArtisans,
      averageRating,
      topRated,
      totalReviews: artisans.reduce((sum, a) => sum + getReviews(a), 0)
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

export const useAdminArtisans = () => {
  // State management
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [stats, setStats] = useState(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedArtisans, setSelectedArtisans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedArtisan, setSelectedArtisan] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  const endpoint = '/api/admin/artisans'

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
   * Fetch all artisans with filters
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
      // Build query string
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryFilter !== 'All') params.append('category', categoryFilter)
      if (verificationFilter !== 'all')
        params.append('verified', verificationFilter)
      params.append('page', currentPage)
      params.append('limit', pageSize)

      const response = await axios.get(`${API_URL}${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        setArtisans(response.data.artisans || [])
        console.log('✅ Fetched artisans:', response.data.count)
      } else {
        setError('Failed to fetch artisans')
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
  }, [
    API_URL,
    endpoint,
    getToken,
    searchQuery,
    categoryFilter,
    verificationFilter,
    currentPage,
    pageSize,
    showNotice
  ])

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await axios.get(`${API_URL}${endpoint}/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        setStats(response.data.stats)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [API_URL, endpoint, getToken])

  /**
   * Verify/Unverify artisan
   */
  const toggleVerification = useCallback(
    async (id, verified) => {
      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return
      }

      setLoading(true)

      try {
        const response = await axios.patch(
          `${API_URL}${endpoint}/${id}/verify`,
          { verified: !verified },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data?.success) {
          showNotice(
            `Artisan ${!verified ? 'verified' : 'unverified'} successfully`
          )
          setArtisans(prev =>
            prev.map(a => (a._id === id ? { ...a, verified: !verified } : a))
          )
          if (selectedArtisan?._id === id) {
            setSelectedArtisan(prev => ({ ...prev, verified: !verified }))
          }
        }
      } catch (err) {
        console.error('Error verifying artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to verify artisan',
          'error'
        )
      } finally {
        setLoading(false)
      }
    },
    [API_URL, endpoint, getToken, showNotice, selectedArtisan?._id]
  )

  /**
   * Delete artisan
   */
  const deleteArtisan = useCallback(
    async id => {
      if (
        !window.confirm(
          'Are you sure you want to delete this artisan? This action cannot be undone.'
        )
      ) {
        return
      }

      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return
      }

      setLoading(true)

      try {
        const response = await axios.delete(`${API_URL}${endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data?.success) {
          showNotice('Artisan deleted successfully')
          setArtisans(prev => prev.filter(a => a._id !== id))
          if (selectedArtisan?._id === id) {
            closeModal()
          }
        }
      } catch (err) {
        console.error('Error deleting artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to delete artisan',
          'error'
        )
      } finally {
        setLoading(false)
      }
    },
    [API_URL, endpoint, getToken, showNotice, selectedArtisan?._id]
  )

  /**
   * Update artisan
   */
  const updateArtisan = useCallback(
    async (id, updateData) => {
      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return null
      }

      setLoading(true)

      try {
        const response = await axios.put(
          `${API_URL}${endpoint}/${id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data?.success) {
          showNotice('Artisan updated successfully')
          setArtisans(prev =>
            prev.map(a => (a._id === id ? response.data.artisan : a))
          )
          if (selectedArtisan?._id === id) {
            setSelectedArtisan(response.data.artisan)
          }
          return response.data.artisan
        }
      } catch (err) {
        console.error('Error updating artisan:', err)
        showNotice(
          err.response?.data?.message || 'Failed to update artisan',
          'error'
        )
      } finally {
        setLoading(false)
      }
      return null
    },
    [API_URL, endpoint, getToken, showNotice, selectedArtisan?._id]
  )

  /**
   * Bulk update artisans
   */
  const bulkUpdate = useCallback(
    async updateData => {
      if (selectedArtisans.length === 0) {
        showNotice('No artisans selected', 'warning')
        return false
      }

      const token = getToken()
      if (!token) {
        showNotice('No authentication token', 'error')
        return false
      }

      setLoading(true)

      try {
        const response = await axios.post(
          `${API_URL}${endpoint}/bulk-update`,
          {
            artisanIds: selectedArtisans,
            updateData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data?.success) {
          showNotice(`Updated ${response.data.modifiedCount} artisans`)
          setSelectedArtisans([])
          await fetchArtisans()
          return true
        }
      } catch (err) {
        console.error('Error bulk updating:', err)
        showNotice(
          err.response?.data?.message || 'Failed to bulk update',
          'error'
        )
      } finally {
        setLoading(false)
      }
      return false
    },
    [selectedArtisans, API_URL, endpoint, getToken, showNotice, fetchArtisans]
  )

  /**
   * Filter and sort artisans
   */
  const filteredAndSortedArtisans = useMemo(() => {
    let filtered = artisans

    // Filter
    filtered = filtered.filter(a => {
      const matchesSearch =
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone?.includes(searchQuery)

      const matchesCategory =
        categoryFilter === 'All' || a.category === categoryFilter

      const matchesVerification =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && a.verified) ||
        (verificationFilter === 'unverified' && !a.verified)

      return matchesSearch && matchesCategory && matchesVerification
    })

    // Sort
    switch (sortBy) {
      case 'name_asc':
        return filtered.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        )
      case 'name_desc':
        return filtered.sort((a, b) =>
          (b.name || '').localeCompare(a.name || '')
        )
      case 'rating_high':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'rating_low':
        return filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0))
      case 'recent':
      default:
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
    }
  }, [artisans, searchQuery, categoryFilter, verificationFilter, sortBy])

  /**
   * Get unique categories
   */
  const categories = useMemo(() => {
    const cats = new Set(artisans.map(a => a.category).filter(Boolean))
    return ['All', ...Array.from(cats).sort()]
  }, [artisans])

  /**
   * Initial load
   */
  useEffect(() => {
    fetchArtisans()
    fetchStats()
  }, [fetchArtisans, fetchStats])

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

  /**
   * Select/deselect artisan
   */
  const toggleArtisanSelection = useCallback(id => {
    setSelectedArtisans(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }, [])

  /**
   * Select all visible artisans
   */
  const toggleSelectAll = useCallback(() => {
    if (selectedArtisans.length === filteredAndSortedArtisans.length) {
      setSelectedArtisans([])
    } else {
      setSelectedArtisans(filteredAndSortedArtisans.map(a => a._id))
    }
  }, [selectedArtisans.length, filteredAndSortedArtisans])

  return {
    // State
    artisans,
    loading,
    error,
    notice,
    stats,
    showModal,
    modalType,
    selectedArtisan,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    verificationFilter,
    setVerificationFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,

    // Selection
    selectedArtisans,
    toggleArtisanSelection,
    toggleSelectAll,

    // Data
    filteredAndSortedArtisans,
    categories,

    // Actions
    fetchArtisans,
    fetchStats,
    toggleVerification,
    deleteArtisan,
    updateArtisan,
    bulkUpdate,
    viewArtisanDetails,
    closeModal,
    setShowModal,
    setModalType,
    setSelectedArtisan,
    showNotice
  }
}

export default { useArtisanManagement, useAdminArtisans }
