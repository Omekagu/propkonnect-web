'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, Home as HomeIcon, Building2, /* Wrench, PHASE 3+ — artisan registration */ CheckCircle2, Mail, Lock } from 'lucide-react'
import './register.scss'
import { auth as authApi } from '@/libs/api'
import { useRouter } from 'next/navigation'

const APP = process.env.NEXT_PUBLIC_APP_NAME

const BUILDINGS = [
  { cls: 'rp-building--1', wins: [1,0,1, 0,1,0, 1,1,0] },
  { cls: 'rp-building--2', wins: [0,1,1, 1,0,1, 0,1,0, 1,0,1, 1,1,0] },
  { cls: 'rp-building--3', wins: [1,0,1, 0,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,0, 0,1,1] },
  { cls: 'rp-building--4', wins: [0,1,0, 1,0,1, 0,1,1, 1,0,0, 0,1,0] },
  { cls: 'rp-building--5', wins: [1,1,0, 0,1,0, 1,0,1, 0,1,0] },
  { cls: 'rp-building--6', wins: [0,1,0, 1,1,0, 0,0,1] },
]

// PHASE 3+ — artisan specialization list. Restore when artisan marketplace launches.
// const ARTISAN_SPECS = ['Plumbing','Electrical','Carpentry','Painting','HVAC','Roofing','Masonry','Landscaping','Cleaning','General Maintenance']
const PROPERTY_INTERESTS = ['Apartment','House','Land','Commercial','Shortlet / Vacation','Hotel Room']
const NIGERIAN_CITIES = ['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City','Kaduna','Owerri','Uyo']

export default function Register () {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      window.location.href = '/admin/dashboard'
    }
  }, [])

  const [userType, setUserType] = useState(null)
  const [authMethod, setAuthMethod] = useState(null) // 'otp' | 'password'
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', phone: '', agreeToTerms: false
  })
  const [propertyOwnerData, setPropertyOwnerData] = useState({
    companyName: '', companyRegistration: '', yearsInBusiness: '', managementStyle: 'self-managed'
  })
  const [artisanData, setArtisanData] = useState({
    businessName: '', specialization: [], yearsOfExperience: '', serviceRadius: 50
  })
  const [userData, setUserData] = useState({
    lookingFor: 'rent', interests: [], preferredCity: '', maxBudget: ''
  })

  const handle       = e => { const { name, value, type, checked } = e.target; setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })) }
  const handleOwner  = e => { const { name, value } = e.target; setPropertyOwnerData(p => ({ ...p, [name]: value })) }
  const handleArtis  = e => { const { name, value } = e.target; setArtisanData(p => ({ ...p, [name]: value })) }
  const handleUser   = e => { const { name, value } = e.target; setUserData(p => ({ ...p, [name]: value })) }
  const toggleSpec   = s  => setArtisanData(p => ({ ...p, specialization: p.specialization.includes(s) ? p.specialization.filter(x => x !== s) : [...p.specialization, s] }))
  const toggleInterest = s => setUserData(p => ({ ...p, interests: p.interests.includes(s) ? p.interests.filter(x => x !== s) : [...p.interests, s] }))

  const validateBasic = () => {
    if (!formData.firstName.trim())                             { setError('First name is required'); return false }
    if (!formData.lastName.trim())                              { setError('Last name is required'); return false }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))   { setError('Invalid email address'); return false }
    if (authMethod === 'password') {
      if (formData.password.length < 8)                         { setError('Password must be at least 8 characters'); return false }
      if (formData.password !== formData.confirmPassword)       { setError('Passwords do not match'); return false }
    }
    if (!formData.phone.trim())                                 { setError('Phone number is required'); return false }
    if (!formData.agreeToTerms)                                 { setError('You must agree to the terms and conditions'); return false }
    return true
  }
  const validateOwner = () => {
    if (!propertyOwnerData.companyName.trim())  { setError('Company name is required'); return false }
    if (!propertyOwnerData.yearsInBusiness)     { setError('Years in business is required'); return false }
    return true
  }
  const validateArtisan = () => {
    if (!artisanData.businessName.trim())        { setError('Business name is required'); return false }
    if (artisanData.specialization.length === 0) { setError('Select at least one specialization'); return false }
    if (!artisanData.yearsOfExperience)          { setError('Years of experience is required'); return false }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateBasic()) setStep(2)
    else if (step === 2) {
      if (userType === 'PROPERTY_OWNER' && validateOwner()) setStep(3)
      else if (userType === 'artisan' && validateArtisan()) setStep(3)
      else if (userType === 'user') setStep(3) // preferences are optional
    }
  }

  const handleBack = () => { setStep(s => s - 1); setError('') }

  const handleSubmit = async e => {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      let res
      // Strip password fields for OTP-only accounts
      const { password: _pw, confirmPassword: _cpw, ...formWithoutPassword } = formData
      const baseData = authMethod === 'otp' ? { ...formWithoutPassword, authMethod: 'otp' } : { ...formData, authMethod: 'password' }
      if (userType === 'PROPERTY_OWNER') {
        res = await authApi.registerPropertyOwner({ ...baseData, ...propertyOwnerData })
      } else if (userType === 'artisan') {
        res = await authApi.registerArtisan({ ...baseData, businessName: artisanData.businessName, specialization: artisanData.specialization, yearsOfExperience: artisanData.yearsOfExperience })
      } else {
        res = await authApi.register({ ...baseData, userType: 'user' })
      }
      const userId = res.data?.userId || res.data?.data?.userId || res.data?._id
      setSuccess(true)
      setTimeout(() => { window.location.href = `/auth/verify-otp?email=${encodeURIComponent(formData.email)}${userId ? `&userId=${userId}` : ''}` }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || err.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const leftFeatures = userType === 'PROPERTY_OWNER'
    ? ['List and manage properties', 'Collect rent with escrow protection', 'Manage tenants with ease']
    // PHASE 3+ — artisan features: ['Browse and bid on available jobs', 'Manage your schedule & earnings', 'Build your verified portfolio']
    : userType === 'user'
    ? ['Find your perfect home to rent or buy', 'Book inspections instantly', 'Secure payments & lease contracts']
    : ['Find properties to rent or buy', 'Book inspections instantly', 'Secure payments & contracts']

  return (
    <div className='rp'>
      {/* BG */}
      <div className='rp-bg'>
        <div className='rp-bg__grid' />
        <div className='rp-bg__glow rp-bg__glow--a' />
        <div className='rp-bg__glow rp-bg__glow--b' />
      </div>

      <div className='rp-split'>
        {/* ── LEFT panel ──────────────────────────────────── */}
        <div className='rp-visual'>
          <div className='rp-logo'>
            <img
              src='https://i.postimg.cc/Z5KDSpvb/propnekt-mark.png'
              alt='Propnekt'
              className='rp-logo__img'
            />
          </div>

          <div className='rp-city'>
            <div className='rp-city__scan' />
            {BUILDINGS.map((b, i) => (
              <div key={i} className={`rp-building ${b.cls}`}>
                <div className='rp-bwin'>
                  {b.wins.map((w, j) => <div key={j} className={`rp-bwin__w${w ? ' on' : ''}`} />)}
                </div>
              </div>
            ))}
            <div className='rp-city__base' />
            <div className='rp-datacard rp-datacard--1'><strong>2,847</strong>Active Listings</div>
            <div className='rp-datacard rp-datacard--2'><strong>98.2%</strong>Match Rate</div>
          </div>

          <div className='rp-tagline'>
            <h2>
              {userType === 'PROPERTY_OWNER'
                ? 'Your Property Empire Starts Here'
                // PHASE 3+ — artisan: userType === 'artisan' ? 'Build Your Professional Legacy' :
                : userType === 'user'
                ? 'Find Your Perfect Home'
                : 'Join Nigeria\'s Smartest Property Platform'}
            </h2>
            <p>
              {userType === 'PROPERTY_OWNER'
                ? 'AI-powered tools that help you manage, grow, and monetise your property portfolio.'
                // PHASE 3+ — artisan: userType === 'artisan' ? 'Connect with property owners, earn consistently, and build a verified track record.' :
                : userType === 'user'
                ? 'Search thousands of verified properties, book inspections, and move in with confidence.'
                : 'Buy, rent, and discover properties powered by AI, escrow, and real-time data.'}
            </p>
          </div>

          <div className='rp-features'>
            {leftFeatures.map((f, i) => (
              <div key={i} className='rp-feature'>
                <div className='rp-feature__check'>
                  <svg width='10' height='10' viewBox='0 0 12 10' fill='none'>
                    <path d='M1 5l3.5 3.5L11 1' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT panel ─────────────────────────────────── */}
        <div className='rp-panel'>
          <div className='rp-card'>

            <div className='rp-header'>
              <h1 className='rp-h1'>
                {!userType ? 'Create your account' : userType === 'PROPERTY_OWNER' ? 'Property Owner Registration' : 'Create Your Account'}
              </h1>
              <p className='rp-sub'>
                {!userType ? 'Choose your account type to get started' : userType === 'PROPERTY_OWNER' ? 'Register as a Property Owner' : 'Start your property search journey'}
              </p>
            </div>

            {/* ── Account type selection ─────────────────── */}
            {!userType && (
              <>
                <div className='rp-types'>
                  <button className='rp-type' onClick={() => { setUserType('user'); setStep(1) }}>
                    <div className='rp-type__icon'><HomeIcon size={26} /></div>
                    <div className='rp-type__text'>
                      <h3>Tenant / Buyer</h3>
                      <p>Find your perfect property to rent or buy</p>
                    </div>
                    <svg className='rp-type__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
                  </button>

                  <button className='rp-type' onClick={() => { setUserType('PROPERTY_OWNER'); setStep(1) }}>
                    <div className='rp-type__icon'><Building2 size={26} /></div>
                    <div className='rp-type__text'>
                      <h3>Property Owner</h3>
                      <p>Manage properties, tenants and collect rent</p>
                    </div>
                    <svg className='rp-type__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
                  </button>

                  {/* PHASE 3+ — artisan registration type. Restore when artisan marketplace launches.
                  <button className='rp-type' onClick={() => { setUserType('artisan'); setStep(1) }}>
                    <div className='rp-type__icon'><Wrench size={26} /></div>
                    <div className='rp-type__text'>
                      <h3>Professional / Artisan</h3>
                      <p>Find jobs and build your professional profile</p>
                    </div>
                    <svg className='rp-type__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
                  </button>
                  */}
                </div>

                <div className='rp-footer'>
                  <p>Already have an account? <a href='/auth/login'>Sign in here</a></p>
                </div>
              </>
            )}

            {/* ── Auth method selection ──────────────────── */}
            {userType && !authMethod && (
              <>
                <div className='rp-badge'>
                  <span className='rp-badge__icon'>{userType === 'PROPERTY_OWNER' ? <Building2 size={15} /> : <HomeIcon size={15} />}</span>
                  <span className='rp-badge__label'>{userType === 'PROPERTY_OWNER' ? 'Property Owner' : 'Tenant / Buyer'}</span>
                  <button className='rp-badge__change' onClick={() => { setUserType(null); setAuthMethod(null); setStep(1); setError('') }}>Change</button>
                </div>

                <p className='rp-step-title' style={{ marginBottom: 6, marginTop: 8 }}>How would you like to sign in?</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, marginTop: 0 }}>You can always switch methods later in settings.</p>

                <div className='rp-types'>
                  <button className='rp-type' onClick={() => setAuthMethod('otp')}>
                    <div className='rp-type__icon'><Mail size={22} /></div>
                    <div className='rp-type__text'>
                      <h3>Email Code (OTP)</h3>
                      <p>Receive a one-time code each time you sign in — no password needed</p>
                    </div>
                    <svg className='rp-type__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
                  </button>

                  <button className='rp-type' onClick={() => setAuthMethod('password')}>
                    <div className='rp-type__icon'><Lock size={22} /></div>
                    <div className='rp-type__text'>
                      <h3>Set a Password</h3>
                      <p>Create a password to sign in directly without waiting for codes</p>
                    </div>
                    <svg className='rp-type__arrow' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
                  </button>
                </div>

                <div className='rp-footer'>
                  <p>Already have an account? <a href='/auth/login'>Sign in here</a></p>
                </div>
              </>
            )}

            {/* ── Multi-step form ────────────────────────── */}
            {userType && authMethod && (
              <>
                <div className='rp-badge'>
                  <span className='rp-badge__icon'>{userType === 'PROPERTY_OWNER' ? <Building2 size={15} /> : <HomeIcon size={15} />}</span>
                  <span className='rp-badge__label'>{userType === 'PROPERTY_OWNER' ? 'Property Owner' : 'Tenant / Buyer'}</span>
                  <button className='rp-badge__change' onClick={() => { setUserType(null); setAuthMethod(null); setStep(1); setError('') }}>Change</button>
                </div>

                <div className='rp-progress'>
                  <div className='rp-progress__bar'>
                    <div className='rp-progress__fill' style={{ width: `${(step / 3) * 100}%` }} />
                  </div>
                  <div className='rp-steps'>
                    {[1,2,3].map(n => (
                      <div key={n} className={`rp-step-num${step === n ? ' active' : step > n ? ' done' : ''}`}>{n}</div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>

                  {/* Step 1 — Basic info */}
                  {step === 1 && (
                    <div className='rp-form-step'>
                      <p className='rp-step-title'>Basic Information</p>

                      <div className='rp-field-row'>
                        <div className='rp-field'>
                          <label className='rp-label'>First Name *</label>
                          <input className='rp-input' type='text' name='firstName' value={formData.firstName} onChange={handle} placeholder='John' />
                        </div>
                        <div className='rp-field'>
                          <label className='rp-label'>Last Name *</label>
                          <input className='rp-input' type='text' name='lastName' value={formData.lastName} onChange={handle} placeholder='Doe' />
                        </div>
                      </div>

                      <div className='rp-field'>
                        <label className='rp-label'>Email Address *</label>
                        <input className='rp-input' type='email' name='email' value={formData.email} onChange={handle} placeholder='john@example.com' />
                      </div>

                      <div className='rp-field'>
                        <label className='rp-label'>Phone Number *</label>
                        <input className='rp-input' type='tel' name='phone' value={formData.phone} onChange={handle} placeholder='+234 800 000 0000' />
                      </div>

                      {authMethod === 'password' && (
                        <>
                          <div className='rp-field'>
                            <label className='rp-label'>Password *</label>
                            <div className='rp-input-wrap'>
                              <input className='rp-input rp-input--pw' type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={handle} placeholder='At least 8 characters' />
                              <button type='button' className='rp-pw-toggle' onClick={() => setShowPassword(p => !p)}>
                                {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                              </button>
                            </div>
                          </div>

                          <div className='rp-field'>
                            <label className='rp-label'>Confirm Password *</label>
                            <div className='rp-input-wrap'>
                              <input className='rp-input rp-input--pw' type={showConfirmPassword ? 'text' : 'password'} name='confirmPassword' value={formData.confirmPassword} onChange={handle} placeholder='Confirm your password' />
                              <button type='button' className='rp-pw-toggle' onClick={() => setShowConfirmPassword(p => !p)}>
                                {showConfirmPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div className='rp-check'>
                        <input type='checkbox' id='agreeToTerms' name='agreeToTerms' checked={formData.agreeToTerms} onChange={handle} />
                        <label htmlFor='agreeToTerms'>
                          I agree to the <a href='/terms'>Terms and Conditions</a> and <a href='/privacy'>Privacy Policy</a>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2 — Type-specific */}
                  {step === 2 && (
                    <div className='rp-form-step'>
                      <p className='rp-step-title'>
                        {userType === 'PROPERTY_OWNER' ? 'Business Information' : 'Housing Preferences'}
                      </p>

                      {userType === 'user' && (
                        <>
                          <div className='rp-field'>
                            <label className='rp-label'>What are you looking for?</label>
                            <div className='rp-radio-group'>
                              {[['rent','Looking to Rent'],['buy','Looking to Buy'],['both','Both']].map(([val, label]) => (
                                <label key={val} className={`rp-radio${userData.lookingFor === val ? ' active' : ''}`}>
                                  <input type='radio' name='lookingFor' value={val} checked={userData.lookingFor === val} onChange={handleUser} />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className='rp-field'>
                            <label className='rp-label'>Property interests <span className='rp-optional'>(optional)</span></label>
                            <div className='rp-chips'>
                              {PROPERTY_INTERESTS.map(s => (
                                <button key={s} type='button' className={`rp-chip${userData.interests.includes(s) ? ' active' : ''}`} onClick={() => toggleInterest(s)}>{s}</button>
                              ))}
                            </div>
                          </div>

                          <div className='rp-field-row'>
                            <div className='rp-field'>
                              <label className='rp-label'>Preferred city <span className='rp-optional'>(optional)</span></label>
                              <select className='rp-input' name='preferredCity' value={userData.preferredCity} onChange={handleUser}>
                                <option value=''>Any city</option>
                                {NIGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className='rp-field'>
                              <label className='rp-label'>Max budget (₦) <span className='rp-optional'>(optional)</span></label>
                              <input className='rp-input' type='number' name='maxBudget' value={userData.maxBudget} onChange={handleUser} placeholder='e.g. 500000' min='0' />
                            </div>
                          </div>
                          <p className='rp-hint-text'>These preferences help us personalise your property search. You can update them later.</p>
                        </>
                      )}

                      {userType === 'PROPERTY_OWNER' ? (
                        <>
                          <div className='rp-field'>
                            <label className='rp-label'>Company Name *</label>
                            <input className='rp-input' type='text' name='companyName' value={propertyOwnerData.companyName} onChange={handleOwner} placeholder='Your Company Name' />
                          </div>
                          <div className='rp-field'>
                            <label className='rp-label'>Registration Number</label>
                            <input className='rp-input' type='text' name='companyRegistration' value={propertyOwnerData.companyRegistration} onChange={handleOwner} placeholder='Optional' />
                          </div>
                          <div className='rp-field-row'>
                            <div className='rp-field'>
                              <label className='rp-label'>Years in Business *</label>
                              <input className='rp-input' type='number' name='yearsInBusiness' value={propertyOwnerData.yearsInBusiness} onChange={handleOwner} placeholder='e.g. 5' min='0' />
                            </div>
                            <div className='rp-field'>
                              <label className='rp-label'>Management Style *</label>
                              <select className='rp-input' name='managementStyle' value={propertyOwnerData.managementStyle} onChange={handleOwner}>
                                <option value='self-managed'>Self-Managed</option>
                                <option value='professionally-managed'>Professionally Managed</option>
                              </select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='rp-field'>
                            <label className='rp-label'>Business Name *</label>
                            <input className='rp-input' type='text' name='businessName' value={artisanData.businessName} onChange={handleArtis} placeholder='Your Business Name' />
                          </div>
                          <div className='rp-field-row'>
                            <div className='rp-field'>
                              <label className='rp-label'>Years Experience *</label>
                              <input className='rp-input' type='number' name='yearsOfExperience' value={artisanData.yearsOfExperience} onChange={handleArtis} placeholder='e.g. 5' min='0' />
                            </div>
                            <div className='rp-field'>
                              <label className='rp-label'>Service Radius (km)</label>
                              <input className='rp-input' type='number' name='serviceRadius' value={artisanData.serviceRadius} onChange={handleArtis} min='0' />
                            </div>
                          </div>
                          <div className='rp-field'>
                            <label className='rp-label'>Specializations *</label>
                            <div className='rp-chips'>
                              {ARTISAN_SPECS.map(s => (
                                <button key={s} type='button' className={`rp-chip${artisanData.specialization.includes(s) ? ' active' : ''}`} onClick={() => toggleSpec(s)}>{s}</button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3 — Review */}
                  {step === 3 && !success && (
                    <div className='rp-form-step'>
                      <p className='rp-step-title'>Review & Confirm</p>

                      <div className='rp-review-section'>
                        <h3>Personal Information</h3>
                        <div className='rp-review-grid'>
                          <div className='rp-review-item'><span className='rp-review-label'>First Name</span><span className='rp-review-value'>{formData.firstName}</span></div>
                          <div className='rp-review-item'><span className='rp-review-label'>Last Name</span><span className='rp-review-value'>{formData.lastName}</span></div>
                          <div className='rp-review-item'><span className='rp-review-label'>Email</span><span className='rp-review-value'>{formData.email}</span></div>
                          <div className='rp-review-item'><span className='rp-review-label'>Phone</span><span className='rp-review-value'>{formData.phone}</span></div>
                        </div>
                      </div>

                      {userType !== 'user' && (
                        <div className='rp-review-section'>
                          <h3>{userType === 'PROPERTY_OWNER' ? 'Business Details' : 'Professional Details'}</h3>
                          <div className='rp-review-grid'>
                            {userType === 'PROPERTY_OWNER' ? (
                              <>
                                <div className='rp-review-item'><span className='rp-review-label'>Company</span><span className='rp-review-value'>{propertyOwnerData.companyName}</span></div>
                                <div className='rp-review-item'><span className='rp-review-label'>Years</span><span className='rp-review-value'>{propertyOwnerData.yearsInBusiness}</span></div>
                                <div className='rp-review-item'><span className='rp-review-label'>Style</span><span className='rp-review-value'>{propertyOwnerData.managementStyle}</span></div>
                              </>
                            ) : (
                              <>
                                <div className='rp-review-item'><span className='rp-review-label'>Business</span><span className='rp-review-value'>{artisanData.businessName}</span></div>
                                <div className='rp-review-item'><span className='rp-review-label'>Experience</span><span className='rp-review-value'>{artisanData.yearsOfExperience} yrs</span></div>
                                <div className='rp-review-item span-full'>
                                  <span className='rp-review-label'>Specializations</span>
                                  <div className='rp-spec-tags'>
                                    {artisanData.specialization.map(s => <span key={s} className='rp-spec-tag'>{s}</span>)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {userType === 'user' && (userData.lookingFor || userData.interests.length > 0 || userData.preferredCity) && (
                        <div className='rp-review-section'>
                          <h3>Housing Preferences</h3>
                          <div className='rp-review-grid'>
                            <div className='rp-review-item'><span className='rp-review-label'>Looking to</span><span className='rp-review-value'>{userData.lookingFor === 'both' ? 'Rent & Buy' : userData.lookingFor === 'buy' ? 'Buy' : 'Rent'}</span></div>
                            {userData.preferredCity && <div className='rp-review-item'><span className='rp-review-label'>City</span><span className='rp-review-value'>{userData.preferredCity}</span></div>}
                            {userData.maxBudget && <div className='rp-review-item'><span className='rp-review-label'>Max Budget</span><span className='rp-review-value'>₦{Number(userData.maxBudget).toLocaleString()}</span></div>}
                            {userData.interests.length > 0 && (
                              <div className='rp-review-item span-full'>
                                <span className='rp-review-label'>Interests</span>
                                <div className='rp-spec-tags'>{userData.interests.map(s => <span key={s} className='rp-spec-tag'>{s}</span>)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success */}
                  {success && (
                    <div className='rp-success'>
                      <span className='rp-success__icon'><CheckCircle2 size={40} /></span>
                      <h2 className='rp-success__title'>Account created!</h2>
                      <p className='rp-success__msg'>Redirecting you to email verification...</p>
                    </div>
                  )}

                  {/* Error / success alerts */}
                  {error && (
                    <div className='rp-alert rp-alert--err'>
                      <AlertCircle size={16}/>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  {!success && (
                    <div className='rp-actions'>
                      {step > 1 && (
                        <button type='button' className='rp-btn rp-btn--ghost' onClick={handleBack}>← Back</button>
                      )}
                      {step < 3 ? (
                        <button type='button' className='rp-btn rp-btn--primary' onClick={handleNext}>Continue →</button>
                      ) : (
                        <button type='submit' className='rp-btn rp-btn--primary' disabled={loading} onClick={handleSubmit}>
                          {loading ? <><span className='rp-spinner'/> Creating account...</> : 'Create Account →'}
                        </button>
                      )}
                    </div>
                  )}
                </form>

                <button className='rp-back-link' onClick={() => { setUserType(null); setAuthMethod(null); setStep(1); setError('') }}>
                  ← Choose a different account type
                </button>
              </>
            )}

            <div className='rp-footer' style={{ flexDirection: 'column', gap: '10px' }}>
              {userType && <p>Already have an account? <a href='/auth/login'>Sign in here</a></p>}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '18px' }}>
                <a href='/auth/privacy'>Privacy</a>
                <span className='rp-footer-sep'>·</span>
                <a href='/auth/terms'>Terms</a>
                <span className='rp-footer-sep'>·</span>
                <a href='/auth/contact'>Support</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
