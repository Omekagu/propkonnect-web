'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  ArrowLeft, ArrowRight, Building2, Home, Store, Landmark,
  Check, Sparkles, DollarSign, Bed, Bath, Maximize2,
  FileText, Eye, Loader2, Image as ImageIcon, Plus, Trash2,
  MapPin, Shield, Lock, HotelIcon, SquarePen
} from 'lucide-react'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import './UploadProperty.scss'

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Rooms' },
  { id: 5, label: 'Pricing' },
  { id: 6, label: 'Media' },
  { id: 7, label: 'Policies' },
  { id: 8, label: 'Publish' }
]

const PROPERTY_TYPES = [
  { value: 'Apartment',  label: 'Apartment',  Icon: Building2, desc: 'Flat in a multi-unit building' },
  { value: 'House',      label: 'House',       Icon: Home,      desc: 'Single-family residence' },
  { value: 'Shortlet',   label: 'Shortlet',    Icon: Home,      desc: 'Short-term rental' },
  { value: 'Hotel',      label: 'Hotel',       Icon: Building2, desc: 'Hospitality accommodation' },
  { value: 'Land',       label: 'Land / Plot', Icon: Landmark,  desc: 'Vacant plot or acreage' },
  { value: 'Commercial', label: 'Commercial',  Icon: Store,     desc: 'Business property' }
]

const ALL_FEATURES = [
  'Air Conditioning', 'Free Wi-Fi', 'Parking', 'Swimming Pool', 'Gym',
  'Security', 'CCTV', 'Balcony', 'Terrace', 'Laundry',
  'Elevator', 'Generator', 'Water Heater', 'Furnished', 'Pet Friendly'
]
const FEATURES_BY_TYPE = {
  Hotel:      ['Room Service', 'Breakfast Included', 'Concierge', 'Mini Bar'],
  Shortlet:   ['Self Check-in', 'Cleaning Service', 'Kitchenette'],
  Apartment:  ['Gym', 'Elevator', 'Pet Friendly'],
  House:      ['Garden', 'Garage', 'Fireplace'],
  Commercial: ['Loading Bay', 'Office Space']
}

const AMENITY_OPTIONS = ['TV', 'AC', 'Fridge', 'Wardrobe', 'Safe', 'Bathtub', 'Balcony', 'WiFi', 'Minibar', 'Kitchenette', 'Workspace']

const AMENITY_CATEGORIES = {
  'Parking':        ['Free parking on premises', 'Paid parking', 'Street parking', 'EV charging station'],
  'Internet':       ['Free WiFi', 'WiFi (paid)', 'Wired internet'],
  'Kitchen':        ['Kitchen', 'Kitchenette', 'Refrigerator', 'Microwave', 'Oven', 'Dishwasher', 'Coffee maker', 'Toaster', 'Electric kettle'],
  'Bedroom':        ['Extra pillows & blankets', 'Linens provided', 'Wardrobe / Closet', 'Blackout curtains'],
  'Bathroom':       ['Private bathroom', 'Shared bathroom', 'Bathtub', 'Shower', 'Hair dryer', 'Towels', 'Slippers', 'Toiletries'],
  'Media & Tech':   ['TV', 'Cable TV', 'Netflix / Streaming', 'DVD Player', 'Radio', 'Telephone'],
  'Pets':           ['Pets allowed', 'Pet food bowl', 'Pet bed'],
  'Outdoors':       ['Balcony', 'Terrace', 'Garden', 'BBQ grill', 'Outdoor furniture', 'Swimming pool', 'Hot tub'],
  'Food & Drink':   ['Breakfast included', 'All meals included', 'In-room dining', 'Bar', 'Restaurant on site'],
  'Building':       ['Elevator', 'Gym', 'Laundry facilities', 'Business center', '24/7 front desk', 'Concierge', 'ATM'],
  'Entertainment':  ['Children\'s playground', 'Game room', 'Spa', 'Sauna', 'Bicycle rental'],
  'Safety':         ['24/7 Security', 'CCTV', 'Smoke alarm', 'Fire extinguisher', 'Safe deposit box', 'Key card access']
}

const BUILDING_CHARACTERISTICS = ['Apartment Complex', 'Villa', 'Bungalow', 'Duplex', 'Townhouse', 'Penthouse', 'Studio', 'Boutique Hotel', 'Guesthouse', 'Hostel', 'Serviced Apartment']
const LANGUAGES_LIST = ['English', 'French', 'Arabic', 'Spanish', 'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Mandarin', 'German', 'Italian', 'Portuguese']
const PAYMENT_METHODS_LIST = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Money', 'Paystack', 'Stripe', 'Cryptocurrency']
const NEARBY_CATEGORIES = ['Restaurant', 'Cafe', 'Airport', 'Train Station', 'Bus Stop', 'Hospital', 'Pharmacy', 'Supermarket', 'Shopping Mall', 'Beach', 'Park', 'School', 'Bank', 'ATM', 'Gym', 'Tourist Attraction']
const COMPLIANCE_DOCS = [
  { key: 'title_deed',     label: 'Title Deed',       desc: 'Proof of ownership' },
  { key: 'land_registry',  label: 'Land Registry',    desc: 'Official land record' },
  { key: 'survey_plan',    label: 'Survey Plan',      desc: 'Plot boundaries' },
  { key: 'building_permit',label: 'Building Permit',  desc: 'Construction approval' }
]
const PURPOSES    = ['For Rent', 'For Sale', 'Both']
const CURRENCIES  = ['NGN', 'USD', 'EUR', 'GBP']
const FREQUENCIES = { Apartment:'monthly', House:'monthly', Shortlet:'per night', Hotel:'per night', Land:'yearly', Commercial:'monthly' }
const FREQ_OPTIONS = { Apartment:['monthly','yearly'], House:['monthly','yearly','per night'], Shortlet:['per night','daily'], Hotel:['per night'], Land:['monthly','yearly'], Commercial:['monthly','yearly'] }

const mkBlankForm = () => ({
  _id: undefined,
  category: 'Apartment',
  purpose: 'For Rent',
  transactionType: null,
  title: '', description: '',
  address: '', city: '', state: '', country: 'Nigeria',
  beds: '', baths: '', area: '', maxRooms: '',
  price: '', rentPrice: '', currency: 'NGN',
  rentFrequency: 'monthly',
  features: [], tags: [],
  media: [],
  compliance: { verified: false, score: 0, documents: [] },
  escrow: { status: 'pending' },
  isDraft: false,
  visibility: 'public',
  premiere: false,
  paymentPlans: [{ id: 'out', name: 'Outright', installments: [{ dueInDays: 0, percent: 100 }] }],
  cautionFee: { required: false, amount: '', description: '' },
  seoTitle: '', seoDescription: '',
  propertySpaceType: null,
  buildingCharacteristics: [],
  amenitiesDetailed: {},
  languagesSpoken: [],
  nearbyPlaces: [],
  houseRules: {
    checkIn: { from: '14:00', to: '22:00' },
    checkOut: { from: '08:00', to: '11:00' },
    smokingAllowed: false,
    petsAllowed: false,
    petCharge: '',
    childrenAllowed: true,
    childrenPolicy: '',
    ageRestriction: '',
    cribAvailable: false,
    extraBedAvailable: false,
    cancellationPolicy: '',
    paymentMethods: []
  }
})

const mkRoomType = () => ({
  name: '', description: '', qty: 1,
  pricePerNight: '', pricePerMonth: '', pricePerYear: '',
  occupancy: { adults: 2, children: 0 },
  amenities: [], media: [], active: true
})

// ─── Component ───────────────────────────────────────────────────────────────

export default function UploadPropertyWizard ({
  editPropertyId = null,
  creationTier = 'single',
  onBack,
  onSaved
}) {
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState(mkBlankForm)
  const [rooms, setRooms]         = useState([])
  const [payPlans, setPayPlans]   = useState([{ id: 'out', name: 'Outright', installments: [{ dueInDays:0, percent:100 }] }])
  const [errors, setErrors]       = useState({})
  const [notice, setNotice]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [editing, setEditing]     = useState(false)
  const [aiWorking, setAiWorking] = useState(false)
  const [planInfo, setPlanInfo]   = useState(null)
  const [listingCount, setListingCount] = useState(0)
  const [dragOver, setDragOver]   = useState(false)

  const mounted = useRef(true)
  const fileRef  = useRef(null)
  const dropRef  = useRef(null)

  useEffect(() => {
    mounted.current = true          // re-arm on every mount (fixes React Strict Mode double-invoke)
    return () => { mounted.current = false }
  }, [])

  // Load plan info on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem('userData') || localStorage.getItem('user')
        if (stored) {
          const u = JSON.parse(stored)
          const tier  = u?.plan?.tier || 'free'
          const limit = u?.plan?.listingLimit ?? 1
          const isOnTrial = u?.plan?.isOnTrial || false
          const trialEndsAt = u?.plan?.trialEndsAt

          // Check if trial is still active
          const trialActive = isOnTrial && trialEndsAt && new Date() < new Date(trialEndsAt)
          setPlanInfo({ tier, limit, trialActive, trialEndsAt })
        }
        const res = await api.get('/api/properties/property/mine')
        if (mounted.current) {
          setListingCount(res.data?.properties?.length ?? res.data?.data?.length ?? 0)
        }
      } catch { /* non-critical */ }
    }
    load()
  }, [])

  // Load for edit
  useEffect(() => {
    if (!editPropertyId) return
    const load = async () => {
      setEditing(true)
      try {
        const res = await api.get(`/api/properties/${editPropertyId}`)
        const p = res.data?.property
        if (!p) throw new Error('Property not found')
        const mediaArr = [...(p.images||[]).map(u=>({url:u,type:'image'})), ...(p.video||[]).map(u=>({url:u,type:'video'}))]
        setForm({
          _id: p._id,
          category: p.category||'Apartment',
          purpose: p.purpose||'For Rent',
          transactionType: p.transactionType||null,
          title: p.title||'',
          description: p.description||'',
          address: p.address||p.location||'',
          city: p.city||'',
          state: p.state||'',
          country: p.country||'Nigeria',
          beds: p.bedrooms ? String(p.bedrooms) : '',
          baths: p.bathrooms ? String(p.bathrooms) : '',
          area: p.area||'',
          maxRooms: p.maxRooms ? String(p.maxRooms) : '',
          price: p.price ? String(p.price) : '',
          rentPrice: p.rentPrice ? String(p.rentPrice) : '',
          currency: p.currency||'NGN',
          rentFrequency: p.rentFrequency||'monthly',
          features: Array.isArray(p.features) ? p.features : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          media: mediaArr,
          compliance: p.compliance||{verified:false,score:0,documents:[]},
          escrow: p.escrow||{status:'none'},
          isDraft: !!p.isDraft,
          visibility: p.visibility||'public',
          premiere: !!p.premiere,
          paymentPlans: Array.isArray(p.paymentPlans) && p.paymentPlans.length ? p.paymentPlans : [{ id:'out',name:'Outright',installments:[{dueInDays:0,percent:100}] }],
          cautionFee: p.cautionFee ? { required: p.cautionFee.required || false, amount: p.cautionFee.amount ? String(p.cautionFee.amount) : '', description: p.cautionFee.description || '' } : { required: false, amount: '', description: '' },
          seoTitle: p.seoTitle||'',
          seoDescription: p.seoDescription||'',
          propertySpaceType: p.propertySpaceType || null,
          buildingCharacteristics: Array.isArray(p.buildingCharacteristics) ? p.buildingCharacteristics : [],
          amenitiesDetailed: p.amenitiesDetailed || {},
          languagesSpoken: Array.isArray(p.languagesSpoken) ? p.languagesSpoken : [],
          nearbyPlaces: Array.isArray(p.nearbyPlaces) ? p.nearbyPlaces : [],
          houseRules: p.houseRules || {
            checkIn: { from: '14:00', to: '22:00' },
            checkOut: { from: '08:00', to: '11:00' },
            smokingAllowed: false, petsAllowed: false, petCharge: '',
            childrenAllowed: true, childrenPolicy: '', ageRestriction: '',
            cribAvailable: false, extraBedAvailable: false,
            cancellationPolicy: '', paymentMethods: []
          }
        })
        if (Array.isArray(p.roomTypes)) {
          setRooms(p.roomTypes.map(rt => ({
            ...rt,
            pricePerNight: rt.pricePerNight ? String(rt.pricePerNight) : '',
            pricePerMonth: rt.pricePerMonth ? String(rt.pricePerMonth) : '',
            pricePerYear:  rt.pricePerYear  ? String(rt.pricePerYear)  : '',
            media: (rt.images||[]).map(u=>({url:u,type:'image'}))
          })))
        }
        if (Array.isArray(p.paymentPlans) && p.paymentPlans.length) setPayPlans(p.paymentPlans)
        setStep(1)
      } catch (err) {
        flash(err.message || 'Failed to load', 'error')
      } finally {
        setEditing(false)
      }
    }
    load()
  }, [editPropertyId])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const flash = useCallback((msg, type = 'success') => {
    setNotice({ msg, type })
    setTimeout(() => { if (mounted.current) setNotice(null) }, 3500)
  }, [])

  const set = useCallback((field, val) => {
    setForm(p => ({ ...p, [field]: val }))
    setErrors(p => { const n = {...p}; delete n[field]; return n })
  }, [])

  const toggleFeature = useCallback(f => {
    setForm(p => ({ ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f] }))
  }, [])

  const setHouseRule = useCallback((field, val) => {
    setForm(p => ({ ...p, houseRules: { ...p.houseRules, [field]: val } }))
  }, [])

  const setCheckInOut = useCallback((type, slot, val) => {
    setForm(p => ({ ...p, houseRules: { ...p.houseRules, [type]: { ...p.houseRules?.[type], [slot]: val } } }))
  }, [])

  const toggleAmenityDetailed = useCallback((cat, item) => {
    setForm(p => {
      const existing = p.amenitiesDetailed?.[cat] || []
      const next = existing.includes(item) ? existing.filter(x => x !== item) : [...existing, item]
      return { ...p, amenitiesDetailed: { ...p.amenitiesDetailed, [cat]: next } }
    })
  }, [])

  const toggleBuildingChar = useCallback(c => {
    setForm(p => ({ ...p, buildingCharacteristics: p.buildingCharacteristics?.includes(c) ? p.buildingCharacteristics.filter(x => x !== c) : [...(p.buildingCharacteristics||[]), c] }))
  }, [])

  const toggleLanguage = useCallback(lang => {
    setForm(p => ({ ...p, languagesSpoken: p.languagesSpoken?.includes(lang) ? p.languagesSpoken.filter(x => x !== lang) : [...(p.languagesSpoken||[]), lang] }))
  }, [])

  const togglePaymentMethod = useCallback(method => {
    setForm(p => {
      const existing = p.houseRules?.paymentMethods || []
      const next = existing.includes(method) ? existing.filter(x => x !== method) : [...existing, method]
      return { ...p, houseRules: { ...p.houseRules, paymentMethods: next } }
    })
  }, [])

  const addNearbyPlace = useCallback(() => {
    setForm(p => ({ ...p, nearbyPlaces: [...(p.nearbyPlaces||[]), { name: '', category: 'Restaurant', distance: '' }] }))
  }, [])

  const removeNearbyPlace = useCallback(idx => {
    setForm(p => ({ ...p, nearbyPlaces: (p.nearbyPlaces||[]).filter((_, i) => i !== idx) }))
  }, [])

  const setNearbyPlace = useCallback((idx, field, val) => {
    setForm(p => ({ ...p, nearbyPlaces: (p.nearbyPlaces||[]).map((np, i) => i === idx ? { ...np, [field]: val } : np) }))
  }, [])

  const isHotelOrShortlet = form.category === 'Hotel' || form.category === 'Shortlet'
  const isLandOrCommercial = form.category === 'Land' || form.category === 'Commercial'

  const availableFeatures = useMemo(() => {
    const extras = FEATURES_BY_TYPE[form.category] || []
    return Array.from(new Set([...ALL_FEATURES, ...extras]))
  }, [form.category])

  // ── Room type helpers ──────────────────────────────────────────────────────

  const addRoom = useCallback(() => setRooms(p => [...p, mkRoomType()]), [])

  const setRoom = useCallback((i, field, val) => {
    setRooms(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }, [])

  const removeRoom = useCallback(i => setRooms(p => p.filter((_, idx) => idx !== i)), [])

  const toggleAmenity = useCallback((i, a) => {
    setRooms(p => p.map((r, idx) => idx !== i ? r : {
      ...r,
      amenities: r.amenities.includes(a) ? r.amenities.filter(x => x !== a) : [...r.amenities, a]
    }))
  }, [])

  const addRoomImages = useCallback((roomIdx, files) => {
    const valid = Array.from(files).filter(f => f?.type?.startsWith('image'))
    if (!valid.length) return
    setRooms(p => p.map((r, i) => i !== roomIdx ? r : {
      ...r,
      media: [...(r.media||[]), ...valid.map(f => ({ file: f, url: URL.createObjectURL(f), type: 'image' }))]
    }))
  }, [])

  const removeRoomImage = useCallback((roomIdx, imgIdx) => {
    setRooms(p => p.map((r, i) => {
      if (i !== roomIdx) return r
      const next = [...(r.media||[])]
      const item = next.splice(imgIdx, 1)[0]
      try { if (item?.file) URL.revokeObjectURL(item.url) } catch {}
      return { ...r, media: next }
    }))
  }, [])

  // ── Media helpers ──────────────────────────────────────────────────────────

  const handleFiles = useCallback(files => {
    const valid = Array.from(files).filter(f => f?.type && (f.type.startsWith('image') || f.type.startsWith('video')))
    if (!valid.length) return
    setForm(p => ({ ...p, media: [...(p.media||[]), ...valid.map(f => ({ file:f, url:URL.createObjectURL(f), type:f.type.startsWith('video')?'video':'image' }))] }))
    setErrors(p => { const n={...p}; delete n.media; return n })
  }, [])

  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prev = e => { e.preventDefault(); e.stopPropagation() }
    const onEnter = e => { prev(e); setDragOver(true) }
    const onLeave = e => { prev(e); setDragOver(false) }
    const onDrop  = e => { prev(e); setDragOver(false); handleFiles(e.dataTransfer.files||[]) }
    el.addEventListener('dragenter', onEnter)
    el.addEventListener('dragover', prev)
    el.addEventListener('dragleave', onLeave)
    el.addEventListener('drop', onDrop)
    return () => { el.removeEventListener('dragenter',onEnter); el.removeEventListener('dragover',prev); el.removeEventListener('dragleave',onLeave); el.removeEventListener('drop',onDrop) }
  }, [handleFiles])

  const removeMedia = useCallback(idx => {
    setForm(p => {
      const next = [...(p.media||[])]
      const item = next.splice(idx, 1)[0]
      try { if (item?.file) URL.revokeObjectURL(item.url) } catch {}
      return { ...p, media: next }
    })
  }, [])

  // ── Compliance docs ────────────────────────────────────────────────────────

  const setComplianceDoc = useCallback((docKey, url) => {
    setForm(p => {
      const docs = [...(p.compliance?.documents||[])]
      const idx = docs.findIndex(d => d.type === docKey)
      if (url) {
        if (idx >= 0) docs[idx] = { ...docs[idx], url }
        else docs.push({ type: docKey, url, verified: false })
      } else {
        if (idx >= 0) docs.splice(idx, 1)
      }
      return { ...p, compliance: { ...p.compliance, documents: docs } }
    })
  }, [])

  const getDocUrl = docKey => form.compliance?.documents?.find(d => d.type === docKey)?.url

  // ── AI helpers ─────────────────────────────────────────────────────────────

  const aiTitle = async () => {
    if (!form.category || !form.address) return flash('Select type and location first', 'warning')
    setAiWorking(true)
    try {
      const r = await api.post('/api/ai/generate-title', { category: form.category, location: form.address, beds: form.beds, purpose: form.purpose })
      if (r.data?.success) { set('title', r.data.title); flash('AI title generated') }
    } catch { flash('AI unavailable', 'error') } finally { setAiWorking(false) }
  }

  const aiDesc = async () => {
    if (!form.title || !form.category) return flash('Add title first', 'warning')
    setAiWorking(true)
    try {
      const r = await api.post('/api/ai/generate-description', { title:form.title, category:form.category, location:form.address, beds:form.beds, baths:form.baths, area:form.area, features:form.features })
      if (r.data?.success) { set('description', r.data.description); flash('AI description generated') }
    } catch { flash('AI unavailable', 'error') } finally { setAiWorking(false) }
  }

  const aiPrice = async () => {
    if (!form.category || !form.address) return flash('Select type and location first', 'warning')
    try {
      const r = await api.post('/api/ai/suggest-price', { category:form.category, location:form.address, beds:form.beds, baths:form.baths, area:form.area, purpose:form.purpose })
      if (r.data?.success) {
        const key = form.purpose === 'For Sale' ? 'price' : 'rentPrice'
        set(key, String(r.data.suggestedPrice))
        flash(`AI suggested ₦${r.data.suggestedPrice.toLocaleString()}`)
      }
    } catch { flash('AI price unavailable', 'error') }
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = useCallback(s => {
    const e = {}
    if (s === 1) {
      if (!form.category) e.category = 'Select a property type'
    }
    if (s === 2) {
      if (!form.address?.trim()) e.address = 'Street address required'
      if (!form.city?.trim())    e.city    = 'City required'
    }
    if (s === 3) {
      if (!form.title?.trim())   e.title   = 'Title required'
      if (!form.description?.trim()) e.description = 'Description required'
      if (!isLandOrCommercial) {
        if (!form.beds)  e.beds  = 'Required'
        if (!form.baths) e.baths = 'Required'
      }
    }
    if (s === 4 && isHotelOrShortlet && rooms.length === 0) {
      e.rooms = `${form.category} listings require at least one room type`
    }
    if (s === 5) {
      if ((form.purpose === 'For Sale' || form.purpose === 'Both') && !form.price) e.price = 'Sale price required'
      if ((form.purpose === 'For Rent' || form.purpose === 'Both') && !form.rentPrice) e.rentPrice = 'Rent price required'
    }
    if (s === 6) {
      // Hotel/Shortlet: property-level media optional if room types have images
      const roomsHaveImages = isHotelOrShortlet && rooms.some(r => r.media?.length > 0)
      if (!form.media?.length && !roomsHaveImages) e.media = 'At least one photo required'
    }
    return e
  }, [form, rooms, isHotelOrShortlet, isLandOrCommercial])

  const next = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    // Skip rooms step if not hotel/shortlet
    const nextStep = (step === 3 && !isHotelOrShortlet) ? 5 : step + 1
    setStep(Math.min(nextStep, 8))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prev = () => {
    // Skip rooms step if not hotel/shortlet
    const prevStep = (step === 5 && !isHotelOrShortlet) ? 3 : step - 1
    setStep(Math.max(prevStep, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goTo = s => {
    if (s < step) setStep(s)
    else {
      const e = validate(step)
      if (Object.keys(e).length) { setErrors(e); return }
      setStep(s)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = async (isDraft = false) => {
    if (loading) return
    if (!isDraft) {
      let allErrors = {}
      for (let s = 1; s <= 8; s++) Object.assign(allErrors, validate(s))
      if (Object.keys(allErrors).length) {
        setErrors(allErrors)
        flash('Fix highlighted errors', 'error')
        return
      }
    }
    setLoading(true)
    try {
      // Upload property-level media
      const mediaOut = []
      for (const m of form.media || []) {
        if (m.file) {
          const url = await uploadToCloudinary(m.file).catch(() => null)
          if (url) mediaOut.push({ url, type: m.type || 'image' })
        } else if (m.url) {
          mediaOut.push({ url: m.url, type: m.type || 'image' })
        }
      }

      // Upload room type images
      const processedRooms = []
      for (const rt of rooms) {
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
        processedRooms.push({
          name: rt.name || 'Standard Room',
          description: rt.description || '',
          qty: Number(rt.qty || 1),
          pricePerNight: rt.pricePerNight ? Number(rt.pricePerNight) : undefined,
          pricePerMonth: rt.pricePerMonth ? Number(rt.pricePerMonth) : undefined,
          pricePerYear:  rt.pricePerYear  ? Number(rt.pricePerYear)  : undefined,
          occupancy: rt.occupancy || { adults: 2, children: 0 },
          amenities: rt.amenities || [],
          images: rtMedia.map(m => m.url),
          media: rtMedia,
          active: rt.active !== false
        })
      }

      const payload = {
        title: form.title,
        description: form.description,
        purpose: form.purpose,
        category: form.category,
        transactionType: form.transactionType || null,
        creationTier: creationTier,
        createdFrom: 'dashboard-wizard',
        price:        form.price        ? Number(form.price)        : undefined,
        rentPrice:    form.rentPrice    ? Number(form.rentPrice)    : undefined,
        rentFrequency: form.rentFrequency,
        currency:     form.currency || 'NGN',
        beds:         form.beds  ? Number(form.beds)  : undefined,
        baths:        form.baths ? Number(form.baths) : undefined,
        bedrooms:     form.beds  ? Number(form.beds)  : undefined,
        bathrooms:    form.baths ? Number(form.baths) : undefined,
        maxRooms:     form.maxRooms ? Number(form.maxRooms) : undefined,
        area:         form.area || undefined,
        location:     form.address,
        address:      form.address,
        city:         form.city    || undefined,
        state:        form.state   || undefined,
        country:      form.country || undefined,
        media:        mediaOut,
        features:     form.features,
        tags:         form.tags,
        roomTypes:    processedRooms,
        paymentPlans: payPlans,
        paymentPlanSnapshot: payPlans[0],
        premiere:     !!form.premiere,
        visibility:   form.visibility || 'public',
        isDraft,
        compliance:   form.compliance,
        escrow:       form.escrow,
        seoTitle:         form.seoTitle     || undefined,
        seoDescription:   form.seoDescription || undefined,
        propertySpaceType: form.propertySpaceType || undefined,
        buildingCharacteristics: form.buildingCharacteristics?.length ? form.buildingCharacteristics : undefined,
        amenitiesDetailed: Object.keys(form.amenitiesDetailed||{}).length ? form.amenitiesDetailed : undefined,
        languagesSpoken:  form.languagesSpoken?.length ? form.languagesSpoken : undefined,
        nearbyPlaces:     form.nearbyPlaces?.length ? form.nearbyPlaces : undefined,
        houseRules:       form.houseRules || undefined,
        cautionFee:       (form.cautionFee?.required && form.cautionFee?.amount)
          ? { required: true, amount: Number(form.cautionFee.amount), currency: form.currency || 'NGN', description: form.cautionFee.description || undefined }
          : undefined
      }

      const isEdit = !!form._id
      const url = isEdit ? `/api/properties/${form._id}` : `/api/properties`
      const res = isEdit ? await api.put(url, payload) : await api.post(url, payload)

      if (res.data?.success) {
        flash(isDraft ? 'Draft saved!' : `Property ${isEdit ? 'updated' : 'listed'} successfully!`)
        form.media?.forEach(m => { try { if (m?.file) URL.revokeObjectURL(m.url) } catch {} })
        setTimeout(() => onSaved?.(res.data.property), 400)
      } else {
        flash('Save failed: ' + (res.data?.msg || 'Unknown error'), 'error')
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Error saving property'
      // If account not set up, redirect to setup
      if (err.response?.data?.code === 'PENDING_KYC' || err.response?.data?.code === 'PENDING_PAYMENT_SETUP') {
        flash('Complete your account setup first', 'error')
      } else {
        flash(msg, 'error')
      }
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (editing) return (
    <div className='upload-wizard'>
      <div className='wz-loading'>
        <div className='wz-spinner' />
        <p>Loading property…</p>
      </div>
    </div>
  )

  // ── Plan banner content ────────────────────────────────────────────────────

  const pct = planInfo?.limit === -1 ? 0 : Math.round((listingCount / (planInfo?.limit || 1)) * 100)
  const isFull = planInfo?.limit !== -1 && listingCount >= (planInfo?.limit || 1)
  const isWarn = !isFull && pct >= 80

  const progressFill = `${Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%`

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='upload-wizard'>
      {notice && (
        <div className={`wz-toast ${notice.type}`}>
          {notice.type === 'success' ? <Check size={16} /> : notice.type === 'error' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
          {notice.msg}
        </div>
      )}

      <div className='wz-layout'>
        {/* Header */}
        <div className='wz-header'>
          <button className='wz-back' onClick={() => onBack?.()}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className='wz-title-block'>
            <h2>{editPropertyId ? 'Edit Property' : 'List a Property'}</h2>
            <p>Fill in the details below to publish your listing</p>
          </div>
        </div>

        {/* Plan banner */}
        {planInfo && (
          planInfo.trialActive ? (
            <div className='wz-plan-banner'>
              <span className='wz-trial-pill'>🎉 Trial Active</span>
              <span className='wz-plan-meta'>
                You have full premium access until{' '}
                <strong>{new Date(planInfo.trialEndsAt).toLocaleDateString()}</strong>. Enjoy!
              </span>
            </div>
          ) : (
            <div className='wz-plan-banner'>
              <span className='wz-plan-meta'>
                <strong>{listingCount}</strong> / <strong>{planInfo.limit === -1 ? '∞' : planInfo.limit}</strong> listings ·{' '}
                <span style={{ textTransform: 'capitalize' }}>{planInfo.tier}</span> plan
                {isFull && <span style={{ color: 'var(--wz-error)', marginLeft: 8 }}>— Limit reached</span>}
                {isWarn && !isFull && <span style={{ color: 'var(--wz-warning)', marginLeft: 8 }}>— Almost full</span>}
              </span>
              {planInfo.limit !== -1 && (
                <div className='wz-plan-track'>
                  <div className={`wz-plan-fill${isFull?' full':isWarn?' warn':''}`} style={{ width: `${Math.min(pct,100)}%` }} />
                </div>
              )}
              {(isFull || isWarn) && <button className='wz-upgrade-btn'>Upgrade</button>}
            </div>
          )
        )}

        {/* Progress */}
        <div className='wz-progress'>
          <div className='wz-progress-inner'>
            <div className='wz-progress-track'>
              <div className='wz-progress-fill' style={{ width: progressFill }} />
            </div>
            {STEPS.map(s => (
              <div key={s.id} className={`wz-step-node${step===s.id?' active':step>s.id?' done':''}`} onClick={() => goTo(s.id)}>
                <div className='wz-node-circle'>{step > s.id ? <Check size={16} /> : s.id}</div>
                <span className='wz-node-label'>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1: Type & Purpose ───────────────────────────────────── */}
        {step === 1 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>What type of property is this?</p>
            <p className='wz-card-sub'>Choose the category that best describes your listing.</p>

            <div className='wz-type-grid'>
              {PROPERTY_TYPES.map(({ value, label, Icon, desc }) => (
                <div key={value} className={`wz-type-card${form.category === value ? ' selected' : ''}`} onClick={() => { set('category', value); set('rentFrequency', FREQUENCIES[value] || 'monthly') }}>
                  <div className='wz-tc-icon'><Icon size={24} /></div>
                  <div className='wz-tc-name'>{label}</div>
                  <div className='wz-tc-desc'>{desc}</div>
                </div>
              ))}
            </div>

            <div className='wz-purpose-row'>
              <label>Listing purpose</label>
              <div className='wz-toggle-group'>
                {PURPOSES.map(p => (
                  <button key={p} className={form.purpose === p ? 'on' : ''} onClick={() => set('purpose', p)}>{p}</button>
                ))}
              </div>
            </div>

            {/* Transaction type */}
            <div className='wz-field' style={{ marginTop: 20 }}>
              <label>Transaction Type <span style={{ color: 'var(--wz-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <select value={form.transactionType || ''} onChange={e => set('transactionType', e.target.value || null)}>
                <option value=''>Standard</option>
                <option value='full_sale'>Full Sale</option>
                <option value='fractional'>Fractional Ownership</option>
                <option value='leaseback'>Leaseback</option>
                <option value='joint_venture'>Joint Venture</option>
              </select>
            </div>
          </div>
        )}

        {/* ── STEP 2: Location ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Where is the property located?</p>
            <p className='wz-card-sub'>Provide an accurate address to help potential buyers/tenants find you.</p>

            <div className={`wz-field${errors.address?' has-err':''}`}>
              <label><MapPin size={12} style={{ display:'inline',marginRight:4 }} />Street Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder='e.g. 12 Victoria Island Road' />
              {errors.address && <div className='err'>{errors.address}</div>}
            </div>

            <div className='wz-row c3'>
              <div className={`wz-field${errors.city?' has-err':''}`}>
                <label>City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder='Lagos' />
                {errors.city && <div className='err'>{errors.city}</div>}
              </div>
              <div className='wz-field'>
                <label>State</label>
                <input value={form.state} onChange={e => set('state', e.target.value)} placeholder='Lagos State' />
              </div>
              <div className='wz-field'>
                <label>Country</label>
                <input value={form.country} onChange={e => set('country', e.target.value)} placeholder='Nigeria' />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Details ──────────────────────────────────────────── */}
        {step === 3 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Property details</p>
            <p className='wz-card-sub'>Give buyers a clear picture of what to expect.</p>

            <div className={`wz-field${errors.title?' has-err':''}`}>
              <label>Listing Title</label>
              <div className='wz-with-btn'>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder='e.g. Luxury 3-Bedroom Flat in Lekki Phase 1' />
                <button className='wz-ai-btn' onClick={aiTitle} disabled={aiWorking}>
                  {aiWorking ? <Loader2 size={13} className='spin' /> : <Sparkles size={13} />} AI
                </button>
              </div>
              {errors.title && <div className='err'>{errors.title}</div>}
            </div>

            <div className={`wz-field${errors.description?' has-err':''}`}>
              <label>Description</label>
              <div className='wz-with-btn'>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder='Describe the property — highlight key features, nearby landmarks, and what makes it special…' style={{ minHeight: 110 }} />
                <button className='wz-ai-btn' onClick={aiDesc} disabled={aiWorking} style={{ alignSelf: 'flex-start' }}>
                  {aiWorking ? <Loader2 size={13} /> : <Sparkles size={13} />} AI
                </button>
              </div>
              {errors.description && <div className='err'>{errors.description}</div>}
            </div>

            {!isLandOrCommercial && (
              <div className='wz-row c4' style={{ marginBottom: 16 }}>
                <div className={`wz-field${errors.beds?' has-err':''}`}>
                  <label><Bed size={12} style={{ display:'inline',marginRight:4 }} />Beds</label>
                  <input type='number' min='0' value={form.beds} onChange={e => set('beds', e.target.value)} placeholder='3' />
                  {errors.beds && <div className='err'>{errors.beds}</div>}
                </div>
                <div className={`wz-field${errors.baths?' has-err':''}`}>
                  <label><Bath size={12} style={{ display:'inline',marginRight:4 }} />Baths</label>
                  <input type='number' min='0' value={form.baths} onChange={e => set('baths', e.target.value)} placeholder='2' />
                  {errors.baths && <div className='err'>{errors.baths}</div>}
                </div>
                <div className='wz-field'>
                  <label><Maximize2 size={12} style={{ display:'inline',marginRight:4 }} />Area (sqm)</label>
                  <input type='number' min='0' value={form.area} onChange={e => set('area', e.target.value)} placeholder='120' />
                </div>
                {isHotelOrShortlet && (
                  <div className='wz-field'>
                    <label>Total Rooms</label>
                    <input type='number' min='1' value={form.maxRooms} onChange={e => set('maxRooms', e.target.value)} placeholder='20' />
                  </div>
                )}
              </div>
            )}

            <div className='wz-field'>
              <label>Amenities & Features</label>
              <div className='wz-feat-grid'>
                {availableFeatures.map(f => (
                  <div key={f} className={`wz-feat${form.features.includes(f)?' on':''}`} onClick={() => toggleFeature(f)}>
                    {form.features.includes(f) ? <Check size={12} /> : <Plus size={12} />} {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Room Types ───────────────────────────────────────── */}
        {step === 4 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Room types</p>
            <p className='wz-card-sub'>Add each room category with its own photos, pricing and amenities.</p>

            {errors.rooms && <div style={{ color:'var(--wz-error)', fontSize:13, marginBottom:12, padding:'10px 14px', background:'#fef2f2', borderRadius:8 }}>{errors.rooms}</div>}

            <div className='wz-rooms'>
              {rooms.map((rt, i) => (
                <RoomTypeCard
                  key={i}
                  room={rt}
                  index={i}
                  onSet={(f, v) => setRoom(i, f, v)}
                  onRemove={() => removeRoom(i)}
                  onToggleAmenity={a => toggleAmenity(i, a)}
                  onAddImages={files => addRoomImages(i, files)}
                  onRemoveImage={idx => removeRoomImage(i, idx)}
                />
              ))}
            </div>

            <button className='wz-add-room' onClick={addRoom} style={{ marginTop: rooms.length ? 12 : 0 }}>
              <Plus size={18} /> Add Room Type
            </button>

            {!isHotelOrShortlet && (
              <p style={{ marginTop: 16, fontSize: 13, color: 'var(--wz-muted)', padding: '12px 16px', background: 'var(--wz-bg)', borderRadius: 8 }}>
                Room types are optional for {form.category} listings. You can skip this step.
              </p>
            )}
          </div>
        )}

        {/* ── STEP 5: Pricing ──────────────────────────────────────────── */}
        {step === 5 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Pricing</p>
            <p className='wz-card-sub'>Set your listing price and payment options.</p>

            <div className='wz-row c2' style={{ marginBottom: 0 }}>
              <div className='wz-field'>
                <label>Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className='wz-field'>
                <label>Rent Frequency</label>
                <select value={form.rentFrequency} onChange={e => set('rentFrequency', e.target.value)}>
                  {(FREQ_OPTIONS[form.category] || ['monthly','yearly']).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className='wz-row c2'>
              {(form.purpose === 'For Sale' || form.purpose === 'Both') && (
                <div className={`wz-field${errors.price?' has-err':''}`}>
                  <label><DollarSign size={12} style={{ display:'inline',marginRight:4 }} />Sale Price</label>
                  <div className='wz-with-btn'>
                    <input type='number' min='0' value={form.price} onChange={e => set('price', e.target.value)} placeholder='0' />
                    <button className='wz-ai-btn' onClick={aiPrice} title='AI price suggestion'><Sparkles size={13} /></button>
                  </div>
                  {errors.price && <div className='err'>{errors.price}</div>}
                </div>
              )}
              {(form.purpose === 'For Rent' || form.purpose === 'Both') && (
                <div className={`wz-field${errors.rentPrice?' has-err':''}`}>
                  <label><DollarSign size={12} style={{ display:'inline',marginRight:4 }} />Rent Price</label>
                  <div className='wz-with-btn'>
                    <input type='number' min='0' value={form.rentPrice} onChange={e => set('rentPrice', e.target.value)} placeholder='0' />
                    <button className='wz-ai-btn' onClick={aiPrice} title='AI price suggestion'><Sparkles size={13} /></button>
                  </div>
                  {errors.rentPrice && <div className='err'>{errors.rentPrice}</div>}
                </div>
              )}
            </div>

            {/* Caution / Security deposit — not for Land */}
            {form.category !== 'Land' && (
              <>
                <hr className='wz-divider' />
                <p style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Caution / Security Deposit</p>
                <p style={{ fontSize:12, color:'#666', marginBottom:12 }}>A refundable deposit held in escrow and returned to the tenant/guest after checkout if no damage is reported.</p>

                <div className='wz-row' style={{ alignItems:'center', gap:12, marginBottom:12 }}>
                  <label className='wz-toggle-label' style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14 }}>
                    <input
                      type='checkbox'
                      checked={!!form.cautionFee?.required}
                      onChange={e => set('cautionFee', { ...form.cautionFee, required: e.target.checked })}
                      style={{ width:16, height:16 }}
                    />
                    This property requires a caution fee
                  </label>
                </div>

                {form.cautionFee?.required && (
                  <div className='wz-row c2'>
                    <div className='wz-field'>
                      <label>Caution Fee Amount ({form.currency})</label>
                      <input
                        type='number'
                        min='0'
                        value={form.cautionFee?.amount || ''}
                        onChange={e => set('cautionFee', { ...form.cautionFee, amount: e.target.value })}
                        placeholder='e.g. 50000'
                      />
                    </div>
                    <div className='wz-field'>
                      <label>Terms / Description (optional)</label>
                      <input
                        type='text'
                        value={form.cautionFee?.description || ''}
                        onChange={e => set('cautionFee', { ...form.cautionFee, description: e.target.value })}
                        placeholder='e.g. Refunded within 7 days of checkout'
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <hr className='wz-divider' />

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <p style={{ fontSize:14, fontWeight:700, margin:0 }}>Payment Plans</p>
              <div style={{ display:'flex', gap:6 }}>
                <button className='wz-preset-btn' title='50% now, 50% on handover' onClick={() => setPayPlans(p => [...p, { id:`plan_${Date.now()}`, name:'50/50 Split', installments:[{dueInDays:0,percent:50},{dueInDays:30,percent:50}] }])}>+ 50/50</button>
                <button className='wz-preset-btn' title='30% now, 30% in 30 days, 40% on handover' onClick={() => setPayPlans(p => [...p, { id:`plan_${Date.now()}`, name:'3-Part Payment', installments:[{dueInDays:0,percent:30},{dueInDays:30,percent:30},{dueInDays:60,percent:40}] }])}>+ 30/30/40</button>
                <button className='wz-preset-btn' title='4 equal quarterly payments' onClick={() => setPayPlans(p => [...p, { id:`plan_${Date.now()}`, name:'Quarterly', installments:[{dueInDays:0,percent:25},{dueInDays:90,percent:25},{dueInDays:180,percent:25},{dueInDays:270,percent:25}] }])}>+ Quarterly</button>
              </div>
            </div>
            <div className='wz-plan-list'>
              {payPlans.map((plan, pi) => (
                <div key={pi} className='wz-plan-item'>
                  <div className='wz-pi-top'>
                    <input value={plan.name} onChange={e => setPayPlans(p => p.map((pl,i) => i===pi ? {...pl,name:e.target.value} : pl))} placeholder='Plan name' />
                    {payPlans.length > 1 && (
                      <button className='wz-pi-del' onClick={() => setPayPlans(p => p.filter((_,i)=>i!==pi))}><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className='wz-installments'>
                    {plan.installments?.map((inst, ii) => (
                      <div key={ii} className='wz-inst-row'>
                        <input type='number' min='0' value={inst.dueInDays} onChange={e => setPayPlans(p => p.map((pl,i) => i!==pi?pl:{...pl,installments:pl.installments.map((ins,j)=>j===ii?{...ins,dueInDays:Number(e.target.value)}:ins)}))} placeholder='0' />
                        <span>days, pay</span>
                        <input type='number' min='0' max='100' value={inst.percent} onChange={e => setPayPlans(p => p.map((pl,i) => i!==pi?pl:{...pl,installments:pl.installments.map((ins,j)=>j===ii?{...ins,percent:Number(e.target.value)}:ins)}))} placeholder='100' />
                        <span>%</span>
                        {plan.installments.length > 1 && (
                          <button onClick={() => setPayPlans(p => p.map((pl,i)=>i!==pi?pl:{...pl,installments:pl.installments.filter((_,j)=>j!==ii)}))} style={{ background:'none',border:'none',color:'var(--wz-error)',cursor:'pointer' }}><Trash2 size={12}/></button>
                        )}
                      </div>
                    ))}
                    <button className='wz-add-plan' onClick={() => setPayPlans(p => p.map((pl,i) => i!==pi?pl:{...pl,installments:[...pl.installments,{dueInDays:30,percent:0}]}))}>
                      <Plus size={12} /> Add installment
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className='wz-add-plan' style={{ marginTop: 10 }} onClick={() => setPayPlans(p => [...p, { id:`plan_${Date.now()}`, name:'New Plan', installments:[{dueInDays:0,percent:100}] }])}>
              <Plus size={14} /> Add payment plan
            </button>
          </div>
        )}

        {/* ── STEP 6: Media ────────────────────────────────────────────── */}
        {step === 6 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Photos & videos</p>
            <p className='wz-card-sub'>Upload high-quality images — listings with 8+ photos get 3× more enquiries.</p>

            <input ref={fileRef} type='file' multiple accept='image/*,video/*' style={{ display:'none' }} onChange={e => { handleFiles(e.target.files); e.target.value='' }} />

            <div ref={dropRef} className={`wz-drop${dragOver?' drag-over':''}`} onClick={() => fileRef.current?.click()}>
              <div className='wz-drop-icon'><ImageIcon size={28} /></div>
              <p>Click or drag photos here</p>
              <span>JPG, PNG, WebP, MP4 · Max 20 files</span>
            </div>

            {errors.media && <div style={{ color:'var(--wz-error)', fontSize:12, marginTop:8 }}>{errors.media}</div>}

            {form.media?.length > 0 && (
              <div className='wz-media-grid'>
                {form.media.map((m, i) => (
                  <div key={i} className='wz-media-thumb'>
                    {m.type === 'video' ? <video src={m.url} /> : <img src={m.url} alt='' />}
                    <button className='wz-mt-del' onClick={() => removeMedia(i)}><Trash2 size={11} /></button>
                    {i === 0 && <span className='wz-mt-badge'>Cover</span>}
                    {m.type === 'video' && <span className='wz-mt-badge' style={{ left:'auto',right:5 }}>Video</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 7: Policies ─────────────────────────────────────────── */}
        {step === 7 && (
          <div className='wz-card'>
            <p className='wz-card-hd'>Property details & rules</p>
            <p className='wz-card-sub'>All fields are optional — fill in what applies to your listing.</p>

            {/* Space type — only for Apartment / House / Shortlet */}
            {(form.category === 'Apartment' || form.category === 'House' || form.category === 'Shortlet') && (
              <div className='wz-field'>
                <label>Space type</label>
                <div className='wz-toggle-group'>
                  {[['entire_place','Entire Place'],['private_room','Private Room'],['shared_room','Shared Room']].map(([v,l]) => (
                    <button key={v} className={form.propertySpaceType === v ? 'on' : ''} onClick={() => set('propertySpaceType', form.propertySpaceType === v ? null : v)}>{l}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Building type — not for Land */}
            {form.category !== 'Land' && form.category !== 'Plot' && (
              <div className='wz-field'>
                <label>Building type</label>
                <div className='wz-feat-grid'>
                  {BUILDING_CHARACTERISTICS.map(c => (
                    <div key={c} className={`wz-feat${(form.buildingCharacteristics||[]).includes(c)?' on':''}`} onClick={() => toggleBuildingChar(c)}>
                      {(form.buildingCharacteristics||[]).includes(c) ? <Check size={12}/> : <Plus size={12}/>} {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check-in / Check-out — Hotel & Shortlet only */}
            {isHotelOrShortlet && (
              <>
                <hr className='wz-divider' />
                <p style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Check-in & Check-out</p>
                <div className='wz-row c4'>
                  <div className='wz-field'>
                    <label>Check-in from</label>
                    <input type='time' value={form.houseRules?.checkIn?.from || '14:00'} onChange={e => setCheckInOut('checkIn','from',e.target.value)} />
                  </div>
                  <div className='wz-field'>
                    <label>Check-in until</label>
                    <input type='time' value={form.houseRules?.checkIn?.to || '22:00'} onChange={e => setCheckInOut('checkIn','to',e.target.value)} />
                  </div>
                  <div className='wz-field'>
                    <label>Check-out from</label>
                    <input type='time' value={form.houseRules?.checkOut?.from || '08:00'} onChange={e => setCheckInOut('checkOut','from',e.target.value)} />
                  </div>
                  <div className='wz-field'>
                    <label>Check-out until</label>
                    <input type='time' value={form.houseRules?.checkOut?.to || '11:00'} onChange={e => setCheckInOut('checkOut','to',e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Policy toggles — not for Land or Commercial */}
            {!isLandOrCommercial && (
              <>
                <hr className='wz-divider' />
                <p style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>House rules</p>
                <div className='wz-rules-grid'>
                  {[
                    ['smokingAllowed', 'Smoking'],
                    ['petsAllowed', 'Pets allowed'],
                    ['childrenAllowed', 'Children welcome'],
                    ...(isHotelOrShortlet ? [['cribAvailable','Crib available'],['extraBedAvailable','Extra bed available']] : [])
                  ].map(([field, label]) => (
                    <div key={field} className='wz-rule-row'>
                      <span>{label}</span>
                      <div className='wz-toggle-group'>
                        <button className={form.houseRules?.[field] ? 'on' : ''} onClick={() => setHouseRule(field, true)}>Yes</button>
                        <button className={!form.houseRules?.[field] ? 'on' : ''} onClick={() => setHouseRule(field, false)}>No</button>
                      </div>
                    </div>
                  ))}
                </div>

                {form.houseRules?.petsAllowed && (
                  <div className='wz-field'>
                    <label>Pet charge <span style={{ fontWeight:400, color:'var(--wz-muted)' }}>(if any)</span></label>
                    <input value={form.houseRules?.petCharge||''} onChange={e => setHouseRule('petCharge', e.target.value)} placeholder='e.g. ₦5,000 per night' />
                  </div>
                )}

                {form.houseRules?.childrenAllowed && (
                  <div className='wz-field'>
                    <label>Children policy</label>
                    <input value={form.houseRules?.childrenPolicy||''} onChange={e => setHouseRule('childrenPolicy', e.target.value)} placeholder='e.g. Children of all ages welcome' />
                  </div>
                )}

                {isHotelOrShortlet && (
                  <div className='wz-field'>
                    <label>Age restriction</label>
                    <input value={form.houseRules?.ageRestriction||''} onChange={e => setHouseRule('ageRestriction', e.target.value)} placeholder='e.g. 18+' />
                  </div>
                )}
              </>
            )}

            {/* Cancellation policy — Hotel & Shortlet only */}
            {isHotelOrShortlet && (
              <div className='wz-field'>
                <label>Cancellation policy</label>
                <textarea value={form.houseRules?.cancellationPolicy||''} onChange={e => setHouseRule('cancellationPolicy', e.target.value)} placeholder='e.g. Free cancellation up to 48 hours before check-in…' style={{ minHeight:70 }} />
              </div>
            )}

            {/* Languages — Hotel & Shortlet only */}
            {isHotelOrShortlet && (
              <>
                <hr className='wz-divider' />
                <p style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Languages spoken by staff</p>
                <div className='wz-feat-grid'>
                  {LANGUAGES_LIST.map(l => (
                    <div key={l} className={`wz-feat${(form.languagesSpoken||[]).includes(l)?' on':''}`} onClick={() => toggleLanguage(l)}>
                      {(form.languagesSpoken||[]).includes(l) ? <Check size={12}/> : <Plus size={12}/>} {l}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Detailed amenities — not for Land */}
            {form.category !== 'Land' && form.category !== 'Plot' && (
              <>
                <hr className='wz-divider' />
                <p style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Detailed amenities</p>
                <p style={{ fontSize:12, color:'var(--wz-muted)', marginBottom:16 }}>Select everything available at this property.</p>
                {Object.entries(AMENITY_CATEGORIES).map(([cat, items]) => (
                  <div key={cat} className='wz-field' style={{ marginBottom:16 }}>
                    <label style={{ marginBottom:8 }}>{cat}</label>
                    <div className='wz-feat-grid'>
                      {items.map(item => {
                        const selected = (form.amenitiesDetailed?.[cat] || []).includes(item)
                        return (
                          <div key={item} className={`wz-feat${selected?' on':''}`} onClick={() => toggleAmenityDetailed(cat, item)}>
                            {selected ? <Check size={12}/> : <Plus size={12}/>} {item}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Nearby places — all types */}
            <hr className='wz-divider' />
            <p style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Nearby places <span style={{ fontWeight:400, color:'var(--wz-muted)' }}>(optional)</span></p>
            {(form.nearbyPlaces||[]).map((np, i) => (
              <div key={i} className='wz-row c3' style={{ marginBottom:8, alignItems:'center' }}>
                <div className='wz-field' style={{ marginBottom:0 }}>
                  <input value={np.name} onChange={e => setNearbyPlace(i,'name',e.target.value)} placeholder='Place name' />
                </div>
                <div className='wz-field' style={{ marginBottom:0 }}>
                  <select value={np.category} onChange={e => setNearbyPlace(i,'category',e.target.value)}>
                    {NEARBY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className='wz-field' style={{ marginBottom:0, display:'flex', gap:8 }}>
                  <input value={np.distance} onChange={e => setNearbyPlace(i,'distance',e.target.value)} placeholder='e.g. 0.5 km' style={{ flex:1 }} />
                  <button onClick={() => removeNearbyPlace(i)} style={{ background:'none', border:'1px solid var(--wz-border)', borderRadius:6, padding:'0 10px', cursor:'pointer', color:'var(--wz-error)' }}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
            <button className='wz-add-plan' style={{ marginTop:8 }} onClick={addNearbyPlace}>
              <Plus size={14}/> Add nearby place
            </button>
          </div>
        )}

        {/* ── STEP 8: Compliance & Publish ─────────────────────────────── */}
        {step === 8 && (
          <>
            {/* Compliance documents */}
            <div className='wz-card'>
              <p className='wz-card-hd'>Compliance documents</p>
              <p className='wz-card-sub'>Upload supporting documents to increase buyer trust and listing verification score.</p>

              <div className='wz-doc-list'>
                {COMPLIANCE_DOCS.map(({ key, label, desc }) => {
                  const docUrl = getDocUrl(key)
                  return (
                    <div key={key} className='wz-doc-row'>
                      <div className='wz-di'><FileText size={18} /></div>
                      <div className='wz-d-info'>
                        <div className='wz-d-name'>{label}</div>
                        <div className={`wz-d-status${docUrl?' done':''}`}>{docUrl ? '✓ Uploaded' : desc}</div>
                      </div>
                      <label className='wz-d-btn'>
                        {docUrl ? 'Replace' : 'Upload'}
                        <input type='file' accept='image/*,application/pdf' style={{ display:'none' }} onChange={async e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const url = await uploadToCloudinary(file)
                            if (url) setComplianceDoc(key, url)
                            flash(`${label} uploaded`)
                          } catch { flash('Upload failed', 'error') }
                          e.target.value = ''
                        }} />
                      </label>
                      {docUrl && <button className='wz-d-clr' onClick={() => setComplianceDoc(key, null)}><Trash2 size={14} /></button>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Escrow — mandatory, no toggle */}
            <div className='wz-card'>
              <p className='wz-card-hd'>Escrow protection</p>
              <p className='wz-card-sub'>All listings on PropNect use Paystack escrow — payments are held securely until both parties confirm.</p>

              <div className='wz-escrow-card on'>
                <div className='wz-esc-icon'><Shield size={20} /></div>
                <div className='wz-esc-body'>
                  <p className='wz-esc-title'>Escrow Enabled <Lock size={13} style={{ display:'inline', marginLeft:4, verticalAlign:'middle' }} /></p>
                  <p className='wz-esc-desc'>Funds are held by Paystack and released to you only after the buyer/tenant confirms satisfaction. This is mandatory to protect all parties.</p>
                </div>
              </div>
            </div>

            {/* Review */}
            <div className='wz-card'>
              <p className='wz-card-hd'>Review your listing</p>
              <p className='wz-card-sub'>Check everything looks correct before publishing.</p>

              <div className='wz-review-grid'>
                <div className='wz-rv-box'>
                  <h4>Property</h4>
                  <div className='wz-rvr'><span>Type</span><span>{form.category}</span></div>
                  <div className='wz-rvr'><span>Purpose</span><span>{form.purpose}</span></div>
                  <div className='wz-rvr'><span>Title</span><span>{form.title || '—'}</span></div>
                </div>
                <div className='wz-rv-box'>
                  <h4>Location</h4>
                  <div className='wz-rvr'><span>Address</span><span>{form.address || '—'}</span></div>
                  <div className='wz-rvr'><span>City</span><span>{form.city || '—'}</span></div>
                  <div className='wz-rvr'><span>State</span><span>{form.state || '—'}</span></div>
                </div>
                <div className='wz-rv-box'>
                  <h4>Details</h4>
                  {!isLandOrCommercial && <div className='wz-rvr'><span>Beds / Baths</span><span>{form.beds||'—'} / {form.baths||'—'}</span></div>}
                  <div className='wz-rvr'><span>Area</span><span>{form.area ? `${form.area} sqm` : '—'}</span></div>
                  <div className='wz-rvr'><span>Features</span><span>{form.features.length > 0 ? `${form.features.length} selected` : '—'}</span></div>
                </div>
                {!isLandOrCommercial && (
                  <div className='wz-rv-box'>
                    <h4>Rules</h4>
                    {isHotelOrShortlet && <div className='wz-rvr'><span>Check-in</span><span>{form.houseRules?.checkIn?.from||'14:00'} – {form.houseRules?.checkIn?.to||'22:00'}</span></div>}
                    {isHotelOrShortlet && <div className='wz-rvr'><span>Check-out</span><span>{form.houseRules?.checkOut?.from||'08:00'} – {form.houseRules?.checkOut?.to||'11:00'}</span></div>}
                    <div className='wz-rvr'><span>Pets</span><span>{form.houseRules?.petsAllowed ? '✓ Allowed' : '✗ Not allowed'}</span></div>
                    <div className='wz-rvr'><span>Smoking</span><span>{form.houseRules?.smokingAllowed ? '✓ Allowed' : '✗ Not allowed'}</span></div>
                    {form.languagesSpoken?.length > 0 && <div className='wz-rvr'><span>Languages</span><span>{form.languagesSpoken.slice(0,2).join(', ')}{form.languagesSpoken.length > 2 ? ` +${form.languagesSpoken.length-2}` : ''}</span></div>}
                  </div>
                )}
                <div className='wz-rv-box'>
                  <h4>Pricing</h4>
                  {form.price && <div className='wz-rvr'><span>Sale</span><span>{form.currency} {Number(form.price).toLocaleString()}</span></div>}
                  {form.rentPrice && <div className='wz-rvr'><span>Rent</span><span>{form.currency} {Number(form.rentPrice).toLocaleString()} / {form.rentFrequency}</span></div>}
                  <div className='wz-rvr'><span>Plans</span><span>{payPlans.length}</span></div>
                </div>
              </div>

              {form.media?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'var(--wz-muted)', marginBottom:8 }}>Photos ({form.media.length})</p>
                  <div className='wz-rv-imgs'>
                    {form.media.slice(0, 8).map((m, i) => m.type !== 'video' && <img key={i} src={m.url} alt='' />)}
                  </div>
                </div>
              )}
            </div>

            {/* Publish / Draft */}
            <div className='wz-card'>
              <p className='wz-card-hd'>Ready to publish?</p>
              <p className='wz-card-sub'>You can save as a draft and publish later, or go live immediately.</p>

              <div className='wz-pub-toggle'>
                <div className={`wz-pub-opt${!form.isDraft?' on':''}`} onClick={() => set('isDraft', false)}>
                  <div className='wz-pub-ico'>🚀</div>
                  <div className='wz-pub-nm'>Publish Now</div>
                  <div className='wz-pub-ds'>Go live immediately</div>
                </div>
                <div className={`wz-pub-opt${form.isDraft?' on':''}`} onClick={() => set('isDraft', true)}>
                  <div className='wz-pub-ico'>📝</div>
                  <div className='wz-pub-nm'>Save as Draft</div>
                  <div className='wz-pub-ds'>Review before going live</div>
                </div>
              </div>

              <div className='wz-field' style={{ marginTop: 18 }}>
                <label>Visibility</label>
                <select value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                  <option value='public'>Public — visible to everyone</option>
                  <option value='private'>Private — only visible to you</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className='wz-footer'>
          {step > 1 && (
            <button className='btn-ghost' onClick={prev}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <span className='wz-step-hint'>Step {step} of {STEPS.length}</span>
          {step < 8 && (
            <button className='btn-primary' onClick={next}>
              Continue <ArrowRight size={16} />
            </button>
          )}
          {step === 8 && (
            <>
              <button className='btn-draft' onClick={() => submit(true)} disabled={loading}>
                {loading ? <Loader2 size={14} className='spin' /> : null} Save Draft
              </button>
              <button className='btn-primary' onClick={() => submit(false)} disabled={loading}>
                {loading ? <Loader2 size={14} className='spin' /> : <Check size={16} />}
                {editPropertyId ? 'Save Changes' : 'Publish Listing'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Room Type Card (sub-component) ──────────────────────────────────────────

function RoomTypeCard ({ room, index, onSet, onRemove, onToggleAmenity, onAddImages, onRemoveImage }) {
  const imgRef = useRef(null)

  return (
    <div className='wz-room-card'>
      <div className='wz-room-hd'>
        <div className='wz-rn'>{index + 1}</div>
        <span className='wz-rt-name'>{room.name || `Room Type ${index + 1}`}</span>
        <button className='wz-rm-del' onClick={onRemove}><Trash2 size={14} /></button>
      </div>
      <div className='wz-room-body'>
        <div className='wz-row c2'>
          <div className='wz-field'>
            <label>Room Type Name</label>
            <input value={room.name} onChange={e => onSet('name', e.target.value)} placeholder='e.g. Deluxe Suite' />
          </div>
          <div className='wz-field'>
            <label>Quantity</label>
            <input type='number' min='1' value={room.qty} onChange={e => onSet('qty', Number(e.target.value))} placeholder='1' />
          </div>
        </div>

        <div className='wz-field'>
          <label>Description</label>
          <textarea value={room.description} onChange={e => onSet('description', e.target.value)} placeholder='Describe this room type…' style={{ minHeight: 70 }} />
        </div>

        <div className='wz-row c3'>
          <div className='wz-field'>
            <label>Price / Night</label>
            <input type='number' min='0' value={room.pricePerNight} onChange={e => onSet('pricePerNight', e.target.value)} placeholder='0' />
          </div>
          <div className='wz-field'>
            <label>Price / Month</label>
            <input type='number' min='0' value={room.pricePerMonth} onChange={e => onSet('pricePerMonth', e.target.value)} placeholder='0' />
          </div>
          <div className='wz-field'>
            <label>Max Adults</label>
            <input type='number' min='1' value={room.occupancy?.adults || 2} onChange={e => onSet('occupancy', { ...room.occupancy, adults: Number(e.target.value) })} placeholder='2' />
          </div>
        </div>

        {/* Room images — multiple allowed */}
        <div className='wz-room-img-section'>
          <label>Room Photos ({(room.media||[]).length} added)</label>
          <input ref={imgRef} type='file' accept='image/*' multiple style={{ display:'none' }} onChange={e => { onAddImages(e.target.files); e.target.value='' }} />
          <div className='wz-room-imgs'>
            {(room.media||[]).map((m, i) => (
              <div key={i} className='wz-rim-thumb'>
                <img src={m.url} alt='' />
                {i === 0 && <span className='wz-rt-cover'>Cover</span>}
                <button onClick={() => onRemoveImage(i)}><Trash2 size={10} /></button>
              </div>
            ))}
            <div className='wz-rim-add' onClick={() => imgRef.current?.click()}>
              <Plus size={16} />
              <span>Add Photos</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className='wz-field'>
          <label>Amenities</label>
          <div className='wz-amenity-row'>
            {AMENITY_OPTIONS.map(a => (
              <button key={a} className={`wz-amenity${(room.amenities||[]).includes(a)?' on':''}`} onClick={() => onToggleAmenity(a)}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Silence missing import
function AlertCircle({ size }) {
  return <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>
}
