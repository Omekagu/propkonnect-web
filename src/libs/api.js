/**
 * api.js — Centralised API layer for the PropNect web client.
 *
 * All HTTP calls to the backend go through here.
 * Uses the pre-configured axios instance from api-client.ts
 * (handles base URL, auth token injection, and 401 logout).
 *
 * Usage:
 *   import { properties, bookings, auth } from '@/libs/api'
 *   const { data } = await properties.getAll({ limit: 6 })
 */

import { api } from './api-client'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register:          (data)          => api.post('/api/auth/register', data),
  registerArtisan:   (data)          => api.post('/api/auth/register/artisan', data),
  login:             (data)          => api.post('/api/auth/login', data),
  logout:            ()              => api.post('/api/auth/logout'),
  verifyOtp:         (data)          => api.post('/api/auth/verify-otp', data),
  resendOtp:         (data)          => api.post('/api/auth/resend-otp', data),
  forgotPassword:    (data)          => api.post('/api/auth/forgot-password', data),
  resetPassword:     (data)          => api.post('/api/auth/reset-password', data),
  refreshToken:      (data)          => api.post('/api/auth/refresh-token', data),
  getMe:             ()              => api.get('/api/auth/me'),
  changePassword:    (data)          => api.put('/api/auth/change-password', data),

  // Device / session management
  getSessions:       ()              => api.get('/api/auth/sessions'),
  revokeSession:     (sessionId)     => api.delete(`/api/auth/sessions/${sessionId}`),
  revokeAllSessions: ()              => api.delete('/api/auth/sessions'),

  registerPropertyOwner: (data)       => api.post('/api/auth/register/PROPERTY_OWNER', data),

  // Admin user management (auth-scoped routes)
  adminGetOwners:    ()              => api.get('/api/auth/admin/PROPERTY_OWNERs'),
  adminGetArtisans:  ()              => api.get('/api/auth/admin/artisans'),
  adminGetUser:      (userId)        => api.get(`/api/auth/admin/users/${userId}`),
  adminGetKycQueue:  (params)        => api.get('/api/auth/admin/kyc-queue', { params }),
  adminUpdateKyc:    (userId, data)  => api.put(`/api/auth/admin/users/${userId}/kyc`, data),
  adminSuspend:      (userId)        => api.post(`/api/auth/admin/users/${userId}/suspend`),
  adminUnsuspend:    (userId)        => api.post(`/api/auth/admin/users/${userId}/unsuspend`),

  // Artisan discovery (public)
  getNearbyArtisans: (params)        => api.get('/api/auth/artisans/nearby', { params }),
  getTopArtisans:    (params)        => api.get('/api/auth/artisans/top-rated', { params }),

  // User profile (auth-scoped)
  getUserProfile:    (userId)        => api.get(`/api/auth/users/${userId}`),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = {
  getMe:          ()                 => api.get('/api/user/me'),
  getId:          ()                 => api.get('/api/user/id'),
  updateProfile:  (data)             => api.put('/api/user/profile', data),
  getStatus:      (userId)           => api.get(`/api/user/${userId}/status`),
  getById:        (userId)           => api.get(`/api/user/${userId}`),

  // Admin
  getAll:         (params)           => api.get('/api/user', { params }),
  getStats:       ()                 => api.get('/api/user/stats'),
  create:         (data)             => api.post('/api/user', data),
  update:         (userId, data)     => api.put(`/api/user/${userId}`, data),
  remove:         (userId)           => api.delete(`/api/user/${userId}`),
  bulkDelete:     (data)             => api.post('/api/user/bulk-delete', data),
  changeRole:     (userId, role)     => api.patch(`/api/user/${userId}/role`, { role }),
  verify:         (userId, data)     => api.put(`/api/user/${userId}/verify`, data),
}

// ─── Properties ───────────────────────────────────────────────────────────────
export const properties = {
  getAll:              (params)           => api.get('/api/properties/all', { params }),
  search:              (params)           => api.get('/api/properties/search', { params }),
  getMine:             (params)           => api.get('/api/properties/property/mine', { params }),
  getById:             (id)               => api.get(`/api/properties/${id}`),
  getSimilar:          (id, params)       => api.get(`/api/properties/${id}/similar`, { params }),
  getUserHistory:      (userId)           => api.get(`/api/properties/history/${userId}`),
  create:              (data)             => api.post('/api/properties', data),
  update:              (id, data)         => api.put(`/api/properties/${id}`, data),
  remove:              (id)               => api.delete(`/api/properties/${id}`),
  updateStatus:        (id, data)         => api.patch(`/api/properties/${id}/status`, data),
  uploadMedia:         (id, formData)     => api.post(`/api/properties/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCompliance:    (id, data)         => api.patch(`/api/properties/${id}/compliance`, data),
  updateListingTier:   (id, data)         => api.patch(`/api/properties/${id}/listing-tier`, data),
  verifyPurchase:      (data)             => api.post('/api/properties/verify-purchase', data),
  bulkUpload:          (data)             => api.post('/api/properties/bulk', data),
  createPortfolio:     (data)             => api.post('/api/properties/portfolio', data),

  // Property actions
  list:                (params)           => api.get('/api/properties', { params }),
  approve:             (id)               => api.patch(`/api/properties/${id}/approve`, {}),
  reject:              (id, data)         => api.patch(`/api/properties/${id}/reject`, data),
  initiateRent:        (id, data)         => api.post(`/api/properties/${id}/initiate-rent`, data),
  initiatePurchase:    (id, data)         => api.post(`/api/properties/${id}/initiate-purchase`, data),

  // Comments & likes
  getComments:         (id, params)       => api.get(`/api/properties/${id}/comments`, { params }),
  addComment:          (id, data)         => api.post(`/api/properties/${id}/comments`, data),
  getLikeStatus:       (id)               => api.get(`/api/properties/${id}/like-status`),
  like:                (id)               => api.post(`/api/properties/${id}/like`, {}),

  // Applications
  apply:               (data)             => api.post('/api/properties/apply', data),
  getMyApplications:   ()                 => api.get('/api/properties/appliedProperty'),
  createApplication:   (data)             => api.post('/api/properties/property-applications', data),
  getApplicationsBatch:(data)             => api.post('/api/properties/property-applications/batch', data),
  getApplicationsByProperty: (propertyId) => api.get(`/api/properties/property-applications/property/${propertyId}`),
  getApplications:     (params)           => api.get('/api/properties/applications', { params }),
  updateApplication:   (id, data)         => api.patch(`/api/properties/applications/${id}`, data),
  deleteApplication:   (id)               => api.delete(`/api/properties/property-applications/${id}`),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = {
  checkAvailability: (params)          => api.get('/api/bookings/check-availability', { params }),
  initPayment:       (data)            => api.post('/api/bookings/init-payment', data),
  verifyPayment:     (ref, data)       => api.post(`/api/bookings/verify/${ref}`, data),
  getReceipt:        (token)           => api.get('/api/bookings/receipt', { params: { token } }),
  getMy:             ()                => api.get('/api/bookings/my'),
  getCart:           ()                => api.get('/api/bookings/cart'),
  removeFromCart:    (id)              => api.delete(`/api/bookings/cart/${id}`),
  getByProperty:     (propertyId)      => api.get(`/api/bookings/property/${propertyId}`),
  getById:           (id)              => api.get(`/api/bookings/${id}`),
  checkout:          (id)              => api.post(`/api/bookings/${id}/checkout`),
  releaseCaution:    (id)              => api.post(`/api/bookings/${id}/release-caution`),
  claimDamage:       (id, data)        => api.post(`/api/bookings/${id}/claim-damage`, data),
  cancel:            (id, data)        => api.post(`/api/bookings/${id}/cancel`, data),

  // Admin
  adminGetAll:       (params)          => api.get('/api/bookings/admin/all', { params }),
}

// ─── Leases ───────────────────────────────────────────────────────────────────
export const leases = {
  getMy:               ()             => api.get('/api/leases/my'),
  getLandlord:         ()             => api.get('/api/leases/landlord'),
  getCountdown:        ()             => api.get('/api/leases/my/countdown'),
  getById:             (id)           => api.get(`/api/leases/${id}`),
  updateStatus:        (id, data)     => api.patch(`/api/leases/${id}/status`, data),
  payRent:             (id, data)     => api.post(`/api/leases/${id}/pay-rent`, data),
  requestInstallment:  (id, instId)   => api.post(`/api/leases/${id}/request-payment/${instId}`),
  sendExpiryReminders: ()             => api.post('/api/leases/send-expiry-reminders'),
}

// ─── Inspections ──────────────────────────────────────────────────────────────
export const inspections = {
  initPayment:         (data)         => api.post('/api/inspections/init-payment', data),
  verifyPayment:       (ref, data)    => api.post(`/api/inspections/verify/${ref}`, data),
  getMy:               ()             => api.get('/api/inspections/my'),
  getByProperty:       (propertyId)   => api.get(`/api/inspections/property/${propertyId}`),
  confirm:             (id)           => api.patch(`/api/inspections/${id}/confirm`),
  complete:            (id)           => api.patch(`/api/inspections/${id}/complete`),
  cancel:              (id)           => api.patch(`/api/inspections/${id}/cancel`),
}

// ─── KYC ──────────────────────────────────────────────────────────────────────
export const kyc = {
  submit:       (data)                => api.post('/api/kyc/submit', data),
  getStatus:    ()                    => api.get('/api/kyc/status'),
  resubmit:     (data)                => api.post('/api/kyc/resubmit', data),

  // Admin
  adminGetQueue:    (params)          => api.get('/api/kyc/admin/queue', { params }),
  adminGetDetail:   (userId)          => api.get(`/api/kyc/admin/${userId}`),
  adminReview:      (userId, data)    => api.put(`/api/kyc/admin/${userId}/review`, data),
  adminStartReview: (userId)          => api.patch(`/api/kyc/admin/${userId}/start-review`),
  adminCancel:      (userId)          => api.patch(`/api/kyc/admin/${userId}/cancel`),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = {
  stripeCheckout:           (data)        => api.post('/api/payments/stripe-checkout', data),
  stripeEscrowIntent:       (data)        => api.post('/api/payments/stripe-escrow/intent', data),
  stripeEscrowCapture:      (intentId)    => api.post(`/api/payments/stripe-escrow/${intentId}/capture`),
  stripeEscrowCancel:       (intentId)    => api.post(`/api/payments/stripe-escrow/${intentId}/cancel`),
  createVirtualAccount:     (data)        => api.post('/api/payments/create-virtual-account', data),
  initMonnify:              (data)        => api.post('/api/payments/initialize-monnify-transaction', data),
  verifyMonnify:            (params)      => api.get('/api/payments/verify-monnify-transaction', { params }),
  fundEscrow:               (data)        => api.post('/api/payments/escrow/fund', data),
  getEscrow:                (id)          => api.get(`/api/payments/escrow/${id}`),
  getEscrowByRef:           (refId)       => api.get(`/api/payments/escrow/reference/${refId}`),
  releaseEscrow:            (id, data)    => api.post(`/api/payments/escrow/${id}/release`, data),
  refundEscrow:             (id, data)    => api.post(`/api/payments/escrow/${id}/refund`, data),
  disputeEscrow:            (id, data)    => api.post(`/api/payments/escrow/${id}/dispute`, data),
  initBNPL:                 (data)        => api.post('/api/payments/bnpl/initiate', data),
  getMyBNPLPlans:           ()            => api.get('/api/payments/bnpl/my-plans'),
  getBNPLPlan:              (txId)        => api.get(`/api/payments/bnpl/${txId}`),
  payBNPLInstallment:       (txId, data)  => api.post(`/api/payments/bnpl/${txId}/pay-installment`, data),
  cancelBNPLPlan:           (txId)        => api.post(`/api/payments/bnpl/${txId}/cancel`),
}

// ─── Paystack ─────────────────────────────────────────────────────────────────
export const paystack = {
  getPlans:            ()           => api.get('/api/paystack/plans'),
  getBanks:            ()           => api.get('/api/paystack/banks'),
  resolveAccount:      (params)     => api.get('/api/paystack/resolve-account', { params }),
  getSetupStatus:      ()           => api.get('/api/paystack/setup-status'),
  initializeSetup:     (data)       => api.post('/api/paystack/setup/initialize', data),
  submitKyc:           (data)       => api.post('/api/paystack/setup/kyc', data),
  submitBank:          (data)       => api.post('/api/paystack/setup/bank', data),
  subscribe:           (data)       => api.post('/api/paystack/subscribe', data),
  servicePayment:      (data)       => api.post('/api/paystack/service-payment', data),
  initializePayment:   (data)       => api.post('/api/paystack/initialize-payment', data),
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = {
  create:       (data)              => api.post('/api/transaction/create', data),
  getMine:      (params)            => api.get('/api/transaction/mine', { params }),
  getById:      (id)                => api.get(`/api/transaction/${id}`),

  // Admin
  adminGetAll:  (params)            => api.get('/api/transaction/admin/all', { params }),
  adminVerify:  (id)                => api.put(`/api/transaction/${id}/verify`),
  adminReject:  (id, data)          => api.put(`/api/transaction/${id}/reject`, data),
  adminRefund:  (id, data)          => api.put(`/api/transaction/${id}/refund`, data),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  getAll:       (params)            => api.get('/api/notifications', { params }),
  getUnread:    ()                  => api.get('/api/notifications/unread-count'),
  markRead:     (id)                => api.patch(`/api/notifications/${id}/read`),
  markAllRead:  ()                  => api.patch('/api/notifications/read-all'),
  remove:       (id)                => api.delete(`/api/notifications/${id}`),
  clearAll:     ()                  => api.delete('/api/notifications/clear-all'),
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = {
  getConversations:     ()          => api.get('/api/messages/conversations'),
  getOrCreateConvo:     (data)      => api.post('/api/messages/conversation', data),
  getMessages:          (convoId)   => api.get(`/api/messages/${convoId}`),
  send:                 (data)      => api.post('/api/messages/send', data),
  sendImage:            (formData)  => api.post('/api/messages/send-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ─── Artisans ─────────────────────────────────────────────────────────────────
export const artisans = {
  getPublic:            (params)    => api.get('/api/artisan', { params }),
  getById:              (id)        => api.get(`/api/artisan/${id}`),
  create:               (data)      => api.post('/api/artisan', data),
  update:               (id, data)  => api.put(`/api/artisan/${id}`, data),
  remove:               (id)        => api.delete(`/api/artisan/${id}`),
  rate:                 (id, data)  => api.post(`/api/artisan/${id}/rate`, data),
  getPortfolios:        (params)    => api.get('/api/artisan/portfolio', { params }),
  createPortfolio:      (data)      => api.post('/api/artisan/portfolio', data),
  getMyPortfolio:       ()          => api.get('/api/artisan/portfolio/me'),
  getPortfolioById:     (id)        => api.get(`/api/artisan/portfolio/${id}`),
  updatePortfolio:      (id, data)  => api.put(`/api/artisan/portfolio/${id}`, data),
  deletePortfolio:      (id)        => api.delete(`/api/artisan/portfolio/${id}`),
  addReview:            (id, data)  => api.post(`/api/artisan/portfolio/${id}/review`, data),
  getDocuments:         ()          => api.get('/api/artisan/documents'),
  uploadDocument:       (formData)  => api.post('/api/artisan/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument:       (docId)     => api.delete(`/api/artisan/documents/${docId}`),

  // Admin
  adminGetAll:          (params)    => api.get('/api/admin/artisans', { params }),
  adminGetStats:        ()          => api.get('/api/admin/artisans/stats/overview'),
  adminSearch:          (params)    => api.get('/api/admin/artisans/search', { params }),
  adminGetById:         (id)        => api.get(`/api/admin/artisans/${id}`),
  adminUpdate:          (id, data)  => api.put(`/api/admin/artisans/${id}`, data),
  adminVerify:          (id, data)  => api.patch(`/api/admin/artisans/${id}/verify`, data),
  adminBgCheck:         (id, data)  => api.patch(`/api/admin/artisans/${id}/background-check`, data),
  adminDelete:          (id)        => api.delete(`/api/admin/artisans/${id}`),
  adminBulkUpdate:      (data)      => api.post('/api/admin/artisans/bulk-update', data),
}

// ─── Service Requests ─────────────────────────────────────────────────────────
export const serviceRequests = {
  create:               (data)            => api.post('/api/service-requests', data),
  getAll:               (params)          => api.get('/api/service-requests', { params }),
  getMine:              ()                => api.get('/api/service-requests/my-requests'),
  getTenantMine:        ()                => api.get('/api/service-requests/mine'),
  getById:              (id)              => api.get(`/api/service-requests/${id}`),
  update:               (id, data)        => api.put(`/api/service-requests/${id}`, data),
  remove:               (id)              => api.delete(`/api/service-requests/${id}`),
  getBids:              (id)              => api.get(`/api/service-requests/${id}/bids`),
  complete:             (id, data)        => api.post(`/api/service-requests/${id}/complete`, data),
  cancel:               (id, data)        => api.post(`/api/service-requests/${id}/cancel`, data),
  rate:                 (id, data)        => api.post(`/api/service-requests/${id}/rate`, data),
  setMilestones:        (id, data)        => api.post(`/api/service-requests/${id}/milestones`, data),
  getMilestones:        (id)              => api.get(`/api/service-requests/${id}/milestones`),
  payMilestone:         (id, mid, data)   => api.patch(`/api/service-requests/${id}/milestones/${mid}/pay`, data),
  releaseMilestone:     (id, mid)         => api.patch(`/api/service-requests/${id}/milestones/${mid}/release`),
}

// ─── Bids ─────────────────────────────────────────────────────────────────────
export const bids = {
  create:       (data)            => api.post('/api/bids', data),
  getMine:      ()                => api.get('/api/bids/my-bids'),
  getById:      (id)              => api.get(`/api/bids/${id}`),
  update:       (id, data)        => api.put(`/api/bids/${id}`, data),
  withdraw:     (id)              => api.delete(`/api/bids/${id}`),
  accept:       (id, data)        => api.post(`/api/bids/${id}/accept`, data),
  reject:       (id, data)        => api.post(`/api/bids/${id}/reject`, data),
  negotiate:    (id, data)        => api.post(`/api/bids/${id}/negotiate`, data),
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export const ai = {
  suggestPrice:        (data)     => api.post('/api/ai/suggest-price', data),
  getMaintenanceRisk:  (id)       => api.get(`/api/ai/properties/${id}/maintenance-risk`),
}

// ─── Settings (personal) ──────────────────────────────────────────────────────
export const settings = {
  getProfile:           ()         => api.get('/api/settings/profile'),
  updateProfile:        (data)     => api.patch('/api/settings/profile', data),
  uploadAvatar:         (formData) => api.post('/api/settings/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getNotifications:     ()         => api.get('/api/settings/notifications'),
  updateNotifications:  (data)     => api.put('/api/settings/notifications', data),
  getBilling:           ()         => api.get('/api/settings/billing'),
  updateBilling:        (data)     => api.patch('/api/settings/billing', data),
  linkBank:             (data)     => api.post('/api/settings/billing/bank', data),
  updateSecurity:       (data)     => api.patch('/api/settings/security', data),
  update2FA:            (data)     => api.patch('/api/settings/security/2fa', data),
  getSessions:          ()         => api.get('/api/settings/security/sessions'),
  revokeAllSessions:    ()         => api.delete('/api/settings/security/sessions'),
  revokeSession:        (id)       => api.delete(`/api/settings/security/sessions/${id}`),
  deactivate:           (data)     => api.post('/api/settings/security/deactivate', data),
  deleteAccount:        (data)     => api.delete('/api/settings/account', data),
  getPreferences:       ()         => api.get('/api/settings/preferences'),
  updatePreferences:    (data)     => api.put('/api/settings/preferences', data),
}

// ─── Platform Settings (admin) ────────────────────────────────────────────────
export const platformSettings = {
  get:                    ()        => api.get('/api/admin/platform-settings'),
  updateFees:             (data)    => api.patch('/api/admin/platform-settings/fees', data),
  updateFeatures:         (data)    => api.patch('/api/admin/platform-settings/features', data),
  updateListingTiers:     (data)    => api.patch('/api/admin/platform-settings/listing-tiers', data),
  updateKyc:              (data)    => api.patch('/api/admin/platform-settings/kyc', data),
  updateLimits:           (data)    => api.patch('/api/admin/platform-settings/limits', data),
  updateTrial:            (data)    => api.patch('/api/admin/platform-settings/trial', data),
  updateSubscriptionPlans:(data)    => api.patch('/api/admin/platform-settings/subscription-plans', data),
  updateEmail:            (data)    => api.patch('/api/admin/platform-settings/email', data),
  updateAccountVerification:(data)  => api.patch('/api/admin/platform-settings/account-verification', data),
  updateBranding:         (data)    => api.patch('/api/admin/platform-settings/branding', data),
  updateInspectionFee:    (data)    => api.patch('/api/admin/platform-settings/inspection-fee', data),
  expireTrials:           ()        => api.post('/api/admin/platform-settings/expire-trials'),
  enforcePlanLimits:      ()        => api.post('/api/admin/platform-settings/enforce-plan-limits'),
}

// ─── Email Templates (admin) ──────────────────────────────────────────────────
export const emailTemplates = {
  getAll:     ()                    => api.get('/api/admin/email-templates'),
  getByType:  (type)                => api.get(`/api/admin/email-templates/${type}`),
  update:     (type, data)          => api.put(`/api/admin/email-templates/${type}`, data),
  reset:      (type)                => api.post(`/api/admin/email-templates/${type}/reset`),
}

// ─── Permissions / RBAC (admin) ───────────────────────────────────────────────
export const permissions = {
  getAll:      (params)             => api.get('/api/admin/permissions', { params }),
  getAdmins:   ()                   => api.get('/api/admin/permissions/admins'),
  getUser:     (userId)             => api.get(`/api/admin/permissions/${userId}`),
  update:      (userId, data)       => api.put(`/api/admin/permissions/${userId}`, data),
  reset:       (userId)             => api.post(`/api/admin/permissions/${userId}/reset`),
}

// ─── Admin Comments ───────────────────────────────────────────────────────────
export const adminComments = {
  getAll:     (params)              => api.get('/api/admin/comments', { params }),
  approve:    (commentId)           => api.patch(`/api/admin/comments/${commentId}/approve`),
  remove:     (commentId)           => api.delete(`/api/admin/comments/${commentId}`),
}

// ─── Finance (admin) ──────────────────────────────────────────────────────────
export const finance = {
  getOverview:        (params)      => api.get('/api/admin/finance/overview', { params }),
  getTransactions:    (params)      => api.get('/api/admin/finance/transactions', { params }),
  getEscrow:          (params)      => api.get('/api/admin/finance/escrow', { params }),
  getPendingPayouts:  (params)      => api.get('/api/admin/finance/payouts/pending', { params }),
  processPayout:      (data)        => api.post('/api/admin/finance/payouts/process', data),
  processPayoutBatch: (data)        => api.post('/api/admin/finance/payouts/batch', data),
  exportCsv:          (params)      => api.get('/api/admin/finance/export/csv', { params, responseType: 'blob' }),
  getArtisanEarnings: (id, params)  => api.get(`/api/admin/finance/artisan/${id}/earnings`, { params }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboard = {
  getSummary:     (params)          => api.get('/api/dashboard/summary', { params }),
  getTenants:     (params)          => api.get('/api/dashboard/tenants', { params }),
  adminGetBookings:(params)         => api.get('/api/dashboard/admin/bookings', { params }),
}

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const tickets = {
  create:           (data)          => api.post('/api/tickets', data),
  getMine:          ()              => api.get('/api/tickets/user/my-tickets'),
  getById:          (id)            => api.get(`/api/tickets/${id}`),
  getByNumber:      (num)           => api.get(`/api/tickets/number/${num}`),
  getCount:         ()              => api.get('/api/tickets/count'),
  addMessage:       (id, data)      => api.post(`/api/tickets/${id}/message`, data),
  rate:             (id, data)      => api.post(`/api/tickets/${id}/rate`, data),
  upload:           (id, formData)  => api.post(`/api/tickets/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  close:            (id)            => api.patch(`/api/tickets/${id}/close`),

  // Admin
  adminGetAll:          (params)    => api.get('/api/tickets', { params }),
  adminGetUnassigned:   ()          => api.get('/api/tickets/admin/unassigned'),
  adminGetStats:        ()          => api.get('/api/tickets/admin/statistics'),
  adminGetDashboard:    ()          => api.get('/api/tickets/admin/dashboard'),
  adminAssign:          (id, data)  => api.patch(`/api/tickets/${id}/assign`, data),
  adminUpdateStatus:    (id, data)  => api.patch(`/api/tickets/${id}/status`, data),
  adminRespond:         (id, data)  => api.post(`/api/tickets/${id}/respond`, data),
  adminAddNote:         (id, data)  => api.post(`/api/tickets/${id}/internal-note`, data),
  adminUpdatePriority:  (id, data)  => api.patch(`/api/tickets/${id}/priority`, data),
  adminUpdateCategory:  (id, data)  => api.patch(`/api/tickets/${id}/category`, data),
  adminBulkAssign:      (data)      => api.patch('/api/tickets/bulk/assign', data),
  adminBulkStatus:      (data)      => api.patch('/api/tickets/bulk/status', data),
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = {
  getAll:   (params)                => api.get('/api/reviews', { params }),
  create:   (data)                  => api.post('/api/reviews', data),
  remove:   (id)                    => api.delete(`/api/reviews/${id}`),
}

// ─── Upload (generic) ─────────────────────────────────────────────────────────
export const upload = {
  single:   (formData)              => api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  multiple: (formData)              => api.post('/api/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ─── Platform Config (public) ─────────────────────────────────────────────────
export const platformConfig = {
  get:        ()       => api.get('/api/platform-config'),
  getSettings:()       => api.get('/api/platform-settings'),
  updateFees: (data)   => api.patch('/api/platform-settings/fees', data),
}
