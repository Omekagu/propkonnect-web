// web-client/src/libs/cloudinaryUpload.js
// Convenience wrappers around context/cloudinaryHelper for typed uploads.
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/context/cloudinaryHelper'

export { uploadToCloudinary, uploadMultipleToCloudinary }

/** Upload a file as an avatar (propnekt/avatars folder). */
export const uploadAvatar = (file) => uploadToCloudinary(file, 'avatar')

/** Upload a file as a KYC/compliance document. */
export const uploadDocument = (file) => uploadToCloudinary(file, 'document')

/** Upload one or more property images. */
export const uploadPropertyImages = (files) => uploadMultipleToCloudinary(files, 'property')
