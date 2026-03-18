'use client'

import React, { useState, useCallback } from 'react'
import { api } from '@/libs/api-client'
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Check, AlertCircle,
  Loader2, Building2, Home, Store, Landmark
} from 'lucide-react'
import './PortfolioUpload.scss'

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment', Icon: Building2 },
  { value: 'House', label: 'House', Icon: Home },
  { value: 'Commercial', label: 'Commercial', Icon: Store },
  { value: 'Land', label: 'Land / Plot', Icon: Landmark }
]

const PURPOSES = ['For Sale', 'For Rent', 'Both']
const FREQ_OPTIONS = ['monthly', 'yearly', 'per night', 'daily', 'weekly']
const FEATURES_LIST = [
  'Air Conditioning', 'Free Wi-Fi', 'Parking', 'Swimming Pool', 'Gym',
  'Security', 'CCTV', 'Balcony', 'Generator', 'Elevator', 'Furnished'
]

const STEPS = [
  { id: 1, label: 'Project' },
  { id: 2, label: 'Units' },
  { id: 3, label: 'Preview' }
]

function mkUnit () {
  return {
    _id: Date.now() + Math.random(),
    type: '',
    category: 'Apartment',
    purpose: 'For Sale',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    price: '',
    rentPrice: '',
    rentFrequency: 'monthly',
    description: '',
    features: [],
    count: 1
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioUpload ({ onBack, onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notice, setNotice] = useState(null)

  // Project details
  const [project, setProject] = useState({
    name: '',
    description: '',
    category: 'Apartment',
    purpose: 'For Sale',
    location: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    currency: 'NGN',
    developer: '',
    tags: ''
  })

  // Unit types
  const [units, setUnits] = useState([mkUnit()])
  const [errors, setErrors] = useState({})

  const flash = useCallback((msg, type = 'error') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 4000)
  }, [])

  const setProj = (k, v) => setProject(p => ({ ...p, [k]: v }))
  const setUnit = (id, k, v) => setUnits(us => us.map(u => u._id === id ? { ...u, [k]: v } : u))
  const addUnit = () => setUnits(us => [...us, mkUnit()])
  const removeUnit = id => setUnits(us => us.filter(u => u._id !== id))

  const toggleUnitFeature = (id, feat) => {
    setUnits(us => us.map(u => {
      if (u._id !== id) return u
      const has = u.features.includes(feat)
      return { ...u, features: has ? u.features.filter(f => f !== feat) : [...u.features, feat] }
    }))
  }

  const totalUnits = units.reduce((s, u) => s + (parseInt(u.count) || 1), 0)

  // ── Validation ────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const e = {}
    if (!project.name.trim()) e.name = 'Project name is required'
    if (!project.location.trim()) e.location = 'Location is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    units.forEach((u, i) => {
      if (!u.price && !u.rentPrice) e[`unit_${i}_price`] = 'Price or rent price required'
      if (u.count < 1 || u.count > 200) e[`unit_${i}_count`] = 'Count must be 1–200'
    })
    if (totalUnits > 500) e.total = 'Total units cannot exceed 500'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(s => Math.min(3, s + 1))
  }
  const prev = () => { setErrors({}); setStep(s => Math.max(1, s - 1)) }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        project: {
          ...project,
          tags: project.tags.split(',').map(t => t.trim()).filter(Boolean),
          features: []
        },
        units: units.map(u => ({
          type: u.type || u.category,
          category: u.category,
          purpose: u.purpose,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          sqft: u.sqft,
          price: u.price,
          rentPrice: u.rentPrice,
          rentFrequency: u.rentFrequency,
          description: u.description,
          features: u.features,
          count: parseInt(u.count) || 1
        }))
      }

      const res = await api.post('/api/properties/portfolio', payload)
      if (res.data?.success) {
        setResult(res.data)
        onComplete?.(res.data)
      } else {
        flash(res.data?.msg || 'Portfolio creation failed')
      }
    } catch (err) {
      flash(err.response?.data?.msg || err.message || 'Failed to create portfolio')
    } finally {
      setLoading(false)
    }
  }

  // ── Result screen ─────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className='pu-page'>
        <div className='pu-result'>
          <div className='pu-result__icon'><Check size={32} /></div>
          <h2>Portfolio Created!</h2>
          <p><strong>{result.created}</strong> units created for <strong>{result.projectName}</strong></p>
          <p className='pu-result__id'>Project ID: <code>{result.projectId}</code></p>
          {result.errors?.length > 0 && (
            <div className='pu-result__errs'>
              <AlertCircle size={13} /> {result.errors.length} unit(s) failed
            </div>
          )}
          <div className='pu-result__actions'>
            <button className='pu-btn pu-btn--primary' onClick={onBack}>Go to My Properties</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <div className='pu-page'>
      {notice && (
        <div className={`pu-toast pu-toast--${notice.type}`}>
          {notice.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {notice.msg}
        </div>
      )}

      {/* Header */}
      <div className='pu-header'>
        <button className='pu-back' onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div>
          <h2 className='pu-title'>Project Portfolio</h2>
          <p className='pu-sub'>Create a parent project and generate all units in bulk</p>
        </div>
      </div>

      {/* Progress */}
      <div className='pu-progress'>
        {STEPS.map(s => (
          <div key={s.id} className={`pu-step${step === s.id ? ' active' : step > s.id ? ' done' : ''}`}>
            <div className='pu-step__dot'>{step > s.id ? <Check size={12} /> : s.id}</div>
            <span>{s.label}</span>
          </div>
        ))}
        <div className='pu-progress__line' style={{ '--fill': `${((step - 1) / 2) * 100}%` }} />
      </div>

      {/* ── STEP 1: Project Details ─────────────────────────────────────── */}
      {step === 1 && (
        <div className='pu-card'>
          <h3 className='pu-card__title'>Project Details</h3>

          <div className='pu-field-row'>
            <div className='pu-field pu-field--grow'>
              <label>Project Name *</label>
              <input
                value={project.name}
                onChange={e => setProj('name', e.target.value)}
                placeholder='e.g. Ocean View Residences'
                className={errors.name ? 'err' : ''}
              />
              {errors.name && <span className='pu-err'>{errors.name}</span>}
            </div>
            <div className='pu-field'>
              <label>Developer / Company</label>
              <input
                value={project.developer}
                onChange={e => setProj('developer', e.target.value)}
                placeholder='Developer name'
              />
            </div>
          </div>

          <div className='pu-field'>
            <label>Description</label>
            <textarea
              value={project.description}
              onChange={e => setProj('description', e.target.value)}
              rows={3}
              placeholder='Describe the overall project...'
            />
          </div>

          <div className='pu-field-row'>
            <div className='pu-field pu-field--grow'>
              <label>Location / Area *</label>
              <input
                value={project.location}
                onChange={e => setProj('location', e.target.value)}
                placeholder='e.g. Lekki Phase 1, Lagos'
                className={errors.location ? 'err' : ''}
              />
              {errors.location && <span className='pu-err'>{errors.location}</span>}
            </div>
            <div className='pu-field'>
              <label>City</label>
              <input value={project.city} onChange={e => setProj('city', e.target.value)} placeholder='City' />
            </div>
            <div className='pu-field'>
              <label>State</label>
              <input value={project.state} onChange={e => setProj('state', e.target.value)} placeholder='State' />
            </div>
          </div>

          <div className='pu-field'>
            <label>Street Address</label>
            <input value={project.address} onChange={e => setProj('address', e.target.value)} placeholder='Full street address' />
          </div>

          <div className='pu-field-row'>
            <div className='pu-field'>
              <label>Default Category</label>
              <select value={project.category} onChange={e => setProj('category', e.target.value)}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className='pu-field'>
              <label>Default Purpose</label>
              <select value={project.purpose} onChange={e => setProj('purpose', e.target.value)}>
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className='pu-field'>
              <label>Currency</label>
              <select value={project.currency} onChange={e => setProj('currency', e.target.value)}>
                <option value='NGN'>NGN</option>
                <option value='USD'>USD</option>
                <option value='GBP'>GBP</option>
                <option value='EUR'>EUR</option>
              </select>
            </div>
          </div>

          <div className='pu-field'>
            <label>Tags (comma-separated)</label>
            <input value={project.tags} onChange={e => setProj('tags', e.target.value)} placeholder='luxury, waterfront, gated' />
          </div>
        </div>
      )}

      {/* ── STEP 2: Unit Types ──────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          {errors.total && (
            <div className='pu-alert pu-alert--err'><AlertCircle size={14} /> {errors.total}</div>
          )}

          {units.map((unit, idx) => (
            <div key={unit._id} className='pu-unit-card'>
              <div className='pu-unit-card__header'>
                <h4>Unit Type {idx + 1}</h4>
                {units.length > 1 && (
                  <button className='pu-remove-btn' onClick={() => removeUnit(unit._id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <div className='pu-field-row'>
                <div className='pu-field'>
                  <label>Type Label</label>
                  <input
                    value={unit.type}
                    onChange={e => setUnit(unit._id, 'type', e.target.value)}
                    placeholder='e.g. Studio, 2-Bed, Penthouse'
                  />
                </div>
                <div className='pu-field'>
                  <label>Category</label>
                  <select value={unit.category} onChange={e => setUnit(unit._id, 'category', e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className='pu-field'>
                  <label>Purpose</label>
                  <select value={unit.purpose} onChange={e => setUnit(unit._id, 'purpose', e.target.value)}>
                    {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className='pu-field-row'>
                <div className='pu-field'>
                  <label>Bedrooms</label>
                  <input type='number' min='0' value={unit.bedrooms} onChange={e => setUnit(unit._id, 'bedrooms', e.target.value)} placeholder='0' />
                </div>
                <div className='pu-field'>
                  <label>Bathrooms</label>
                  <input type='number' min='0' value={unit.bathrooms} onChange={e => setUnit(unit._id, 'bathrooms', e.target.value)} placeholder='0' />
                </div>
                <div className='pu-field'>
                  <label>Size (sqft)</label>
                  <input type='number' min='0' value={unit.sqft} onChange={e => setUnit(unit._id, 'sqft', e.target.value)} placeholder='0' />
                </div>
              </div>

              <div className='pu-field-row'>
                <div className='pu-field pu-field--grow'>
                  <label>Sale Price (₦)</label>
                  <input
                    type='number' min='0' value={unit.price}
                    onChange={e => setUnit(unit._id, 'price', e.target.value)}
                    placeholder='0'
                    className={errors[`unit_${idx}_price`] ? 'err' : ''}
                  />
                </div>
                <div className='pu-field pu-field--grow'>
                  <label>Rent Price (₦)</label>
                  <input type='number' min='0' value={unit.rentPrice} onChange={e => setUnit(unit._id, 'rentPrice', e.target.value)} placeholder='0' />
                </div>
                <div className='pu-field'>
                  <label>Rent Freq.</label>
                  <select value={unit.rentFrequency} onChange={e => setUnit(unit._id, 'rentFrequency', e.target.value)}>
                    {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              {errors[`unit_${idx}_price`] && (
                <span className='pu-err'>{errors[`unit_${idx}_price`]}</span>
              )}

              <div className='pu-field'>
                <label>Features</label>
                <div className='pu-features'>
                  {FEATURES_LIST.map(f => (
                    <button
                      key={f}
                      type='button'
                      className={`pu-feat-pill${unit.features.includes(f) ? ' on' : ''}`}
                      onClick={() => toggleUnitFeature(unit._id, f)}
                    >
                      {unit.features.includes(f) && <Check size={11} />} {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className='pu-field-row pu-unit-count-row'>
                <div className='pu-field'>
                  <label>Number of units of this type</label>
                  <div className='pu-count-input'>
                    <button type='button' onClick={() => setUnit(unit._id, 'count', Math.max(1, (parseInt(unit.count) || 1) - 1))}>−</button>
                    <input
                      type='number' min='1' max='200' value={unit.count}
                      onChange={e => setUnit(unit._id, 'count', parseInt(e.target.value) || 1)}
                    />
                    <button type='button' onClick={() => setUnit(unit._id, 'count', Math.min(200, (parseInt(unit.count) || 1) + 1))}>+</button>
                  </div>
                </div>
                <div className='pu-unit-subtotal'>
                  {parseInt(unit.count) || 1} unit{parseInt(unit.count) !== 1 ? 's' : ''} × {unit.price ? `₦${Number(unit.price).toLocaleString()}` : unit.rentPrice ? `₦${Number(unit.rentPrice).toLocaleString()}/mo` : '—'}
                </div>
              </div>
            </div>
          ))}

          <button className='pu-add-unit-btn' onClick={addUnit}>
            <Plus size={15} /> Add another unit type
          </button>

          <div className='pu-units-summary'>
            Total units to create: <strong>{totalUnits}</strong> / 500
          </div>
        </div>
      )}

      {/* ── STEP 3: Preview ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div className='pu-card'>
          <h3 className='pu-card__title'>Review Before Creating</h3>

          <div className='pu-preview-block'>
            <div className='pu-preview-project'>
              <div className='pu-preview-project__icon'>🏗️</div>
              <div>
                <h4>{project.name}</h4>
                <p>{project.location}{project.city ? `, ${project.city}` : ''}</p>
                {project.developer && <p>Developer: {project.developer}</p>}
              </div>
            </div>
          </div>

          <div className='pu-preview-units'>
            <h4>Unit Types ({units.length}) — {totalUnits} total units</h4>
            {units.map((unit, i) => (
              <div key={unit._id} className='pu-preview-unit'>
                <div className='pu-preview-unit__label'>
                  {unit.type || unit.category} × {parseInt(unit.count) || 1}
                </div>
                <div className='pu-preview-unit__meta'>
                  {unit.bedrooms ? `${unit.bedrooms}bed` : ''}{unit.bathrooms ? ` ${unit.bathrooms}bath` : ''}{unit.sqft ? ` ${unit.sqft}sqft` : ''}
                </div>
                <div className='pu-preview-unit__price'>
                  {unit.price ? `₦${Number(unit.price).toLocaleString()} sale` : ''}
                  {unit.rentPrice ? `${unit.price ? ' · ' : ''}₦${Number(unit.rentPrice).toLocaleString()}/${unit.rentFrequency}` : ''}
                </div>
              </div>
            ))}
          </div>

          <div className='pu-preview-note'>
            <AlertCircle size={13} />
            All units will be created as <strong>drafts</strong>. You can edit, add media, and publish each unit individually from My Properties.
          </div>
        </div>
      )}

      {/* Nav footer */}
      <div className='pu-nav'>
        {step > 1 && (
          <button className='pu-btn pu-btn--ghost' onClick={prev}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <span className='pu-step-hint'>Step {step} of {STEPS.length}</span>
        {step < 3 ? (
          <button className='pu-btn pu-btn--primary' onClick={next}>
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button className='pu-btn pu-btn--primary' onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={14} className='pu-spin' /> Creating…</> : <>
              <Check size={14} /> Create {totalUnits} Units
            </>}
          </button>
        )}
      </div>
    </div>
  )
}
