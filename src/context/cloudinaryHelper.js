import axios from 'axios'

export async function uploadToCloudinary (file) {
  const resourceType = file.type.startsWith('video') ? 'video' : 'image'

  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', 'thurderxtorm')
  data.append('folder', 'receipts')
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`

  try {
    const res = await axios.post(url, data)
    return res.data.secure_url
  } catch (err) {
    console.error('Cloudinary upload error:', err.response?.data || err.message)
    return null
  }
}
