'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import './register.scss'
import axios from 'axios'

export default function Register () {
  const [userType, setUserType] = useState(null) // 'property-owner' or 'artisan'
  const [step, setStep] = useState(1) // Multi-step form
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Basic Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  })

  // Property Owner Specific
  const [propertyOwnerData, setPropertyOwnerData] = useState({
    companyName: '',
    companyRegistration: '',
    yearsInBusiness: '',
    managementStyle: 'self-managed'
  })

  // Artisan Specific
  const [artisanData, setArtisanData] = useState({
    businessName: '',
    specialization: [],
    yearsOfExperience: '',
    serviceRadius: 50
  })

  const artisanSpecializations = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'HVAC',
    'Roofing',
    'Masonry',
    'Landscaping',
    'Cleaning',
    'General Maintenance'
  ]

  // Handle basic form input
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Handle property owner input
  const handlePropertyOwnerChange = e => {
    const { name, value } = e.target
    setPropertyOwnerData({
      ...propertyOwnerData,
      [name]: value
    })
  }

  // Handle artisan input
  const handleArtisanChange = e => {
    const { name, value } = e.target
    setArtisanData({
      ...artisanData,
      [name]: value
    })
  }

  // Toggle specialization
  const toggleSpecialization = spec => {
    setArtisanData({
      ...artisanData,
      specialization: artisanData.specialization.includes(spec)
        ? artisanData.specialization.filter(s => s !== spec)
        : [...artisanData.specialization, spec]
    })
  }

  // Validation
  const validateBasicInfo = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email address')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return false
    }
    return true
  }

  const validatePropertyOwnerInfo = () => {
    if (!propertyOwnerData.companyName.trim()) {
      setError('Company name is required')
      return false
    }
    if (!propertyOwnerData.yearsInBusiness) {
      setError('Years in business is required')
      return false
    }
    return true
  }

  const validateArtisanInfo = () => {
    if (!artisanData.businessName.trim()) {
      setError('Business name is required')
      return false
    }
    if (artisanData.specialization.length === 0) {
      setError('Select at least one specialization')
      return false
    }
    if (!artisanData.yearsOfExperience) {
      setError('Years of experience is required')
      return false
    }
    return true
  }

  // Handle next step
  const handleNextStep = () => {
    setError('')

    if (step === 1) {
      if (validateBasicInfo()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (userType === 'property-owner') {
        if (validatePropertyOwnerInfo()) {
          setStep(3)
        }
      } else {
        if (validateArtisanInfo()) {
          setStep(3)
        }
      }
    }
  }

  // Handle previous step
  const handlePreviousStep = () => {
    setStep(step - 1)
    setError('')
  }

  // Handle registration submission
  const handleRegisterSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint =
        userType === 'property-owner'
          ? 'http://10.0.1.9:4001/api/auth/register/property-owner'
          : 'http://10.0.1.9:4001/api/auth/register/artisan'

      const payload =
        userType === 'property-owner'
          ? {
              ...formData,
              ...propertyOwnerData
            }
          : {
              ...formData,
              businessName: artisanData.businessName,
              specialization: artisanData.specialization,
              yearsOfExperience: artisanData.yearsOfExperience
            }

      const response = await axios.post(endpoint, payload)

      // With axios, successful responses are in response.data
      const data = response.data

      setSuccess(true)
      setTimeout(() => {
        // Redirect to OTP verification or login
        window.location.href = `/auth/verify-otp?email=${encodeURIComponent(
          formData.email
        )}&userId=${data.userId}`
      }, 2000)
    } catch (err) {
      // Axios puts error responses in err.response
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='register-container'>
      {/* Background decoration */}
      <div className='register-bg-decoration'></div>

      <div className='register-wrapper'>
        {/* Header */}
        <div className='register-header'>
          <h1 className='register-title'>Join Our Platform</h1>
          <p className='register-subtitle'>
            {!userType
              ? 'Choose your account type to get started'
              : userType === 'property-owner'
              ? 'Register as a Property Owner'
              : 'Register as an Artisan'}
          </p>
        </div>

        {/* User Type Selection */}
        {!userType ? (
          <div className='user-type-selection'>
            <button
              className='user-type-card property-owner-card'
              onClick={() => {
                setUserType('property-owner')
                setStep(1)
              }}
            >
              <div className='user-type-icon'>🏢</div>
              <h3>Property Owner</h3>
              <p>Manage your properties and find trusted artisans</p>
            </button>

            <button
              className='user-type-card artisan-card'
              onClick={() => {
                setUserType('artisan')
                setStep(1)
              }}
            >
              <div className='user-type-icon'>🔧</div>
              <h3>Artisan</h3>
              <p>Find jobs and build your professional profile</p>
            </button>
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className='progress-container'>
              <div className='progress-bar'>
                <div
                  className='progress-fill'
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
              <div className='step-indicators'>
                <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
                  1
                </div>
                <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
                  2
                </div>
                <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
                  3
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className='register-form'>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className='form-step'>
                  <h2 className='step-title'>Basic Information</h2>

                  <div className='form-group'>
                    <label>First Name *</label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder='John'
                      className='form-input'
                    />
                  </div>

                  <div className='form-group'>
                    <label>Last Name *</label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder='Doe'
                      className='form-input'
                    />
                  </div>

                  <div className='form-group'>
                    <label>Email Address *</label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='john@example.com'
                      className='form-input'
                    />
                  </div>

                  <div className='form-group'>
                    <label>Phone Number *</label>
                    <input
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='+1 (555) 000-0000'
                      className='form-input'
                    />
                  </div>

                  <div className='form-group password-group'>
                    <label>Password *</label>
                    <div className='password-input-wrapper'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder='At least 8 characters'
                        className='form-input'
                      />
                      <button
                        type='button'
                        className='password-toggle'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className='form-group password-group'>
                    <label>Confirm Password *</label>
                    <div className='password-input-wrapper'>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder='Confirm your password'
                        className='form-input'
                      />
                      <button
                        type='button'
                        className='password-toggle'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className='form-group checkbox-group'>
                    <input
                      type='checkbox'
                      id='agreeToTerms'
                      name='agreeToTerms'
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className='form-checkbox'
                    />
                    <label htmlFor='agreeToTerms'>
                      I agree to the <a href='/terms'>Terms and Conditions</a>{' '}
                      and <a href='/privacy'>Privacy Policy</a>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Type-Specific Information */}
              {step === 2 && (
                <div className='form-step'>
                  <h2 className='step-title'>
                    {userType === 'property-owner'
                      ? 'Business Information'
                      : 'Professional Information'}
                  </h2>

                  {userType === 'property-owner' ? (
                    <>
                      <div className='form-group'>
                        <label>Company Name *</label>
                        <input
                          type='text'
                          name='companyName'
                          value={propertyOwnerData.companyName}
                          onChange={handlePropertyOwnerChange}
                          placeholder='Your Company Name'
                          className='form-input'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Company Registration Number</label>
                        <input
                          type='text'
                          name='companyRegistration'
                          value={propertyOwnerData.companyRegistration}
                          onChange={handlePropertyOwnerChange}
                          placeholder='Optional'
                          className='form-input'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Years in Business *</label>
                        <input
                          type='number'
                          name='yearsInBusiness'
                          value={propertyOwnerData.yearsInBusiness}
                          onChange={handlePropertyOwnerChange}
                          placeholder='e.g., 5'
                          className='form-input'
                          min='0'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Management Style *</label>
                        <select
                          name='managementStyle'
                          value={propertyOwnerData.managementStyle}
                          onChange={handlePropertyOwnerChange}
                          className='form-input'
                        >
                          <option value='self-managed'>Self-Managed</option>
                          <option value='professionally-managed'>
                            Professionally Managed
                          </option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='form-group'>
                        <label>Business Name *</label>
                        <input
                          type='text'
                          name='businessName'
                          value={artisanData.businessName}
                          onChange={handleArtisanChange}
                          placeholder='Your Business Name'
                          className='form-input'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Years of Experience *</label>
                        <input
                          type='number'
                          name='yearsOfExperience'
                          value={artisanData.yearsOfExperience}
                          onChange={handleArtisanChange}
                          placeholder='e.g., 5'
                          className='form-input'
                          min='0'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Service Radius (km)</label>
                        <input
                          type='number'
                          name='serviceRadius'
                          value={artisanData.serviceRadius}
                          onChange={handleArtisanChange}
                          className='form-input'
                          min='0'
                        />
                      </div>

                      <div className='form-group'>
                        <label>Specializations *</label>
                        <div className='specialization-grid'>
                          {artisanSpecializations.map(spec => (
                            <button
                              key={spec}
                              type='button'
                              className={`specialization-chip ${
                                artisanData.specialization.includes(spec)
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => toggleSpecialization(spec)}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <div className='form-step'>
                  <h2 className='step-title'>Review Information</h2>

                  <div className='review-section'>
                    <h3>Personal Information</h3>
                    <div className='review-grid'>
                      <div className='review-item'>
                        <span className='review-label'>First Name</span>
                        <span className='review-value'>
                          {formData.firstName}
                        </span>
                      </div>
                      <div className='review-item'>
                        <span className='review-label'>Last Name</span>
                        <span className='review-value'>
                          {formData.lastName}
                        </span>
                      </div>
                      <div className='review-item'>
                        <span className='review-label'>Email</span>
                        <span className='review-value'>{formData.email}</span>
                      </div>
                      <div className='review-item'>
                        <span className='review-label'>Phone</span>
                        <span className='review-value'>{formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className='review-section'>
                    <h3>
                      {userType === 'property-owner'
                        ? 'Business Details'
                        : 'Professional Details'}
                    </h3>
                    <div className='review-grid'>
                      {userType === 'property-owner' ? (
                        <>
                          <div className='review-item'>
                            <span className='review-label'>Company Name</span>
                            <span className='review-value'>
                              {propertyOwnerData.companyName}
                            </span>
                          </div>
                          <div className='review-item'>
                            <span className='review-label'>
                              Years in Business
                            </span>
                            <span className='review-value'>
                              {propertyOwnerData.yearsInBusiness}
                            </span>
                          </div>
                          <div className='review-item'>
                            <span className='review-label'>
                              Management Style
                            </span>
                            <span className='review-value'>
                              {propertyOwnerData.managementStyle}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='review-item'>
                            <span className='review-label'>Business Name</span>
                            <span className='review-value'>
                              {artisanData.businessName}
                            </span>
                          </div>
                          <div className='review-item'>
                            <span className='review-label'>
                              Years of Experience
                            </span>
                            <span className='review-value'>
                              {artisanData.yearsOfExperience}
                            </span>
                          </div>
                          <div className='review-item full-width'>
                            <span className='review-label'>
                              Specializations
                            </span>
                            <div className='review-specializations'>
                              {artisanData.specialization.map(spec => (
                                <span key={spec} className='spec-badge'>
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className='alert alert-error'>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className='alert alert-success'>
                  <CheckCircle size={18} />
                  <span>Registration successful! Redirecting...</span>
                </div>
              )}

              {/* Form Actions */}
              <div className='form-actions'>
                {step > 1 && (
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={handlePreviousStep}
                  >
                    Previous
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={loading}
                    onClick={handleRegisterSubmit}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className='spinner' />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Back to selection button */}
            <div className='back-to-selection'>
              <button className='btn-link' onClick={() => setUserType(null)}>
                ← Choose Different Account Type
              </button>
            </div>
          </>
        )}

        {/* Login Link */}
        <div className='auth-footer'>
          <p>Already have an account?</p>
          <a href='/auth/login' className='auth-link'>
            Sign in here
          </a>
        </div>
      </div>
    </div>
  )
}
