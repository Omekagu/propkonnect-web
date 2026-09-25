// cloudinaryHelper.js — All uploads go through the backend.
// No Cloudinary keys, cloud name, or upload presets on the client.
// The server holds all secrets and signs/uploads via Cloudinary SDK.

import { apiClient } from '@/libs/api-client'

/**
 * Upload a single File/Blob via the backend.
 *
 * @param {File|Blob} file
 * @param {'avatar'|'property'|'document'|'portfolio'|'receipt'} [type='property']
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary (file, type = 'property') {
  if (!file) throw new Error('No file provided')

  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post(`/api/upload?type=${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  if (!data.success || !data.url) {
    throw new Error(data.message || 'Upload failed')
  }

  return data.url
}

/**
 * Upload multiple files via the backend.
 *
 * @param {File[]} files
 * @param {'property'|'portfolio'|string} [type='property']
 * @returns {Promise<string[]>} array of secure_urls
 */
export async function uploadMultipleToCloudinary (files, type = 'property') {
  if (!files || files.length === 0) throw new Error('No files provided')

  const formData = new FormData()
  files.forEach(f => formData.append('files', f))

  const { data } = await apiClient.post(
    `/api/upload/multiple?type=${type}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  if (!data.success || !data.files) {
    throw new Error(data.message || 'Upload failed')
  }

  return data.files.map(f => f.url)
}
