// cloudinaryHelper.js — routes all uploads through our backend (→ Cloudinary signed API)
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function getToken () {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

/**
 * Upload a single file via our backend upload endpoint.
 * The backend validates and forwards to Cloudinary using signed API.
 *
 * @param {File}   file   — browser File object
 * @param {'avatar'|'property'|'document'|'portfolio'|'receipt'} [type='property']
 * @returns {Promise<string>} secure URL
 */
export async function uploadToCloudinary (file, type = 'property') {
  const token = getToken()
  const data = new FormData()
  data.append('file', file)

  try {
    const res = await axios.post(
      `${API_BASE}/api/upload?type=${type}`,
      data,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
          // Content-Type is set automatically by axios for FormData
        }
      }
    )

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Upload failed')
    }

    return res.data.url
  } catch (err) {
    console.error('Upload error:', err.response?.data || err.message)
    throw err
  }
}
