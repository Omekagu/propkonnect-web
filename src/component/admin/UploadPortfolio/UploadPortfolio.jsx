import React, { useState, useRef, useEffect } from 'react'
import { uploadToCloudinary } from '@/context/cloudinaryHelper'
import './UploadPorfolio.scss'
import axios from 'axios'
import { useRouter } from 'next/navigation'
const ArtisanPortfolio = () => {
  const [formData, setFormData] = useState({
    profession: '',
    bio: '',
    experience: ''
  })
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const fileInputRef = useRef(null)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setIsAuthenticated(false)
      setMessage({
        type: 'error',
        text: 'Please log in to create your artisan portfolio'
      })
    }
  }, [])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = e => {
    const files = Array.from(e.target.files)

    if (images.length + files.length > 10) {
      setMessage({ type: 'error', text: 'Maximum 10 images allowed' })
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Check authentication again before submit
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setMessage({
        type: 'error',
        text: 'Please log in to create your artisan portfolio'
      })
      return
    }

    if (images.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please upload at least one portfolio image'
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)
    setMessage({ type: '', text: '' })

    try {
      // Upload images to Cloudinary first
      setMessage({ type: 'info', text: 'Uploading images...' })
      const uploadedUrls = []

      for (let i = 0; i < images.length; i++) {
        const url = await uploadToCloudinary(images[i])
        if (url) {
          uploadedUrls.push(url)
          setUploadProgress(Math.round(((i + 1) / images.length) * 50))
        } else {
          throw new Error(`Failed to upload image ${i + 1}`)
        }
      }

      const submitData = {
        ...formData,
        portfolioImages: uploadedUrls
      }

      setMessage({ type: 'info', text: 'Saving portfolio...' })
      setUploadProgress(75)

      const response = await axios.post(
        `${backend}/api/artisan/portfolio`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setUploadProgress(100)

      // Check if successful
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || 'Portfolio uploaded successfully!'
        })

        // Reset form
        setFormData({
          profession: '',
          bio: '',
          experience: ''
        })
        setImages([])
        setPreviews([])

        // Optionally redirect after success
        // setTimeout(() => {
        //   router.replace('/artisan/dashboard') // or wherever you want
        // }, 2000)
      } else {
        throw new Error(response.data.message || 'Failed to save portfolio')
      }
    } catch (error) {
      console.error('Upload error:', error)

      // Handle different error types
      let errorMessage = 'Failed to upload portfolio. Please try again.'

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || errorMessage

        // Handle specific status codes
        if (error.response.status === 409) {
          errorMessage =
            'You already have an artisan profile. Please update it instead.'
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
          localStorage.removeItem('authToken')
          setTimeout(() => router.replace('/login'), 2000)
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Network error. Please check your connection.'
      } else {
        // Error in request setup or Cloudinary upload
        errorMessage = error.message || errorMessage
      }

      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='portfolio-container'>
        <div className='portfolio-card'>
          <div className='header'>
            <h1>Authentication Required</h1>
            <p>Please log in to create your artisan portfolio</p>
          </div>
          <div className='message error'>{message.text}</div>
          <button
            className='submit-btn'
            onClick={() => router.replace('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='portfolio-container'>
      <div className='portfolio-card'>
        <div className='header'>
          <h1>Artisan Portfolio Upload</h1>
          <p>Showcase your craft to potential clients</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            {loading && uploadProgress > 0 && (
              <div className='progress-bar'>
                <div
                  className='progress-fill'
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className='progress-text'>{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className='portfolio-form'>
          <div className='form-section'>
            <h2>Professional Information</h2>

            <div className='form-group'>
              <label htmlFor='profession'>Profession *</label>
              <input
                type='text'
                id='profession'
                name='profession'
                value={formData.profession}
                onChange={handleInputChange}
                required
                placeholder='e.g., Carpenter, Potter, Weaver, Tailor'
                disabled={loading}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='experience'>Years of Experience *</label>
              <input
                type='number'
                id='experience'
                name='experience'
                value={formData.experience}
                onChange={handleInputChange}
                required
                min='0'
                max='50'
                placeholder='Years'
                disabled={loading}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='bio'>Bio / About Your Craft *</label>
              <textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                required
                rows='6'
                maxLength='1000'
                placeholder='Tell potential clients about your craft, experience, and what makes your work unique...'
                disabled={loading}
              />
              <small className='char-count'>
                {formData.bio.length}/1000 characters
              </small>
            </div>
          </div>

          <div className='form-section'>
            <h2>Portfolio Images *</h2>
            <p className='helper-text'>
              Upload 1-10 high-quality images of your best work (JPG, PNG, max
              5MB each)
            </p>

            <div className='upload-area'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept='image/jpeg,image/png,image/jpg'
                multiple
                style={{ display: 'none' }}
                disabled={loading || images.length >= 10}
              />

              <button
                type='button'
                className='upload-btn'
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || images.length >= 10}
              >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                {images.length >= 10
                  ? 'Maximum Images Reached'
                  : 'Choose Images'}
              </button>

              <span className='image-count'>
                {images.length}/10 images selected
              </span>
            </div>

            {previews.length > 0 && (
              <div className='preview-grid'>
                {previews.map((preview, index) => (
                  <div key={index} className='preview-item'>
                    <img src={preview} alt={`Portfolio ${index + 1}`} />
                    <button
                      type='button'
                      className='remove-btn'
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type='submit'
            className='submit-btn'
            disabled={loading || images.length === 0}
          >
            {loading ? (
              <>
                <span className='spinner'></span>
                Uploading... {uploadProgress}%
              </>
            ) : (
              'Create Artisan Portfolio'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ArtisanPortfolio
