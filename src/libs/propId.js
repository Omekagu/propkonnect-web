/**
 * propId.js — Encode/decode MongoDB ObjectIds for use in public URLs.
 *
 * encodeId("69c3f4d9acb728b3726f4f6e") → "acP02asnKLNyb09u"  (16 chars, URL-safe)
 * decodeId("acP02asnKLNyb09u")          → "69c3f4d9acb728b3726f4f6e"
 *
 * Both functions are safe to call with any input — if the value is not the
 * expected format (e.g. already encoded, a uid string, or null/undefined)
 * they return the input unchanged.
 */

/**
 * Encode a 24-char hex MongoDB ObjectId to a 16-char URL-safe base64 string.
 * Non-ObjectId values (uid strings, null, etc.) are passed through unchanged.
 */
export function encodeId (id) {
  if (!id || typeof id !== 'string') return id
  if (!/^[0-9a-f]{24}$/i.test(id)) return id   // not an ObjectId → pass through
  try {
    const bytes = new Uint8Array(12)
    for (let i = 0; i < 12; i++) {
      bytes[i] = parseInt(id.slice(i * 2, i * 2 + 2), 16)
    }
    const b64 = btoa(String.fromCharCode(...bytes))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch {
    return id
  }
}

/**
 * Decode a 16-char URL-safe base64 slug back to a 24-char hex ObjectId.
 * Unrecognised values (raw ObjectIds, uid strings, etc.) are passed through.
 */
export function decodeId (slug) {
  if (!slug || typeof slug !== 'string') return slug
  if (/^[0-9a-f]{24}$/i.test(slug)) return slug  // already a raw ObjectId
  if (!/^[A-Za-z0-9_-]{16}$/.test(slug)) return slug  // not an encoded id
  try {
    const b64 = slug.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const binary = atob(padded)
    let hex = ''
    for (let i = 0; i < binary.length; i++) {
      hex += binary.charCodeAt(i).toString(16).padStart(2, '0')
    }
    return hex
  } catch {
    return slug
  }
}

/** Convenience: build a property URL with the encoded ID. */
export function propUrl (id) {
  return `/property/${encodeId(id)}`
}
