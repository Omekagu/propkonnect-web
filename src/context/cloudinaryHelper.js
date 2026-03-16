// cloudinaryHelper.js — Direct unsigned upload to Cloudinary from the browser.
// Uses the same cloud account + upload preset as the mobile app (no API key/secret needed).
// Replaces the previous backend-proxy approach which required signed API credentials.

const CLOUD_NAME    = 'da26wgev2'
const UPLOAD_PRESET = 'Xtorm_doc'

const FOLDER_MAP = {
  avatar:    'propnekt/avatars',
  property:  'propnekt/properties',
  document:  'propnekt/documents',
  portfolio: 'propnekt/portfolio',
  receipt:   'propnekt/receipts'
}

/**
 * Upload a single File/Blob directly to Cloudinary (unsigned preset).
 *
 * @param {File|Blob} file   — browser File object
 * @param {'avatar'|'property'|'document'|'portfolio'|'receipt'} [type='property']
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary (file, type = 'property') {
  if (!file) throw new Error('No file provided')

  const folder       = FOLDER_MAP[type] || FOLDER_MAP.property
  const isDoc        = file.type === 'application/pdf' || file.type.startsWith('application/')
  const resourceType = isDoc ? 'raw' : 'image'

  const formData = new FormData()
  formData.append('file',           file)
  formData.append('upload_preset',  UPLOAD_PRESET)
  formData.append('folder',         folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  const res  = await fetch(endpoint, { method: 'POST', body: formData })
  const data = await res.json()

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed')
  }

  return data.secure_url
}

/**
 * Upload multiple files directly to Cloudinary.
 *
 * @param {File[]} files
 * @param {'property'|'portfolio'|...} [type='property']
 * @returns {Promise<string[]>} array of secure_urls
 */
export async function uploadMultipleToCloudinary (files, type = 'property') {
  return Promise.all(files.map(f => uploadToCloudinary(f, type)))
}
