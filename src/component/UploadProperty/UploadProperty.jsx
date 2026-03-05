'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  MapPin,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Store,
  Landmark,
  Check,
  Sparkles,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Calendar,
  FileText,
  Eye,
  Loader2,
  AlertCircle,
  Hotel as HotelIcon,
  Plus,
  Trash2
} from 'lucide-react'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import './UploadProperty.scss'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, title: 'Property Basics', icon: Building2 },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Pricing', icon: DollarSign },
  { id: 4, title: 'Media & Features', icon: ImageIcon },
  { id: 5, title: 'Review & Publish', icon: Eye }
]

const DEFAULT_FEATURES = [
  'Air Conditioning',
  'Laundry Service',
  'Emergency Exit',
  'Free Wi-Fi',
  'Terrace',
  'Balcony',
  'CCTV',
  'Free Parking',
  'Swimming Pool',
  'Gym',
  'Security'
]

const FEATURES_BY_TYPE = {
  Hotel: ['Room Service', 'Breakfast Included', 'Concierge', 'Mini Bar'],
  Shortlet: ['Self Check-in', 'Cleaning Service', 'Kitchenette'],
  Apartment: ['Gym', 'Pet Friendly', 'Elevator'],
  House: ['Garden', 'Garage', 'Fireplace'],
  Land: ['Gated Community', 'Surveyed'],
  Commercial: ['Loading Bay', 'Office Space']
}

const DEFAULT_PLOT_SIZES = [
  { id: '500', label: '500 sqm', price: 500000 },
  { id: '1acre', label: '1 acre', price: 1200000 }
]

const RENT_FREQUENCIES = {
  Apartment: ['monthly', 'yearly'],
  House: ['per night', 'daily', 'monthly', 'yearly'],
  Shortlet: ['per night', 'daily'],
  Hotel: ['per night'],
  Land: ['monthly', 'yearly'],
  Commercial: ['monthly', 'yearly']
}

const PROPERTY_TYPES = [
  {
    value: 'Apartment',
    label: 'Apartment',
    Icon: Building2,
    desc: 'Multi-unit residential building'
  },
  {
    value: 'House',
    label: 'House',
    Icon: Home,
    desc: 'Single-family residence'
  },
  {
    value: 'Shortlet',
    label: 'Shortlet',
    Icon: Home,
    desc: 'Short-term rental'
  },
  {
    value: 'Hotel',
    label: 'Hotel',
    Icon: HotelIcon,
    desc: 'Hospitality accommodation'
  },
  {
    value: 'Land',
    label: 'Land',
    Icon: Landmark,
    desc: 'Vacant plot or acreage'
  },
  {
    value: 'Commercial',
    label: 'Commercial',
    Icon: Store,
    desc: 'Business property'
  }
]

const TIER_LABELS = {
  single: { emoji: '🏠', label: 'Single Property' },
  batch: { emoji: '📋', label: 'Batch Upload' },
  project: { emoji: '🏗️', label: 'Project Portfolio' },
  api: { emoji: '⚙️', label: 'API Integration' }
}

const INITIAL_PAYMENT_PLANS = [
  {
    id: 'out',
    name: 'Outright',
    installments: [{ dueInDays: 0, percent: 100 }]
  }
]

const blankForm = (tier = 'single') => ({
  _id: undefined,
  title: '',
  purpose: 'For Rent',
  category: 'Apartment',
  transactionType: null,
  creationTier: tier,
  price: '',
  rentPrice: '',
  rentFrequency: 'monthly',
  currency: 'NGN',
  selectedPlotId: '',
  selectedPlotLabel: '',
  selectedPlotPrice: '',
  beds: '',
  baths: '',
  maxRooms: '',
  area: '',
  premiere: false,
  location: '',
  address: '',
  city: '',
  state: '',
  country: '',
  description: '',
  features: [],
  tags: [],
  media: [],
  seoTitle: '',
  seoDescription: '',
  schedulePublishAt: '',
  autoPriceSuggestion: true,
  paymentPlans: INITIAL_PAYMENT_PLANS,
  plotSizes: DEFAULT_PLOT_SIZES,
  roomTypes: [],
  isDraft: false,
  visibility: 'public',
  compliance: { verified: false, score: 0, documents: [] },
  escrow: { status: 'none' }
})

const blankRoomType = () => ({
  name: '',
  description: '',
  qty: 1,
  pricePerNight: '',
  pricePerMonth: '',
  pricePerYear: '',
  occupancy: { adults: 2, children: 0 },
  amenities: [],
  images: [],
  media: [],
  active: true
})

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ★ FIXED ARCHITECTURE:
//   - Proper state initialization (no re-running init functions)
//   - Stable effect dependencies
//   - Simple, direct state updates
//   - Input fields directly connected to form state
//   - No unexpected resets or state clearing
// ─────────────────────────────────────────────────────────────────────────────

export default function UploadPropertyWizard ({
  editPropertyId = null,
  creationTier = 'single',
  onBack,
  onSaved
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState(() => blankForm(creationTier))
  const [paymentPlans, setPaymentPlans] = useState(INITIAL_PAYMENT_PLANS)
  const [roomTypes, setRoomTypes] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [planInfo, setPlanInfo] = useState(null)
  const [listingCount, setListingCount] = useState(0)

  // Track if component is mounted to avoid memory leaks
  const mounted = useRef(true)
  const fileRef = useRef(null)
  const dropRef = useRef(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD PLAN INFO
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        // Get plan from stored user data first (fast path)
        let tier = 'free', limit = 3
        try {
          const stored = localStorage.getItem('userData') || localStorage.getItem('user')
          if (stored) {
            const u = JSON.parse(stored)
            tier = u?.plan?.tier || 'free'
            limit = u?.plan?.listingLimit ?? (tier === 'enterprise' ? -1 : tier === 'pro' ? 50 : tier === 'basic' ? 15 : 3)
          }
        } catch { /* ignore parse errors */ }

        // Fetch current listing count
        const res = await api.get('/api/properties/property/mine')
        if (mounted.current) {
          const count = res.data?.properties?.length ?? res.data?.data?.length ?? 0
          setListingCount(count)
          setPlanInfo({ tier, limit })
        }
      } catch {
        // Non-critical — silently skip banner
      }
    }
    loadPlanInfo()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD FOR EDIT - Only when editPropertyId explicitly changes
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editPropertyId) {
      // Only reset if we're starting fresh (not editing)
      if (!hasInitialized.current) {
        setForm(blankForm(creationTier))
        setRoomTypes([])
        setPaymentPlans(INITIAL_PAYMENT_PLANS)
        setCurrentStep(1)
        setErrors({})
        hasInitialized.current = true
      }
      return
    }

    // Load property for editing
    loadForEdit(editPropertyId)
  }, [editPropertyId]) // Only depend on editPropertyId, NOT creationTier

  const loadForEdit = async id => {
    setLoadingEdit(true)
    try {
      const res = await api.get(`/api/properties/${id}`)
      if (!res.data?.success || !res.data.property)
        throw new Error(res.data?.msg || 'Property not found')
      const p = res.data.property

      const existingMedia = [
        ...(p.images || []).map(url => ({ url, type: 'image' })),
        ...(p.video || []).map(url => ({ url, type: 'video' }))
      ]
      let scheduleVal = ''
      if (p.schedulePublishAt) {
        const d = new Date(p.schedulePublishAt)
        if (!isNaN(d)) scheduleVal = d.toISOString().slice(0, 16)
      }

      setForm({
        _id: p._id,
        title: p.title || '',
        purpose: p.purpose || 'For Rent',
        category: p.category || 'Apartment',
        transactionType: p.transactionType || null,
        creationTier: p.creationTier || creationTier,
        price: p.price ? String(p.price) : '',
        rentPrice: p.rentPrice ? String(p.rentPrice) : '',
        rentFrequency: p.rentFrequency || 'monthly',
        currency: p.currency || 'NGN',
        selectedPlotId: p.selectedPlotId || '',
        selectedPlotLabel: p.selectedPlotLabel || '',
        selectedPlotPrice: p.selectedPlotPrice
          ? String(p.selectedPlotPrice)
          : '',
        beds: p.beds || p.bedrooms ? String(p.beds || p.bedrooms) : '',
        baths: p.baths || p.bathrooms ? String(p.baths || p.bathrooms) : '',
        maxRooms: p.maxRooms ? String(p.maxRooms) : '',
        area: p.area || '',
        premiere: !!p.premiere,
        location: p.location || p.address || '',
        address: p.address || p.location || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || '',
        description: p.description || '',
        features: Array.isArray(p.features) ? p.features : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
        media: existingMedia,
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
        schedulePublishAt: scheduleVal,
        autoPriceSuggestion: p.autoPriceSuggestion ?? true,
        paymentPlans: Array.isArray(p.paymentPlans)
          ? p.paymentPlans
          : INITIAL_PAYMENT_PLANS,
        plotSizes: Array.isArray(p.plotSizes)
          ? p.plotSizes
          : DEFAULT_PLOT_SIZES,
        roomTypes: Array.isArray(p.roomTypes) ? p.roomTypes : [],
        isDraft: !!p.isDraft,
        visibility: p.visibility || 'public',
        compliance: p.compliance || {
          verified: false,
          score: 0,
          documents: []
        },
        escrow: p.escrow || { status: 'none' }
      })

      setRoomTypes(
        Array.isArray(p.roomTypes)
          ? p.roomTypes.map(rt => ({
              ...rt,
              pricePerNight: rt.pricePerNight ? String(rt.pricePerNight) : '',
              pricePerMonth: rt.pricePerMonth ? String(rt.pricePerMonth) : '',
              pricePerYear: rt.pricePerYear ? String(rt.pricePerYear) : '',
              media: (rt.images || []).map(url => ({ url, type: 'image' }))
            }))
          : []
      )
      if (Array.isArray(p.paymentPlans) && p.paymentPlans.length) {
        setPaymentPlans(p.paymentPlans)
      }
      setCurrentStep(1)
      setErrors({})
    } catch (err) {
      console.error('[loadForEdit]', err)
      flash(err.message || 'Failed to load property', 'error')
    } finally {
      if (mounted.current) setLoadingEdit(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM HELPERS - Simple, direct state updates
  // ─────────────────────────────────────────────────────────────────────────

  // UPDATE SINGLE FIELD - Works for ANY field (title, location, etc)
  const updateFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear error for this field if it exists
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  // SIMPLE LOCATION UPDATE - Direct, no complex logic
  const updateLocation = useCallback(value => {
    setForm(prev => ({
      ...prev,
      location: value,
      // Auto-sync address if it hasn't been manually set
      address: prev.address === prev.location ? value : prev.address
    }))
    setErrors(prev => {
      const next = { ...prev }
      delete next.location
      return next
    })
  }, [])

  const toggleFeature = useCallback(feat => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feat)
        ? prev.features.filter(x => x !== feat)
        : [...prev.features, feat]
    }))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // ROOM TYPES MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  const addRoomType = useCallback(() => {
    setRoomTypes(prev => [...prev, blankRoomType()])
    setErrors(prev => {
      const n = { ...prev }
      delete n.roomTypes
      return n
    })
  }, [])

  const updateRoomType = useCallback((idx, field, value) => {
    setRoomTypes(prev =>
      prev.map((rt, i) => (i === idx ? { ...rt, [field]: value } : rt))
    )
  }, [])

  const removeRoomType = useCallback(idx => {
    setRoomTypes(prev => prev.filter((_, i) => i !== idx))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // FLASH NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const flash = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    setTimeout(() => {
      if (mounted.current) setNotice(null)
    }, 3500)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // MEDIA HANDLING
  // ─────────────────────────────────────────────────────────────────────────

  const handleFiles = useCallback(files => {
    const valid = Array.from(files).filter(
      f => f?.type && (f.type.startsWith('image') || f.type.startsWith('video'))
    )
    if (!valid.length) return
    const mapped = valid.map(f => ({
      file: f,
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image'
    }))
    setForm(prev => ({ ...prev, media: [...(prev.media || []), ...mapped] }))
    setErrors(prev => {
      const n = { ...prev }
      delete n.media
      return n
    })
  }, [])

  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = e => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onEnter = e => {
      prevent(e)
      setDragActive(true)
    }
    const onLeave = e => {
      prevent(e)
      setDragActive(false)
    }
    const onDrop = e => {
      prevent(e)
      setDragActive(false)
      handleFiles(e.dataTransfer.files || [])
    }
    el.addEventListener('dragenter', onEnter)
    el.addEventListener('dragover', prevent)
    el.addEventListener('dragleave', onLeave)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragenter', onEnter)
      el.removeEventListener('dragover', prevent)
      el.removeEventListener('dragleave', onLeave)
      el.removeEventListener('drop', onDrop)
    }
  }, [handleFiles])

  const onFileInput = e => {
    handleFiles(e.target.files || [])
    e.target.value = ''
  }

  const removeMedia = useCallback(idx => {
    setForm(prev => {
      const next = [...(prev.media || [])]
      const item = next.splice(idx, 1)[0]
      try {
        if (item?.file) URL.revokeObjectURL(item.url)
      } catch {}
      return { ...prev, media: next }
    })
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // AI HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const generateAITitle = async () => {
    if (!form.category || !form.location) {
      flash('Select category & location first', 'warning')
      return
    }
    setAiGenerating(true)
    try {
      const res = await api.post('/api/ai/generate-title', {
        category: form.category,
        location: form.location,
        beds: form.beds,
        purpose: form.purpose
      })
      if (res.data?.success) {
        updateFormField('title', res.data.title)
        flash('AI title generated')
      }
    } catch {
      flash('AI generation failed', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const generateAIDescription = async () => {
    if (!form.title || !form.category) {
      flash('Add title and category first', 'warning')
      return
    }
    setAiGenerating(true)
    try {
      const res = await api.post('/api/ai/generate-description', {
        title: form.title,
        category: form.category,
        location: form.location,
        beds: form.beds,
        baths: form.baths,
        area: form.area,
        features: form.features
      })
      if (res.data?.success) {
        updateFormField('description', res.data.description)
        flash('AI description generated')
      }
    } catch {
      flash('AI generation failed', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const getAIPriceSuggestion = async () => {
    if (!form.category || !form.location) {
      flash('Select category & location first', 'warning')
      return
    }
    try {
      const res = await api.post('/api/ai/suggest-price', {
        category: form.category,
        location: form.location,
        beds: form.beds,
        baths: form.baths,
        area: form.area,
        purpose: form.purpose
      })
      if (res.data?.success) {
        const key = form.purpose === 'For Sale' ? 'price' : 'rentPrice'
        updateFormField(key, String(res.data.suggestedPrice))
        flash(`AI suggested ₦${res.data.suggestedPrice.toLocaleString()}`)
      }
    } catch {
      flash('Price suggestion unavailable', 'error')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────

  const collectErrors = useCallback(
    (step, f = form, rt = roomTypes) => {
      const e = {}
      if (step === 1) {
        if (!f.title?.trim()) e.title = 'Title is required'
        if (!f.location?.trim()) e.location = 'Location is required'
      }
      if (step === 2) {
        if (!['Land', 'Commercial'].includes(f.category)) {
          if (!f.beds) e.beds = 'Bedrooms are required'
          if (!f.baths) e.baths = 'Bathrooms are required'
        }
      }
      if (step === 3) {
        if (f.purpose === 'For Sale' && !f.price && !f.selectedPlotPrice)
          e.price = 'Sale price is required'
        if ((f.purpose === 'For Rent' || f.purpose === 'Both') && !f.rentPrice)
          e.rentPrice = 'Rent price is required'
        if (
          (f.category === 'Hotel' || f.category === 'Shortlet') &&
          rt.length === 0
        )
          e.roomTypes = `${f.category} listings require at least one room type`
      }
      if (step === 4) {
        if (!f.media?.length) e.media = 'At least one photo is required'
        if (!f.description?.trim()) e.description = 'Description is required'
      }
      return e
    },
    [form, roomTypes]
  )

  const validateStep = useCallback(
    step => {
      const e = collectErrors(step)
      setErrors(e)
      return !Object.keys(e).length
    },
    [collectErrors]
  )

  const validateAll = useCallback(() => {
    const all = {}
    for (let s = 1; s <= 4; s++) Object.assign(all, collectErrors(s))
    setErrors(all)
    const first = [1, 2, 3, 4].find(
      s => Object.keys(collectErrors(s)).length > 0
    )
    if (first && first !== currentStep) {
      setCurrentStep(first)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return !Object.keys(all).length
  }, [collectErrors, currentStep])

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => Math.min(s + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goPrev = () => {
    setCurrentStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = step => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (
      (form.title || form.description || form.media?.length > 0) &&
      !window.confirm('Discard changes and go back?')
    )
      return
    onBack?.()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────────────────

  const fmtMoney = v =>
    '₦' +
    (Number(String(v || 0).replace(/[^0-9.-]/g, '')) || 0).toLocaleString()

  const onSubmit = async (isDraft = false) => {
    if (loading) return
    if (!isDraft && !validateAll()) {
      flash('Please fix the highlighted errors', 'error')
      return
    }

    setLoading(true)
    try {
      // Upload media to Cloudinary
      const mediaOut = []
      for (const m of form.media || []) {
        if (m.file) {
          const url = await uploadToCloudinary(m.file).catch(() => null)
          if (url) mediaOut.push({ url, type: m.type || 'image' })
        } else if (m.url) {
          mediaOut.push({ url: m.url, type: m.type || 'image' })
        }
      }

      // Process room types
      const processedRoomTypes = []
      for (const rt of roomTypes) {
        const rtMedia = []
        for (const m of rt.media || []) {
          if (!m) continue
          if (m.file) {
            const url = await uploadToCloudinary(m.file).catch(() => null)
            if (url) rtMedia.push({ url, type: 'image' })
          } else if (m.url) {
            rtMedia.push({ url: m.url, type: m.type || 'image' })
          }
        }
        processedRoomTypes.push({
          name: rt.name || 'Standard Room',
          description: rt.description || '',
          qty: Number(rt.qty || 1),
          pricePerNight: rt.pricePerNight
            ? Number(rt.pricePerNight)
            : undefined,
          pricePerMonth: rt.pricePerMonth
            ? Number(rt.pricePerMonth)
            : undefined,
          pricePerYear: rt.pricePerYear ? Number(rt.pricePerYear) : undefined,
          occupancy: rt.occupancy || { adults: 2, children: 0 },
          amenities: rt.amenities || [],
          images: rtMedia.map(m => m.url),
          media: rtMedia,
          active: rt.active !== false
        })
      }

      // Build payload
      const payload = {
        title: form.title,
        description: form.description,
        purpose: form.purpose,
        category: form.category,
        transactionType: form.transactionType || null,
        creationTier: form.creationTier || creationTier,
        createdFrom: 'dashboard-wizard',

        price: form.price ? Number(form.price) : undefined,
        rentPrice: form.rentPrice ? Number(form.rentPrice) : undefined,
        rentFrequency: form.rentFrequency,
        currency: form.currency || 'NGN',
        autoPriceSuggestion: !!form.autoPriceSuggestion,

        selectedPlotId: form.selectedPlotId || undefined,
        selectedPlotLabel: form.selectedPlotLabel || undefined,
        selectedPlotPrice: form.selectedPlotPrice
          ? Number(form.selectedPlotPrice)
          : undefined,
        plotSizes: form.plotSizes || DEFAULT_PLOT_SIZES,

        beds: form.beds ? Number(form.beds) : undefined,
        baths: form.baths ? Number(form.baths) : undefined,
        bedrooms: form.beds ? Number(form.beds) : undefined,
        bathrooms: form.baths ? Number(form.baths) : undefined,
        maxRooms: form.maxRooms ? Number(form.maxRooms) : undefined,
        area: form.area || undefined,

        location: form.location,
        address: form.address || form.location,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,

        media: mediaOut,
        features: form.features,
        tags: form.tags,
        roomTypes: processedRoomTypes,

        paymentPlanSnapshot: paymentPlans[0],
        paymentPlans,

        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        schedulePublishAt: form.schedulePublishAt || undefined,

        premiere: !!form.premiere,
        visibility: form.visibility || 'public',
        isDraft,

        compliance: form.compliance,
        escrow: form.escrow
      }

      const isEdit = !!form._id
      const url = isEdit
        ? `/api/properties/${form._id}`
        : `/api/properties`

      const res = isEdit
        ? await api.put(url, payload)
        : await api.post(url, payload)

      if (res.data?.success) {
        flash(
          isDraft
            ? 'Draft saved!'
            : `Property ${isEdit ? 'updated' : 'created'}!`
        )
        form.media?.forEach(m => {
          try {
            if (m?.file) URL.revokeObjectURL(m.url)
          } catch {}
        })
        setTimeout(() => onSaved?.(res.data.property), 400)
      } else {
        flash('Save failed: ' + (res.data?.msg || 'Unknown error'), 'error')
      }
    } catch (err) {
      console.error('[onSubmit]', err)
      flash(
        err.response?.data?.msg || err.message || 'Error saving property',
        'error'
      )
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const tierInfo = TIER_LABELS[creationTier] || TIER_LABELS.single
  const isHotelOrShortlet =
    form.category === 'Hotel' || form.category === 'Shortlet'
  const availableFeatures = useMemo(() => {
    const extras = FEATURES_BY_TYPE[form.category] || []
    return Array.from(new Set([...DEFAULT_FEATURES, ...extras]))
  }, [form.category])

  if (loadingEdit) {
    return (
      <div className='upload-property-wizard'>
        <div className='loading-state'>
          <div className='spinner' />
          <p>Loading property…</p>
        </div>
      </div>
    )
  }

  return (
    <div className='upload-property-wizard'>
      {notice && (
        <div className={`toast-modern ${notice.type}`}>
          <Check size={18} /> {notice.message}
        </div>
      )}

      <div className='wizard-container'>
        {/* ── PLAN BANNER ── */}
        {planInfo && !editPropertyId && (() => {
          const pct = planInfo.limit === -1 ? 0 : Math.round((listingCount / planInfo.limit) * 100)
          const isFull = planInfo.limit !== -1 && listingCount >= planInfo.limit
          const isWarn = !isFull && pct >= 80
          return (
            <div className='plan-banner'>
              <div className='plan-info'>
                <span className='plan-icon'>🏠</span>
                <span>
                  <strong>{listingCount}</strong> of{' '}
                  <strong>{planInfo.limit === -1 ? '∞' : planInfo.limit}</strong> listings used
                  {' · '}
                  <strong style={{ textTransform: 'capitalize' }}>{planInfo.tier}</strong> Plan
                  {isFull && <span style={{ color: '#cc0000', marginLeft: 8 }}>— Limit reached</span>}
                  {isWarn && !isFull && <span style={{ color: '#f5a623', marginLeft: 8 }}>— Almost full</span>}
                </span>
              </div>
              {planInfo.limit !== -1 && (
                <div className='plan-bar'>
                  <div
                    className={`plan-bar-fill${isFull ? ' full' : isWarn ? ' warn' : ''}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              )}
              {(isFull || isWarn) && (
                <button
                  type='button'
                  className='btn-upgrade'
                  onClick={() => window.location.href = '/pricing'}
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          )
        })()}

        {/* ── HEADER ── */}
        <div className='wizard-header'>
          <button type='button' className='btn-back' onClick={handleBack}>
            <ArrowLeft size={20} /> Back to Properties
          </button>
          <div>
            <h2>{editPropertyId ? 'Edit Property' : 'Add New Property'}</h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--wz-muted)',
                fontWeight: 500
              }}
            >
              {tierInfo.emoji} {tierInfo.label}
            </p>
          </div>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div className='step-indicator'>
          {WIZARD_STEPS.map(({ id, title, icon: StepIcon }) => (
            <div
              key={id}
              className={`step${currentStep === id ? ' active' : ''}${
                currentStep > id ? ' completed' : ''
              }`}
              onClick={() => goToStep(id)}
            >
              <div className='step-circle'>
                {currentStep > id ? (
                  <Check size={20} />
                ) : (
                  <StepIcon size={20} />
                )}
              </div>
              <span className='step-title'>{title}</span>
            </div>
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className='wizard-content'>
          {/* STEP 1 — Property Basics */}
          {currentStep === 1 && (
            <div className='wizard-step'>
              <div className='step-header'>
                <h3>Tell us about your property</h3>
                <p>Start with the basics — what are you listing?</p>
              </div>

              {/* Transaction type */}
              <div className='form-field'>
                <label>Transaction Type</label>
                <div
                  className='radio-group-modern'
                  style={{ flexWrap: 'wrap', gap: '0.75rem' }}
                >
                  {[
                    { value: 'rental', label: 'Rental' },
                    { value: 'full_sale', label: 'Full Sale' },
                    { value: 'fractional', label: 'Fractional' },
                    { value: 'leaseback', label: 'Leaseback' },
                    { value: 'joint_venture', label: 'Joint Venture' }
                  ].map(tx => (
                    <label
                      key={tx.value}
                      className={`radio-card${
                        form.transactionType === tx.value ? ' active' : ''
                      }`}
                      style={{ flex: 'none', minWidth: 120 }}
                    >
                      <input
                        type='radio'
                        name='transactionType'
                        value={tx.value}
                        checked={form.transactionType === tx.value}
                        onChange={e =>
                          updateFormField('transactionType', e.target.value)
                        }
                      />
                      <span className='radio-label'>{tx.label}</span>
                      {form.transactionType === tx.value && (
                        <Check size={16} className='radio-check' />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div className='form-field'>
                <label>Property Type *</label>
                <div className='property-type-grid'>
                  {PROPERTY_TYPES.map(({ value, label, Icon, desc }) => (
                    <button
                      key={value}
                      type='button'
                      className={`property-type-card${
                        form.category === value ? ' active' : ''
                      }`}
                      onClick={() => updateFormField('category', value)}
                    >
                      <div className='type-icon'>
                        <Icon size={28} />
                      </div>
                      <div className='type-content'>
                        <span className='type-label'>{label}</span>
                        <span className='type-description'>{desc}</span>
                      </div>
                      {form.category === value && (
                        <div className='type-check'>
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div className='form-field'>
                <label>Purpose *</label>
                <div className='radio-group-modern'>
                  {['For Rent', 'For Sale', 'Both', 'Lease'].map(p => (
                    <label
                      key={p}
                      className={`radio-card${
                        form.purpose === p ? ' active' : ''
                      }`}
                    >
                      <input
                        type='radio'
                        name='purpose'
                        value={p}
                        checked={form.purpose === p}
                        onChange={e =>
                          updateFormField('purpose', e.target.value)
                        }
                      />
                      <span className='radio-label'>{p}</span>
                      {form.purpose === p && (
                        <Check size={16} className='radio-check' />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className='form-field'>
                <label>Property Title *</label>
                <div className='input-with-ai'>
                  <input
                    type='text'
                    placeholder='e.g., Luxury 3BR Apartment in Victoria Island'
                    value={form.title}
                    onChange={e => updateFormField('title', e.target.value)}
                    className={errors.title ? 'error' : ''}
                  />
                  <button
                    type='button'
                    className='ai-button'
                    disabled={aiGenerating}
                    onClick={generateAITitle}
                    title='Generate with AI'
                  >
                    {aiGenerating ? (
                      <Loader2 size={18} className='spin' />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </button>
                </div>
                {errors.title && (
                  <span className='error-text'>{errors.title}</span>
                )}
              </div>

              {/* Location - FIXED TO WORK PROPERLY */}
              <div className='form-field'>
                <label>Location *</label>
                <div className='input-icon'>
                  <MapPin size={18} />
                  <input
                    type='text'
                    placeholder='e.g., Lekki Phase 1, Lagos'
                    value={form.location}
                    onChange={e => updateLocation(e.target.value)}
                    className={errors.location ? 'error' : ''}
                  />
                </div>
                {errors.location && (
                  <span className='error-text'>{errors.location}</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Details */}
          {currentStep === 2 && (
            <div className='wizard-step'>
              <div className='step-header'>
                <h3>Property specifications</h3>
                <p>Add the physical details that matter to buyers</p>
              </div>

              {!['Land', 'Commercial'].includes(form.category) ? (
                <>
                  <div className='form-grid cols-3'>
                    {[
                      {
                        field: 'beds',
                        label: 'Bedrooms',
                        FieldIcon: Bed,
                        err: errors.beds
                      },
                      {
                        field: 'baths',
                        label: 'Bathrooms',
                        FieldIcon: Bath,
                        err: errors.baths
                      }
                    ].map(({ field, label, FieldIcon, err }) => (
                      <div key={field} className='form-field'>
                        <label>
                          <FieldIcon size={16} /> {label} *
                        </label>
                        <div className='number-stepper'>
                          <button
                            type='button'
                            onClick={() =>
                              updateFormField(
                                field,
                                String(
                                  Math.max(0, (Number(form[field]) || 0) - 1)
                                )
                              )
                            }
                          >
                            −
                          </button>
                          <input
                            type='number'
                            min='0'
                            value={form[field]}
                            onChange={e =>
                              updateFormField(field, e.target.value)
                            }
                            className={err ? 'error' : ''}
                          />
                          <button
                            type='button'
                            onClick={() =>
                              updateFormField(
                                field,
                                String((Number(form[field]) || 0) + 1)
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        {err && <span className='error-text'>{err}</span>}
                      </div>
                    ))}

                    <div className='form-field'>
                      <label>
                        <Maximize size={16} /> Total Rooms
                      </label>
                      <input
                        type='number'
                        min='0'
                        placeholder='Optional'
                        value={form.maxRooms}
                        onChange={e =>
                          updateFormField('maxRooms', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className='form-field'>
                    <label>Area / Size</label>
                    <input
                      type='text'
                      placeholder='e.g., 120 sqm or 1,200 sqft'
                      value={form.area}
                      onChange={e => updateFormField('area', e.target.value)}
                    />
                    <span className='helper-text'>
                      Include unit (sqm, sqft, acres, etc.)
                    </span>
                  </div>
                </>
              ) : (
                <div className='info-box'>
                  <AlertCircle size={18} />
                  <div>
                    <strong>Land / Commercial Properties</strong>
                    <p>
                      Bedroom and bathroom fields are not applicable. Configure
                      plot sizes in the pricing step.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Pricing + Room Types */}
          {currentStep === 3 && (
            <div className='wizard-step'>
              <div className='step-header'>
                <h3>Set your price</h3>
                <p>Let buyers know what you're asking</p>
              </div>

              <div className='pricing-section'>
                <div className='form-grid cols-2'>
                  <div className='form-field'>
                    <label>
                      {form.purpose === 'For Sale'
                        ? 'Sale Price *'
                        : 'Base Price'}
                    </label>
                    <div className='input-currency-modern'>
                      <span className='currency-symbol'>₦</span>
                      <input
                        type='text'
                        placeholder='0'
                        value={form.price}
                        onChange={e => updateFormField('price', e.target.value)}
                        className={errors.price ? 'error' : ''}
                      />
                    </div>
                    {errors.price && (
                      <span className='error-text'>{errors.price}</span>
                    )}
                  </div>

                  {form.purpose !== 'For Sale' && (
                    <>
                      <div className='form-field'>
                        <label>Rent Price *</label>
                        <div className='input-currency-modern'>
                          <span className='currency-symbol'>₦</span>
                          <input
                            type='text'
                            placeholder='0'
                            value={form.rentPrice}
                            onChange={e =>
                              updateFormField('rentPrice', e.target.value)
                            }
                            className={errors.rentPrice ? 'error' : ''}
                          />
                        </div>
                        {errors.rentPrice && (
                          <span className='error-text'>{errors.rentPrice}</span>
                        )}
                      </div>
                      <div className='form-field'>
                        <label>Rent Frequency</label>
                        <select
                          value={form.rentFrequency}
                          onChange={e =>
                            updateFormField('rentFrequency', e.target.value)
                          }
                        >
                          {(RENT_FREQUENCIES[form.category] || ['monthly']).map(
                            f => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type='button'
                  className='ai-suggestion-button'
                  onClick={getAIPriceSuggestion}
                >
                  <Sparkles size={18} /> Get AI Price Suggestion
                </button>
              </div>

              {/* Room types */}
              {isHotelOrShortlet && (
                <div className='form-field' style={{ marginTop: '2rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}
                  >
                    <label style={{ margin: 0 }}>
                      Room Types *{' '}
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--wz-muted)',
                          fontWeight: 400
                        }}
                      >
                        (required for {form.category})
                      </span>
                    </label>
                    <button
                      type='button'
                      className='ai-button'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px'
                      }}
                      onClick={addRoomType}
                    >
                      <Plus size={15} /> Add Room Type
                    </button>
                  </div>

                  {errors.roomTypes && (
                    <span
                      className='error-text'
                      style={{ display: 'block', marginBottom: 10 }}
                    >
                      {errors.roomTypes}
                    </span>
                  )}

                  {roomTypes.length === 0 ? (
                    <div className='info-box'>
                      <AlertCircle size={18} />
                      <div>
                        <strong>No room types yet</strong>
                        <p>
                          Click "Add Room Type" to add at least one room type
                          before publishing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                      }}
                    >
                      {roomTypes.map((rt, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--wz-surface)',
                            border: '1.5px solid var(--wz-border)',
                            borderRadius: 12,
                            padding: '20px 20px 16px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 14
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: 'var(--wz-slate)'
                              }}
                            >
                              Room Type {idx + 1}
                            </span>
                            <button
                              type='button'
                              onClick={() => removeRoomType(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#C0392B',
                                padding: 4,
                                lineHeight: 1
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className='form-grid cols-2'>
                            <div className='form-field'>
                              <label>Room Name *</label>
                              <input
                                type='text'
                                placeholder='e.g., Deluxe King Room'
                                value={rt.name}
                                onChange={e =>
                                  updateRoomType(idx, 'name', e.target.value)
                                }
                              />
                            </div>
                            <div className='form-field'>
                              <label>Quantity</label>
                              <input
                                type='number'
                                min='1'
                                value={rt.qty}
                                onChange={e =>
                                  updateRoomType(idx, 'qty', e.target.value)
                                }
                              />
                            </div>
                            <div className='form-field'>
                              <label>Price / Night (₦)</label>
                              <input
                                type='text'
                                placeholder='0'
                                value={rt.pricePerNight}
                                onChange={e =>
                                  updateRoomType(
                                    idx,
                                    'pricePerNight',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className='form-field'>
                              <label>Price / Month (₦)</label>
                              <input
                                type='text'
                                placeholder='0'
                                value={rt.pricePerMonth}
                                onChange={e =>
                                  updateRoomType(
                                    idx,
                                    'pricePerMonth',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className='form-field'>
                            <label>Description</label>
                            <input
                              type='text'
                              placeholder='Brief description of this room type'
                              value={rt.description}
                              onChange={e =>
                                updateRoomType(
                                  idx,
                                  'description',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Media & Features */}
          {currentStep === 4 && (
            <div className='wizard-step'>
              <div className='step-header'>
                <h3>Show off your property</h3>
                <p>Add photos and highlight the best features</p>
              </div>

              <div className='form-field'>
                <label>Photos & Videos *</label>
                <div
                  ref={dropRef}
                  className={`upload-zone-modern${
                    dragActive ? ' drag-active' : ''
                  }`}
                >
                  <input
                    ref={fileRef}
                    type='file'
                    multiple
                    accept='image/*,video/*'
                    style={{ display: 'none' }}
                    onChange={onFileInput}
                  />
                  <div className='upload-content'>
                    <Upload size={48} className='upload-icon' />
                    <h4>Drag & drop files here</h4>
                    <p>or click to browse</p>
                    <button
                      type='button'
                      className='btn-upload'
                      onClick={() => fileRef.current?.click()}
                    >
                      Choose Files
                    </button>
                  </div>
                </div>
                {errors.media && (
                  <span className='error-text'>{errors.media}</span>
                )}

                {form.media?.length > 0 && (
                  <div className='media-grid-modern'>
                    {form.media.map((m, i) => (
                      <div key={i} className='media-item'>
                        {m.type === 'image' ? (
                          <img src={m.url} alt='' loading='lazy' />
                        ) : (
                          <video src={m.url} />
                        )}
                        <button
                          type='button'
                          className='media-remove-btn'
                          onClick={() => removeMedia(i)}
                        >
                          <X size={16} />
                        </button>
                        {i === 0 && (
                          <span className='primary-badge'>Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='form-field'>
                <label>Description *</label>
                <div className='textarea-with-ai'>
                  <textarea
                    rows='6'
                    placeholder='Describe your property in detail. What makes it special?'
                    value={form.description}
                    onChange={e =>
                      updateFormField('description', e.target.value)
                    }
                    className={errors.description ? 'error' : ''}
                  />
                  <button
                    type='button'
                    className='ai-button-textarea'
                    onClick={generateAIDescription}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? (
                      <Loader2 size={18} className='spin' />
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>
                {errors.description && (
                  <span className='error-text'>{errors.description}</span>
                )}
                <span className='helper-text'>
                  {form.description?.length || 0} characters (recommended: 200+)
                </span>
              </div>

              <div className='form-field'>
                <label>Features & Amenities</label>
                <div className='features-grid-modern'>
                  {availableFeatures.map(f => (
                    <button
                      key={f}
                      type='button'
                      className={`feature-chip${
                        form.features.includes(f) ? ' active' : ''
                      }`}
                      onClick={() => toggleFeature(f)}
                    >
                      {form.features.includes(f) && <Check size={14} />} {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — Review & Publish */}
          {currentStep === 5 && (
            <div className='wizard-step'>
              <div className='step-header'>
                <h3>Review & Publish</h3>
                <p>One last look before going live</p>
              </div>

              {(() => {
                const signals = [
                  !!form.title,
                  !!form.location,
                  form.media?.length > 0,
                  (form.description?.length || 0) > 100,
                  form.features?.length > 3,
                  !!form.seoTitle
                ]
                const score = Math.round(
                  (signals.filter(Boolean).length / signals.length) * 100
                )
                return (
                  <div className='completion-score'>
                    <div className='score-circle'>
                      <svg viewBox='0 0 36 36' className='circular-chart'>
                        <path
                          className='circle-bg'
                          d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                        />
                        <path
                          className='circle'
                          strokeDasharray={`${score}, 100`}
                          d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                        />
                      </svg>
                      <div className='score-text'>
                        <span className='score-number'>{score}%</span>
                        <span className='score-label'>Complete</span>
                      </div>
                    </div>
                    <div className='score-details'>
                      <h4>Listing Quality</h4>
                      <p>
                        {score >= 80
                          ? 'Excellent! Your listing is ready to publish.'
                          : score >= 60
                          ? 'Good — consider adding more details for better visibility.'
                          : 'Your listing needs more information before publishing.'}
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className='property-preview-card'>
                <div className='preview-image'>
                  {form.media?.[0] ? (
                    form.media[0].type === 'image' ? (
                      <img src={form.media[0].url} alt='' />
                    ) : (
                      <video src={form.media[0].url} />
                    )
                  ) : (
                    <div className='placeholder-preview'>
                      <ImageIcon size={48} />
                    </div>
                  )}
                </div>
                <div className='preview-details'>
                  <h3>{form.title || 'Property Title'}</h3>
                  <div className='preview-location'>
                    <MapPin size={14} />
                    {[form.city, form.country].filter(Boolean).join(', ') ||
                      form.location ||
                      'Location'}
                  </div>
                  <div className='preview-specs'>
                    {form.beds && <span>{form.beds} Beds</span>}
                    {form.baths && <span>{form.baths} Baths</span>}
                    {form.area && <span>{form.area}</span>}
                    {form.transactionType && (
                      <span style={{ textTransform: 'capitalize' }}>
                        {form.transactionType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <div className='preview-price'>
                    {fmtMoney(form.price || form.rentPrice || 0)}
                    {form.rentFrequency && form.purpose !== 'For Sale' && (
                      <span className='frequency'> / {form.rentFrequency}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className='publish-options'>
                <label className='checkbox-modern'>
                  <input
                    type='checkbox'
                    checked={form.premiere}
                    onChange={e =>
                      updateFormField('premiere', e.target.checked)
                    }
                  />
                  <span>Mark as premiere listing</span>
                </label>
                <label className='checkbox-modern'>
                  <input
                    type='checkbox'
                    checked={form.visibility === 'private'}
                    onChange={e =>
                      updateFormField(
                        'visibility',
                        e.target.checked ? 'private' : 'public'
                      )
                    }
                  />
                  <span>Private listing (not publicly searchable)</span>
                </label>
                <div className='form-field' style={{ marginBottom: 0 }}>
                  <label>
                    <Calendar size={16} /> Schedule Publish Date (Optional)
                  </label>
                  <input
                    type='datetime-local'
                    value={form.schedulePublishAt}
                    onChange={e =>
                      updateFormField('schedulePublishAt', e.target.value)
                    }
                  />
                  <span className='helper-text'>
                    Leave empty to publish immediately
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        {/* FOOTER */}
        <div className='wizard-footer'>
          {currentStep > 1 && (
            <button type='button' className='btn-secondary' onClick={goPrev}>
              <ArrowLeft size={18} /> Previous
            </button>
          )}
          <div className='footer-spacer' />

          <button
            type='button'
            className='btn-secondary'
            onClick={() => onSubmit(true)}
            disabled={loading}
          >
            <Save size={18} /> Save Draft
          </button>

          {currentStep < 5 ? (
            <button type='button' className='btn-primary' onClick={goNext}>
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type='button'
              className='btn-primary btn-publish'
              onClick={() => onSubmit(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className='spin' /> Publishing…
                </>
              ) : (
                <>
                  <Save size={18} />{' '}
                  {form.schedulePublishAt ? 'Schedule Publish' : 'Publish Now'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
