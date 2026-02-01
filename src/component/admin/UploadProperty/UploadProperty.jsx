'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
  MapPin,
  Upload,
  Image as ImageIcon,
  Trash2,
  X,
  Plus,
  Save,
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Hotel as HotelIcon,
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
  Edit
} from 'lucide-react'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import './UploadProperty.scss'

/* -------------------- Constants -------------------- */

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
    icon: Building2,
    description: 'Multi-unit residential building'
  },
  {
    value: 'House',
    label: 'House',
    icon: Home,
    description: 'Single-family residence'
  },
  {
    value: 'Shortlet',
    label: 'Shortlet',
    icon: Home,
    description: 'Short-term rental'
  },
  {
    value: 'Hotel',
    label: 'Hotel',
    icon: HotelIcon,
    description: 'Hospitality accommodation'
  },
  {
    value: 'Land',
    label: 'Land',
    icon: Landmark,
    description: 'Vacant plot or acreage'
  },
  {
    value: 'Commercial',
    label: 'Commercial',
    icon: Store,
    description: 'Business property'
  }
]

/* -------------------- Initial Form -------------------- */

const emptyRoomType = () => ({
  id: '',
  name: '',
  description: '',
  qty: 1,
  pricePerNight: 0,
  pricePerMonth: 0,
  pricePerYear: 0,
  occupancy: { adults: 2, children: 0 },
  amenities: [],
  media: [],
  active: true
})

const initialForm = {
  _id: undefined,
  title: '',
  purpose: 'For Rent',
  category: 'Apartment',
  price: '',
  rentPrice: '',
  rentFrequency: 'monthly',
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
  description: '',
  features: [],
  tags: [],
  media: [],
  seoTitle: '',
  seoDescription: '',
  schedulePublishAt: '',
  autoPriceSuggestion: true,
  paymentPlans: [
    {
      id: 'out',
      name: 'Outright',
      installments: [{ dueInDays: 0, percent: 100 }]
    }
  ],
  plotSizes: DEFAULT_PLOT_SIZES,
  roomTypes: [],
  isDraft: false,
  visibility: 'public'
}

/* -------------------- Component -------------------- */

export default function UploadPropertyWizard ({ onAdded } = {}) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [showingList, setShowingList] = useState(true)

  // Data state
  const [properties, setProperties] = useState([])
  const [loadingProps, setLoadingProps] = useState(false)
  const [form, setForm] = useState({ ...initialForm })
  const [plotSizes, setPlotSizes] = useState(DEFAULT_PLOT_SIZES)
  const [paymentPlans, setPaymentPlans] = useState(initialForm.paymentPlans)
  const [selectedPlanId, setSelectedPlanId] = useState(paymentPlans[0].id)
  const [roomTypes, setRoomTypes] = useState([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [aiGenerating, setAiGenerating] = useState(false)

  const fileRef = useRef(null)
  const dropRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      form.media?.forEach(m => {
        try {
          if (m?.file && m?.url) URL.revokeObjectURL(m.url)
        } catch {}
      })
      roomTypes.forEach(rt => {
        rt.media?.forEach(m => {
          try {
            if (m?.file && m?.url) URL.revokeObjectURL(m.url)
          } catch {}
        })
      })
    }
  }, [form.media, roomTypes])

  /* -------------------- Helpers -------------------- */

  const flash = useCallback((msg, type = 'success') => {
    setNotice({ message: msg, type })
    setTimeout(() => {
      if (mountedRef.current) setNotice(null)
    }, 3500)
  }, [])

  const availableFeatures = useMemo(() => {
    const extras = FEATURES_BY_TYPE[form.category] || []
    return Array.from(new Set([...DEFAULT_FEATURES, ...extras]))
  }, [form.category])

  /* -------------------- API Functions -------------------- */

  const fetchMyProperties = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setProperties([])
      return
    }
    setLoadingProps(true)
    try {
      const res = await axios.get(`${backend}/api/properties/property/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success && Array.isArray(res.data.properties)) {
        setProperties(res.data.properties)
        setLoadingProps(false)
      } else {
        setProperties([])
      }
    } catch (err) {
      console.error(err)
      setProperties([])
      flash('Failed to load properties', 'error')
    } finally {
      if (mountedRef.current) setLoadingProps(false)
    }
  }, [backend, flash])

  useEffect(() => {
    fetchMyProperties()
  }, [fetchMyProperties])

  /* -------------------- Edit Property -------------------- */

  const editProperty = useCallback(
    async id => {
      const token = localStorage.getItem('token')
      if (!token) {
        flash('Not logged in', 'error')
        return
      }

      try {
        const res = await axios.get(`${backend}/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data?.success && res.data.property) {
          const prop = res.data.property

          // Convert existing media URLs to media objects
          const existingMedia = []
          if (Array.isArray(prop.images)) {
            existingMedia.push(
              ...prop.images.map(url => ({ url, type: 'image' }))
            )
          }
          if (Array.isArray(prop.video)) {
            existingMedia.push(
              ...prop.video.map(url => ({ url, type: 'video' }))
            )
          }

          // Format schedulePublishAt for datetime-local input
          let scheduleDateValue = ''
          if (prop.schedulePublishAt) {
            const date = new Date(prop.schedulePublishAt)
            if (!isNaN(date.getTime())) {
              scheduleDateValue = date.toISOString().slice(0, 16)
            }
          }

          setForm({
            _id: prop._id,
            title: prop.title || '',
            purpose: prop.purpose || 'For Rent',
            category: prop.category || 'Apartment',
            price: prop.price ? String(prop.price) : '',
            rentPrice: prop.rentPrice ? String(prop.rentPrice) : '',
            rentFrequency: prop.rentFrequency || 'monthly',
            selectedPlotId: prop.selectedPlotId || '',
            selectedPlotLabel: prop.selectedPlotLabel || '',
            selectedPlotPrice: prop.selectedPlotPrice
              ? String(prop.selectedPlotPrice)
              : '',
            beds: prop.beds ? String(prop.beds) : '',
            baths: prop.baths ? String(prop.baths) : '',
            maxRooms: prop.maxRooms ? String(prop.maxRooms) : '',
            area: prop.area || '',
            premiere: !!prop.premiere,
            location: prop.location || prop.address || '',
            address: prop.address || prop.location || '',
            description: prop.description || '',
            features: Array.isArray(prop.features) ? prop.features : [],
            tags: Array.isArray(prop.tags) ? prop.tags : [],
            media: existingMedia,
            seoTitle: prop.seoTitle || '',
            seoDescription: prop.seoDescription || '',
            schedulePublishAt: scheduleDateValue,
            autoPriceSuggestion: prop.autoPriceSuggestion ?? true,
            paymentPlans: Array.isArray(prop.paymentPlans)
              ? prop.paymentPlans
              : initialForm.paymentPlans,
            plotSizes: Array.isArray(prop.plotSizes)
              ? prop.plotSizes
              : DEFAULT_PLOT_SIZES,
            roomTypes: Array.isArray(prop.roomTypes) ? prop.roomTypes : [],
            isDraft: !!prop.isDraft,
            visibility: prop.visibility || 'public'
          })

          setRoomTypes(
            Array.isArray(prop.roomTypes)
              ? prop.roomTypes.map(rt => ({
                  ...rt,
                  media: rt.images?.map(url => ({ url, type: 'image' })) || []
                }))
              : []
          )

          setCurrentStep(1)
          setShowingList(false)
        }
      } catch (err) {
        console.error(err)
        flash('Failed to load property for editing', 'error')
      }
    },
    [backend, flash]
  )

  /* -------------------- Delete Property -------------------- */

  const deleteProperty = useCallback(
    async id => {
      if (!confirm('Are you sure you want to delete this property?')) return

      const token = localStorage.getItem('token')
      if (!token) {
        flash('Not logged in', 'error')
        return
      }

      try {
        const res = await axios.delete(`${backend}/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.data?.success) {
          flash('Property deleted successfully', 'success')
          await fetchMyProperties()
        } else {
          flash(res.data?.msg || 'Delete failed', 'error')
        }
      } catch (err) {
        console.error(err)
        flash('Error deleting property', 'error')
      }
    },
    [backend, flash, fetchMyProperties]
  )

  /* -------------------- AI Features -------------------- */

  const generateAITitle = async () => {
    if (!form.category || !form.location) {
      flash('Please select category and location first', 'warning')
      return
    }

    setAiGenerating(true)
    try {
      const response = await axios.post(`${backend}/api/ai/generate-title`, {
        category: form.category,
        location: form.location,
        beds: form.beds,
        purpose: form.purpose
      })

      if (response.data?.success) {
        setForm(f => ({ ...f, title: response.data.title }))
        flash('AI generated title successfully', 'success')
      }
    } catch (err) {
      console.error('AI generation failed:', err)
      flash('AI generation failed, please try again', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const generateAIDescription = async () => {
    if (!form.title || !form.category) {
      flash('Please add title and category first', 'warning')
      return
    }

    setAiGenerating(true)
    try {
      const response = await axios.post(
        `${backend}/api/ai/generate-description`,
        {
          title: form.title,
          category: form.category,
          location: form.location,
          beds: form.beds,
          baths: form.baths,
          area: form.area,
          features: form.features
        }
      )

      if (response.data?.success) {
        setForm(f => ({ ...f, description: response.data.description }))
        flash('AI generated description successfully', 'success')
      }
    } catch (err) {
      console.error('AI generation failed:', err)
      flash('AI generation failed, please try again', 'error')
    } finally {
      setAiGenerating(false)
    }
  }

  const getAIPriceSuggestion = async () => {
    if (!form.category || !form.location) {
      flash('Please select category and location first', 'warning')
      return
    }

    try {
      const response = await axios.post(`${backend}/api/ai/suggest-price`, {
        category: form.category,
        location: form.location,
        beds: form.beds,
        baths: form.baths,
        area: form.area,
        purpose: form.purpose
      })

      if (response.data?.success) {
        const suggestion = response.data.suggestedPrice
        setForm(f => ({
          ...f,
          [form.purpose === 'For Sale' ? 'price' : 'rentPrice']:
            String(suggestion)
        }))
        flash(`AI suggested price: ₦${suggestion.toLocaleString()}`, 'success')
      }
    } catch (err) {
      console.error('Price suggestion failed:', err)
      flash('Price suggestion unavailable', 'error')
    }
  }

  /* -------------------- Validation -------------------- */

  const validateStep = step => {
    const newErrors = {}

    if (step === 1) {
      if (!form.title) newErrors.title = 'Title is required'
      if (!form.location) newErrors.location = 'Location is required'
      if (!form.category) newErrors.category = 'Category is required'
    }

    if (step === 2) {
      if (form.category !== 'Land' && form.category !== 'Commercial') {
        if (!form.beds) newErrors.beds = 'Bedrooms required'
        if (!form.baths) newErrors.baths = 'Bathrooms required'
      }
    }

    if (step === 3) {
      if (
        form.purpose === 'For Sale' &&
        !form.price &&
        !form.selectedPlotPrice
      ) {
        newErrors.price = 'Sale price is required'
      }
      if (form.purpose === 'For Rent' && !form.rentPrice) {
        newErrors.rentPrice = 'Rent price is required'
      }
      if (form.category === 'Hotel' && roomTypes.length === 0) {
        newErrors.roomTypes = 'Add at least one room type for hotels'
      }
    }

    if (step === 4) {
      if (!form.media || form.media.length === 0) {
        newErrors.media = 'At least one image is required'
      }
      if (!form.description) {
        newErrors.description = 'Description is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const canProceed = step => {
    return validateStep(step)
  }

  /* -------------------- Navigation -------------------- */

  const goToNextStep = () => {
    if (canProceed(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = step => {
    if (step < currentStep || canProceed(currentStep)) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /* -------------------- Form Handlers -------------------- */

  const updateForm = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(e => {
        const newErrors = { ...e }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleFeature = feat => {
    setForm(f => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter(x => x !== feat)
        : [...f.features, feat]
    }))
  }

  /* -------------------- Media Handling -------------------- */

  const handleFiles = useCallback(files => {
    const mapped = files
      .filter(
        f =>
          f?.type && (f.type.startsWith('image') || f.type.startsWith('video'))
      )
      .map(f => ({
        file: f,
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video') ? 'video' : 'image'
      }))
    setForm(prev => ({ ...prev, media: [...(prev.media || []), ...mapped] }))
  }, [])

  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = e => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onDrag = e => {
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
      handleFiles(Array.from(e.dataTransfer.files || []))
    }

    el.addEventListener('dragenter', onDrag)
    el.addEventListener('dragover', prevent)
    el.addEventListener('dragleave', onLeave)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragenter', onDrag)
      el.removeEventListener('dragover', prevent)
      el.removeEventListener('dragleave', onLeave)
      el.removeEventListener('drop', onDrop)
    }
  }, [handleFiles])

  const onFileInput = e => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    e.target.value = ''
  }

  const removeMedia = idx => {
    setForm(prev => {
      const next = [...(prev.media || [])]
      const item = next[idx]
      try {
        if (item?.file && item?.url) URL.revokeObjectURL(item.url)
      } catch {}
      next.splice(idx, 1)
      return { ...prev, media: next }
    })
  }

  /* -------------------- Submit -------------------- */

  const formatMoney = v => {
    if (!v && v !== 0) return '—'
    const n = Number(String(v).replace(/[^0-9.-]/g, '')) || 0
    return '₦' + n.toLocaleString()
  }

  const onSubmit = async (isDraft = false) => {
    if (loading) return

    // Validate all steps unless saving as draft
    if (!isDraft) {
      const allValid = [1, 2, 3, 4].every(step => validateStep(step))
      if (!allValid) {
        flash('Please complete all required fields', 'error')
        return
      }
    }

    const token = localStorage.getItem('token')
    if (!token) {
      flash('Not logged in', 'error')
      return
    }

    setLoading(true)
    try {
      // Upload media files
      const mediaOutputs = []
      for (const m of form.media || []) {
        if (m.file) {
          const url = await uploadToCloudinary(m.file)
          if (url) mediaOutputs.push({ url, type: m.type || 'image' })
        } else if (m.url) {
          mediaOutputs.push({ url: m.url, type: m.type || 'image' })
        }
      }

      // Process room types media
      const processedRoomTypes = []
      for (const rt of roomTypes) {
        const urls = []
        const mediaArr = []
        for (const m of rt.media || []) {
          if (!m) continue
          if (m.file) {
            try {
              const url = await uploadToCloudinary(m.file)
              if (url) {
                urls.push(url)
                mediaArr.push({ url, type: m.type || 'image' })
              }
            } catch (err) {
              console.error('Room media upload failed', err)
            }
          } else if (m.url) {
            urls.push(m.url)
            mediaArr.push({ url: m.url, type: m.type || 'image' })
          }
        }

        processedRoomTypes.push({
          name: rt.name,
          description: rt.description,
          qty: Number(rt.qty || 0),
          pricePerNight: rt.pricePerNight
            ? Number(rt.pricePerNight)
            : undefined,
          pricePerMonth: rt.pricePerMonth
            ? Number(rt.pricePerMonth)
            : undefined,
          pricePerYear: rt.pricePerYear ? Number(rt.pricePerYear) : undefined,
          occupancy: rt.occupancy,
          amenities: rt.amenities || [],
          images: urls,
          media: mediaArr,
          active: typeof rt.active === 'boolean' ? rt.active : true
        })
      }

      // Prepare payload matching backend expectations
      const payload = {
        title: form.title,
        description: form.description,
        purpose: form.purpose,
        category: form.category,
        price: form.price ? Number(form.price) : undefined,
        rentPrice: form.rentPrice ? Number(form.rentPrice) : undefined,
        rentFrequency: form.rentFrequency,
        features: form.features,
        tags: form.tags,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        schedulePublishAt: form.schedulePublishAt || undefined,
        autoPriceSuggestion: !!form.autoPriceSuggestion,
        paymentPlanSnapshot:
          paymentPlans.find(p => p.id === selectedPlanId) || paymentPlans[0],
        paymentPlans,
        plotSizes: form.plotSizes || plotSizes,
        selectedPlotId: form.selectedPlotId,
        selectedPlotLabel: form.selectedPlotLabel,
        selectedPlotPrice: form.selectedPlotPrice
          ? Number(form.selectedPlotPrice)
          : undefined,
        media: mediaOutputs,
        area: form.area,
        beds: form.beds ? Number(form.beds) : undefined,
        baths: form.baths ? Number(form.baths) : undefined,
        maxRooms: form.maxRooms ? Number(form.maxRooms) : undefined,
        premiere: !!form.premiere,
        location: form.location,
        address: form.address || form.location,
        roomTypes: processedRoomTypes,
        visibility: form.visibility || 'public',
        isDraft: isDraft,
        createdFrom: 'admin-ui'
      }

      const url = form._id
        ? `${backend}/api/properties/${form._id}`
        : `${backend}/api/properties`
      const method = form._id ? 'put' : 'post'

      const res = await axios[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.data?.success) {
        flash(
          isDraft
            ? 'Draft saved successfully!'
            : `Property ${form._id ? 'updated' : 'created'} successfully!`,
          'success'
        )

        // Clean up object URLs
        form.media?.forEach(m => {
          try {
            if (m?.file && m?.url) URL.revokeObjectURL(m.url)
          } catch {}
        })
        roomTypes.forEach(rt =>
          rt.media?.forEach(m => {
            try {
              if (m?.file && m?.url) URL.revokeObjectURL(m.url)
            } catch {}
          })
        )

        setForm({ ...initialForm })
        setRoomTypes([])
        setCurrentStep(1)
        await fetchMyProperties()
        setShowingList(true)
        if (typeof onAdded === 'function') onAdded(res.data.property)
      } else {
        flash('Save failed: ' + (res.data?.msg || 'unknown'), 'error')
      }
    } catch (err) {
      console.error(err)
      const errorMsg =
        err.response?.data?.msg || err.message || 'Error saving property'
      flash(errorMsg, 'error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  /* -------------------- Render Wizard Steps -------------------- */

  const renderStep1 = () => (
    <div className='wizard-step'>
      <div className='step-header'>
        <h3>Tell us about your property</h3>
        <p>Start with the basics - what are you listing?</p>
      </div>

      <div className='form-field'>
        <label>Property Type *</label>
        <div className='property-type-grid'>
          {PROPERTY_TYPES.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              type='button'
              className={`property-type-card ${
                form.category === value ? 'active' : ''
              }`}
              onClick={() => updateForm('category', value)}
            >
              <div className='type-icon'>
                <Icon size={28} />
              </div>
              <div className='type-content'>
                <span className='type-label'>{label}</span>
                <span className='type-description'>{description}</span>
              </div>
              {form.category === value && (
                <div className='type-check'>
                  <Check size={16} />
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.category && (
          <span className='error-text'>{errors.category}</span>
        )}
      </div>

      <div className='form-field'>
        <label>Purpose *</label>
        <div className='radio-group-modern'>
          {['For Rent', 'For Sale'].map(purpose => (
            <label
              key={purpose}
              className={`radio-card ${
                form.purpose === purpose ? 'active' : ''
              }`}
            >
              <input
                type='radio'
                name='purpose'
                value={purpose}
                checked={form.purpose === purpose}
                onChange={e => updateForm('purpose', e.target.value)}
              />
              <span className='radio-label'>{purpose}</span>
              {form.purpose === purpose && (
                <Check size={18} className='radio-check' />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className='form-field'>
        <label>Property Title *</label>
        <div className='input-with-ai'>
          <input
            type='text'
            placeholder='e.g., Luxury 3BR Apartment in Victoria Island'
            value={form.title}
            onChange={e => updateForm('title', e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          <button
            type='button'
            className='ai-button'
            onClick={generateAITitle}
            disabled={aiGenerating}
            title='Generate with AI'
          >
            {aiGenerating ? (
              <Loader2 size={18} className='spin' />
            ) : (
              <Sparkles size={18} />
            )}
          </button>
        </div>
        {errors.title && <span className='error-text'>{errors.title}</span>}
        <span className='helper-text'>
          Be descriptive and include key features
        </span>
      </div>

      <div className='form-field'>
        <label>Location *</label>
        <div className='input-icon'>
          <MapPin size={18} />
          <input
            type='text'
            placeholder='e.g., Lekki Phase 1, Lagos'
            value={form.location}
            onChange={e => {
              updateForm('location', e.target.value)
              if (!form.address) {
                updateForm('address', e.target.value)
              }
            }}
            className={errors.location ? 'error' : ''}
          />
        </div>
        {errors.location && (
          <span className='error-text'>{errors.location}</span>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className='wizard-step'>
      <div className='step-header'>
        <h3>Property specifications</h3>
        <p>Add the physical details that matter to buyers</p>
      </div>

      {!(form.category === 'Land' || form.category === 'Commercial') && (
        <>
          <div className='form-grid cols-3'>
            <div className='form-field'>
              <label>
                <Bed size={16} /> Bedrooms *
              </label>
              <div className='number-stepper'>
                <button
                  type='button'
                  onClick={() =>
                    updateForm(
                      'beds',
                      String(Math.max(0, (Number(form.beds) || 0) - 1))
                    )
                  }
                >
                  -
                </button>
                <input
                  type='number'
                  min='0'
                  value={form.beds}
                  onChange={e => updateForm('beds', e.target.value)}
                  className={errors.beds ? 'error' : ''}
                />
                <button
                  type='button'
                  onClick={() =>
                    updateForm('beds', String((Number(form.beds) || 0) + 1))
                  }
                >
                  +
                </button>
              </div>
              {errors.beds && <span className='error-text'>{errors.beds}</span>}
            </div>

            <div className='form-field'>
              <label>
                <Bath size={16} /> Bathrooms *
              </label>
              <div className='number-stepper'>
                <button
                  type='button'
                  onClick={() =>
                    updateForm(
                      'baths',
                      String(Math.max(0, (Number(form.baths) || 0) - 1))
                    )
                  }
                >
                  -
                </button>
                <input
                  type='number'
                  min='0'
                  value={form.baths}
                  onChange={e => updateForm('baths', e.target.value)}
                  className={errors.baths ? 'error' : ''}
                />
                <button
                  type='button'
                  onClick={() =>
                    updateForm('baths', String((Number(form.baths) || 0) + 1))
                  }
                >
                  +
                </button>
              </div>
              {errors.baths && (
                <span className='error-text'>{errors.baths}</span>
              )}
            </div>

            <div className='form-field'>
              <label>
                <Maximize size={16} /> Total Rooms
              </label>
              <input
                type='number'
                min='0'
                placeholder='Optional'
                value={form.maxRooms}
                onChange={e => updateForm('maxRooms', e.target.value)}
              />
            </div>
          </div>

          <div className='form-field'>
            <label>Area / Size</label>
            <input
              type='text'
              placeholder='e.g., 120 sqm or 1,200 sqft'
              value={form.area}
              onChange={e => updateForm('area', e.target.value)}
            />
            <span className='helper-text'>
              Include unit (sqm, sqft, acres, etc.)
            </span>
          </div>
        </>
      )}

      {form.category === 'Land' && (
        <div className='info-box'>
          <AlertCircle size={18} />
          <div>
            <strong>Land Properties</strong>
            <p>
              Bedroom and bathroom fields are not applicable for land. You'll
              configure plot sizes in the next step.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className='wizard-step'>
      <div className='step-header'>
        <h3>Set your price</h3>
        <p>Let buyers know what you're asking</p>
      </div>

      <div className='pricing-section'>
        <div className='form-grid cols-2'>
          <div className='form-field'>
            <label>
              {form.purpose === 'For Sale' ? 'Sale Price *' : 'Base Price'}
            </label>
            <div className='input-currency-modern'>
              <span className='currency-symbol'>₦</span>
              <input
                type='text'
                placeholder='0'
                value={form.price}
                onChange={e => updateForm('price', e.target.value)}
                className={errors.price ? 'error' : ''}
              />
            </div>
            {errors.price && <span className='error-text'>{errors.price}</span>}
          </div>

          {form.purpose === 'For Rent' && (
            <>
              <div className='form-field'>
                <label>Rent Price *</label>
                <div className='input-currency-modern'>
                  <span className='currency-symbol'>₦</span>
                  <input
                    type='text'
                    placeholder='0'
                    value={form.rentPrice}
                    onChange={e => updateForm('rentPrice', e.target.value)}
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
                  onChange={e => updateForm('rentFrequency', e.target.value)}
                >
                  {(RENT_FREQUENCIES[form.category] || ['monthly']).map(
                    freq => (
                      <option key={freq} value={freq}>
                        {freq}
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
          <Sparkles size={18} />
          Get AI Price Suggestion
        </button>
      </div>

      {errors.roomTypes && (
        <span className='error-text'>{errors.roomTypes}</span>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className='wizard-step'>
      <div className='step-header'>
        <h3>Show off your property</h3>
        <p>Add photos and highlight the best features</p>
      </div>

      <div className='form-field'>
        <label>Photos & Videos *</label>
        <div
          ref={dropRef}
          className={`upload-zone-modern ${dragActive ? 'drag-active' : ''}`}
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
        {errors.media && <span className='error-text'>{errors.media}</span>}

        {form.media && form.media.length > 0 && (
          <div className='media-grid-modern'>
            {form.media.map((m, i) => (
              <div key={i} className='media-item'>
                {m.type === 'image' ? (
                  <img src={m.url} alt='' />
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
                {i === 0 && <span className='primary-badge'>Primary</span>}
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
            onChange={e => updateForm('description', e.target.value)}
            className={errors.description ? 'error' : ''}
          />
          <button
            type='button'
            className='ai-button-textarea'
            onClick={generateAIDescription}
            disabled={aiGenerating}
            title='Generate with AI'
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
              className={`feature-chip ${
                form.features.includes(f) ? 'active' : ''
              }`}
              onClick={() => toggleFeature(f)}
            >
              {form.features.includes(f) && <Check size={14} />}
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => {
    const completionScore = () => {
      let score = 0
      if (form.title) score += 20
      if (form.location) score += 20
      if (form.media?.length > 0) score += 20
      if (form.description && form.description.length > 100) score += 20
      if (form.features?.length > 3) score += 10
      if (form.seoTitle) score += 10
      return score
    }

    const score = completionScore()

    return (
      <div className='wizard-step'>
        <div className='step-header'>
          <h3>Review & Publish</h3>
          <p>One last look before going live</p>
        </div>

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
                ? 'Good! Consider adding more details for better visibility.'
                : 'Your listing needs more information.'}
            </p>
          </div>
        </div>

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
              {form.location || 'Location'}
            </div>
            <div className='preview-specs'>
              {form.beds && <span>{form.beds} Beds</span>}
              {form.baths && <span>{form.baths} Baths</span>}
              {form.area && <span>{form.area}</span>}
            </div>
            <div className='preview-price'>
              {formatMoney(form.price || form.rentPrice || 0)}
              {form.rentFrequency && form.purpose === 'For Rent' && (
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
              onChange={e => updateForm('premiere', e.target.checked)}
            />
            <span>Mark as premiere listing</span>
          </label>

          <div className='form-field'>
            <label>
              <Calendar size={16} /> Schedule Publish Date (Optional)
            </label>
            <input
              type='datetime-local'
              value={form.schedulePublishAt}
              onChange={e => updateForm('schedulePublishAt', e.target.value)}
            />
            <span className='helper-text'>
              Leave empty to publish immediately
            </span>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------- Main Render -------------------- */

  return (
    <div className='upload-property-wizard'>
      {notice && (
        <div className={`toast-modern ${notice.type}`}>
          <Check size={18} />
          {notice.message}
        </div>
      )}

      {showingList ? (
        <>
          <header className='page-header'>
            <div className='header-content'>
              <div className='header-text'>
                <h1>My Properties</h1>
                <p>Manage your property listings</p>
              </div>
              <button
                className='btn-primary'
                onClick={() => {
                  setForm({ ...initialForm })
                  setCurrentStep(1)
                  setShowingList(false)
                }}
              >
                <Plus size={20} />
                Add Property
              </button>
            </div>
          </header>

          <div className='properties-grid'>
            {loadingProps ? (
              <div className='loading-state'>
                <div className='spinner'></div>
                <p>Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <Building2 size={48} />
                </div>
                <h3>No properties yet</h3>
                <p>Start by adding your first property listing</p>
                <button
                  className='btn-primary'
                  onClick={() => {
                    setForm({ ...initialForm })
                    setShowingList(false)
                  }}
                >
                  <Plus size={18} />
                  Create Property
                </button>
              </div>
            ) : (
              properties.map(p => (
                <div key={p._id || p.id} className='property-card'>
                  <div className='property-card-image'>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} />
                    ) : (
                      <div className='placeholder-image'>
                        <Building2 size={32} />
                      </div>
                    )}
                    {p.isDraft && <span className='draft-badge'>Draft</span>}
                  </div>
                  <div className='property-card-content'>
                    <h3>{p.title}</h3>
                    <div className='property-meta'>
                      <span className='category'>{p.category}</span>
                      <span className='purpose'>{p.purpose}</span>
                    </div>
                    <div className='property-location'>
                      <MapPin size={14} />
                      {p.location || p.address}
                    </div>
                    <div className='property-price'>
                      {formatMoney(p.price || p.rentPrice || 0)}
                    </div>
                    <div className='property-actions'>
                      <button
                        className='btn-icon'
                        onClick={() => editProperty(p._id)}
                        title='Edit'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className='btn-icon danger'
                        onClick={() => deleteProperty(p._id)}
                        title='Delete'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className='wizard-container'>
          <div className='wizard-header'>
            <button
              type='button'
              className='btn-back'
              onClick={() => {
                if (confirm('Discard changes and go back?')) {
                  setShowingList(true)
                  setForm({ ...initialForm })
                  setCurrentStep(1)
                }
              }}
            >
              <ArrowLeft size={20} />
              Back to Properties
            </button>
            <h2>{form._id ? 'Edit Property' : 'Add New Property'}</h2>
          </div>

          {/* Step Indicator */}
          <div className='step-indicator'>
            {WIZARD_STEPS.map(({ id, title, icon: Icon }) => (
              <div
                key={id}
                className={`step ${currentStep === id ? 'active' : ''} ${
                  currentStep > id ? 'completed' : ''
                }`}
                onClick={() => goToStep(id)}
              >
                <div className='step-circle'>
                  {currentStep > id ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className='step-title'>{title}</span>
              </div>
            ))}
          </div>

          {/* Wizard Content */}
          <div className='wizard-content'>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* Navigation Footer */}
          <div className='wizard-footer'>
            {currentStep > 1 && (
              <button
                type='button'
                className='btn-secondary'
                onClick={goToPrevStep}
              >
                <ArrowLeft size={18} />
                Previous
              </button>
            )}

            <div className='footer-spacer' />

            {/* Save Draft Button */}
            <button
              type='button'
              className='btn-secondary'
              onClick={() => onSubmit(true)}
              disabled={loading}
            >
              <Save size={18} />
              Save Draft
            </button>

            {currentStep < 5 ? (
              <button
                type='button'
                className='btn-primary'
                onClick={goToNextStep}
              >
                Next Step
                <ArrowRight size={18} />
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
                    <Loader2 size={18} className='spin' />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {form.schedulePublishAt
                      ? 'Schedule Publish'
                      : 'Publish Now'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
