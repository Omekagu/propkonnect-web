import { useState, useCallback, useEffect, useMemo } from 'react'
import { properties as propertiesApi } from '@/libs/api'

export const usePropertyManagement = () => {
  // State management
  const [properties, setProperties] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [activeView, setActiveView] = useState('properties')

  /**
   * Show temporary notification
   */
  const showNotice = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }, [])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await propertiesApi.getAll()

      // Handle both response formats
      let propertiesData = []

      if (res.data?.success && res.data?.properties) {
        // Format: { success: true, properties: [...] }
        propertiesData = res.data.properties
      } else if (Array.isArray(res.data)) {
        // Format: Direct array [...]
        propertiesData = res.data
      } else if (res.data?.properties) {
        // Format: { properties: [...] } without success flag
        propertiesData = res.data.properties
      } else {
        console.warn('Unexpected response format:', res.data)
        propertiesData = []
      }

      if (propertiesData && propertiesData.length > 0) {
        setProperties(propertiesData)
        console.log('✅ Fetched properties:', propertiesData.length)
      } else {
        setProperties([])
        console.log('No properties found')
      }
    } catch (err) {
      console.error('❌ Error fetching properties:', err.message)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load properties'
      )
      showNotice('Failed to load properties', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotice])

  const fetchApplications = useCallback(async () => {
    if (properties.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const applicationsData = []

      // Fetch applications for each property
      const promises = properties.map(property =>
        propertiesApi.getApplicationsByProperty(property._id)
          .then(res => {
            if (res.data?.success && res.data.applications) {
              return res.data.applications.map(app => ({
                ...app,
                propertyTitle: property.title,
                propertyId: property._id
              }))
            }
            return []
          })
          .catch(err => {
            console.error(
              `Error fetching applications for property ${property._id}:`,
              err
            )
            return []
          })
      )

      const results = await Promise.all(promises)
      results.forEach(apps => applicationsData.push(...apps))

      setApplications(applicationsData)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err.response?.data?.message || 'Failed to load applications')
      showNotice('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }, [properties, showNotice])

  /**
   * Initial load: fetch properties on mount
   */
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  /**
   * Fetch applications when view changes to applications
   */
  useEffect(() => {
    if (activeView === 'applications' && properties.length > 0) {
      fetchApplications()
    }
  }, [activeView, properties.length, fetchApplications])

  // ── Approve / reject state ─────────────────────────────────────────────
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  /**
   * Approve a pending_review property (admin only)
   */
  const handleApprove = useCallback(
    async propertyId => {
      try {
        const res = await propertiesApi.updateStatus(propertyId, { status: 'published' })
        if (res.data?.success) {
          showNotice('Property approved and published')
          setProperties(prev =>
            prev.map(p =>
              p._id === propertyId ? { ...p, status: 'published' } : p
            )
          )
        } else {
          showNotice(res.data?.msg || 'Failed to approve property', 'error')
        }
      } catch (err) {
        console.error('Error approving property:', err)
        showNotice(
          err.response?.data?.msg || 'Failed to approve property',
          'error'
        )
      }
    },
    [showNotice]
  )

  /**
   * Open reject modal for a property
   */
  const openRejectModal = useCallback(propertyId => {
    setRejectTargetId(propertyId)
    setRejectReason('')
    setRejectModal(true)
  }, [])

  /**
   * Confirm reject with reason (admin only)
   */
  const handleRejectConfirm = useCallback(async () => {
    if (!rejectTargetId) return
    try {
      const res = await propertiesApi.updateStatus(rejectTargetId, { status: 'archived', reason: rejectReason })
      if (res.data?.success) {
        showNotice('Property rejected')
        setProperties(prev =>
          prev.map(p =>
            p._id === rejectTargetId ? { ...p, status: 'archived' } : p
          )
        )
        setRejectModal(false)
        setRejectTargetId(null)
        setRejectReason('')
      } else {
        showNotice(res.data?.msg || 'Failed to reject property', 'error')
      }
    } catch (err) {
      console.error('Error rejecting property:', err)
      showNotice(
        err.response?.data?.msg || 'Failed to reject property',
        'error'
      )
    }
  }, [rejectTargetId, rejectReason, showNotice])

  /**
   * Delete a property
   */
  const handleDeleteProperty = useCallback(
    async propertyId => {
      if (
        !window.confirm(
          'Are you sure you want to delete this property? This action cannot be undone.'
        )
      ) {
        return
      }

      setLoading(true)

      try {
        const res = await propertiesApi.remove(propertyId)

        if (res.data?.success) {
          showNotice('Property archived successfully')
          // Mark as archived in state — disappears from default view, visible under "Archived" filter
          setProperties(prev =>
            prev.map(p =>
              p._id === propertyId
                ? { ...p, status: 'archived', isDraft: false }
                : p
            )
          )
          // Also remove associated applications
          setApplications(prev => prev.filter(a => a.propertyId !== propertyId))
        } else {
          showNotice('Failed to delete property', 'error')
        }
      } catch (err) {
        console.error('Error deleting property:', err)
        showNotice(
          err.response?.data?.message || 'Failed to delete property',
          'error'
        )
      } finally {
        setLoading(false)
      }
    },
    [showNotice]
  )

  /**
   * View property details in modal
   */
  const viewPropertyDetails = useCallback(property => {
    setSelectedProperty(property)
    setModalType('view')
    setShowModal(true)
  }, [])

  /**
   * View applications for a specific property
   */
  const viewPropertyApplications = useCallback(
    async propertyId => {
      try {
        setLoading(true)
        const res = await propertiesApi.getApplicationsByProperty(propertyId)

        if (res.data?.success) {
          const applicationsWithProperty = (res.data.applications || []).map(
            app => ({
              ...app,
              propertyTitle:
                properties.find(p => p._id === propertyId)?.title || 'Unknown',
              propertyId
            })
          )

          setModalData(applicationsWithProperty)
          setModalType('applications')
          setShowModal(true)
        } else {
          showNotice('No applications found', 'info')
        }
      } catch (err) {
        console.error('Error fetching applications:', err)
        showNotice('Failed to load applications', 'error')
      } finally {
        setLoading(false)
      }
    },
    [properties, showNotice]
  )

  /**
   * Update application status (approved, rejected, pending)
   */
  const updateApplicationStatus = useCallback(
    async (appId, newStatus) => {
      try {
        setLoading(true)
        const res = await propertiesApi.updateApplication(appId, { status: newStatus })

        if (res.data?.success) {
          showNotice(`Application ${newStatus} successfully`)

          // Update local state immediately
          setApplications(prev =>
            prev.map(app =>
              app._id === appId ? { ...app, status: newStatus } : app
            )
          )

          // Update modal data if visible
          if (showModal && modalType === 'applications' && modalData) {
            setModalData(prev =>
              prev.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
              )
            )
          }
        } else {
          showNotice('Failed to update application status', 'error')
        }
      } catch (err) {
        console.error('Error updating application status:', err)
        showNotice(
          err.response?.data?.message || 'Failed to update application status',
          'error'
        )
      } finally {
        setLoading(false)
      }
    },
    [showModal, modalType, modalData, showNotice]
  )

  /**
   * Delete an application
   */
  const deleteApplication = useCallback(
    async appId => {
      if (
        !window.confirm('Are you sure you want to delete this application?')
      ) {
        return
      }

      try {
        setLoading(true)
        const res = await propertiesApi.deleteApplication(appId)

        if (res.data?.success) {
          showNotice('Application deleted successfully')

          // Update applications list
          setApplications(prev => prev.filter(a => a._id !== appId))

          // Update modal data if visible
          if (showModal && modalType === 'applications' && modalData) {
            setModalData(prev => prev.filter(a => a._id !== appId))
          }
        } else {
          showNotice('Failed to delete application', 'error')
        }
      } catch (err) {
        console.error('Error deleting application:', err)
        showNotice(
          err.response?.data?.message || 'Failed to delete application',
          'error'
        )
      } finally {
        setLoading(false)
      }
    },
    [showModal, modalType, modalData, showNotice]
  )

  // ── Property status filter (for admin review queue) ─────────────────────
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all')

  /**
   * Filter properties based on search, category, and status
   */
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof p.location === 'string'
          ? p.location
          : p.location?.address || p.location?.city || ''
        )
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        categoryFilter === 'All' || p.category === categoryFilter

      // 'all' hides archived — select 'archived' explicitly to see them
      const matchesStatus =
        propertyStatusFilter === 'all'
          ? p.status !== 'archived'
          : p.status === propertyStatusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [properties, searchQuery, categoryFilter, propertyStatusFilter])

  /**
   * Filter applications based on search and status
   */
  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch =
        a.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.applicantEmail?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  /**
   * Calculate dashboard statistics
   */
  const stats = useMemo(() => {
    const nonArchived = properties.filter(p => p.status !== 'archived')
    const activeProperties = nonArchived.filter(
      p =>
        p.status === 'published' ||
        p.status === 'active' ||
        p.status === 'Standard' ||
        !p.status
    )
    const pendingReviewProperties = nonArchived.filter(
      p => p.status === 'pending_review'
    )

    const pendingApps = applications.filter(a => a.status === 'pending')
    const approvedApps = applications.filter(a => a.status === 'approved')
    const rejectedApps = applications.filter(a => a.status === 'rejected')

    const totalRevenue = nonArchived.reduce((sum, p) => {
      const price = Number(p.price) || Number(p.rentPrice) || 0
      return sum + price
    }, 0)

    return {
      totalProperties: nonArchived.length,
      activeListings: activeProperties.length,
      pendingReview: pendingReviewProperties.length,
      inactiveListings: nonArchived.length - activeProperties.length,
      totalApplications: applications.length,
      pendingApplications: pendingApps.length,
      approvedApplications: approvedApps.length,
      rejectedApplications: rejectedApps.length,
      totalRevenue,
      conversionRate:
        applications.length > 0
          ? ((approvedApps.length / applications.length) * 100).toFixed(1)
          : 0
    }
  }, [properties, applications])

  /**
   * Get unique categories from properties
   */
  const categories = useMemo(() => {
    const cats = new Set(properties.map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(cats).sort()]
  }, [properties])

  /**
   * Close modal and reset data
   */
  const closeModal = useCallback(() => {
    setShowModal(false)
    setModalType(null)
    setModalData(null)
    setSelectedProperty(null)
  }, [])

  return {
    // State
    properties,
    applications,
    loading,
    error,
    notice,
    showModal,
    modalType,
    modalData,
    selectedProperty,
    activeView,

    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,

    // Filtered data
    filteredProperties,
    filteredApplications,
    categories,
    stats,

    // Filters (property status)
    propertyStatusFilter,
    setPropertyStatusFilter,

    // Reject modal state
    rejectModal,
    setRejectModal,
    rejectReason,
    setRejectReason,
    rejectTargetId,

    // Actions
    fetchProperties,
    fetchApplications,
    handleDeleteProperty,
    handleApprove,
    openRejectModal,
    handleRejectConfirm,
    viewPropertyDetails,
    viewPropertyApplications,
    updateApplicationStatus,
    deleteApplication,
    closeModal,
    setShowModal,
    setModalType,
    setModalData,
    setSelectedProperty,
    setActiveView,
    showNotice
  }
}

export default usePropertyManagement
