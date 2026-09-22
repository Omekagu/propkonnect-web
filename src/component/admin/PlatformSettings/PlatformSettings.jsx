'use client'
import React, { useState, useEffect, useCallback } from 'react'
import './PlatformSettings.scss'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

function token () {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('authToken') || ''
}

async function api (method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  return res.json()
}

const TABS = [
  {
    id: 'branding', label: 'Branding', group: 'Identity',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='13.5' cy='6.5' r='.5' fill='currentColor' /><circle cx='17.5' cy='10.5' r='.5' fill='currentColor' />
        <circle cx='8.5' cy='7.5' r='.5' fill='currentColor' /><circle cx='6.5' cy='12.5' r='.5' fill='currentColor' />
        <path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' />
      </svg>
    )
  },
  {
    id: 'fees', label: 'Platform Fees', group: 'Monetization',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <line x1='12' y1='1' x2='12' y2='23' /><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
      </svg>
    )
  },
  {
    id: 'tiers', label: 'Listing Tiers', group: 'Monetization',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='3' width='7' height='7' /><rect x='14' y='3' width='7' height='7' /><rect x='14' y='14' width='7' height='7' /><rect x='3' y='14' width='7' height='7' />
      </svg>
    )
  },
  {
    id: 'plans', label: 'Subscription Plans', group: 'Monetization',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='1' y='4' width='22' height='16' rx='2' ry='2' /><line x1='1' y1='10' x2='23' y2='10' />
      </svg>
    )
  },
  {
    id: 'trial', label: 'Trial & Onboarding', group: 'Monetization',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
      </svg>
    )
  },
  {
    id: 'inspection', label: 'Inspection Fee', group: 'Monetization',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' /><polyline points='14 2 14 8 20 8' /><line x1='16' y1='13' x2='8' y2='13' /><line x1='16' y1='17' x2='8' y2='17' /><polyline points='10 9 9 9 8 9' />
      </svg>
    )
  },
  {
    id: 'kyc', label: 'KYC / Verification', group: 'Compliance',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
      </svg>
    )
  },
  {
    id: 'acctverify', label: 'Account Verification', group: 'Compliance',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' /><circle cx='12' cy='7' r='4' /><polyline points='16 11 18 13 22 9' />
      </svg>
    )
  },
  {
    id: 'features', label: 'Feature Flags', group: 'System',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' /><line x1='4' y1='22' x2='4' y2='15' />
      </svg>
    )
  },
  {
    id: 'limits', label: 'Limits', group: 'System',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <line x1='4' y1='21' x2='4' y2='14' /><line x1='4' y1='10' x2='4' y2='3' /><line x1='12' y1='21' x2='12' y2='12' /><line x1='12' y1='8' x2='12' y2='3' /><line x1='20' y1='21' x2='20' y2='16' /><line x1='20' y1='12' x2='20' y2='3' /><line x1='1' y1='14' x2='7' y2='14' /><line x1='9' y1='8' x2='15' y2='8' /><line x1='17' y1='16' x2='23' y2='16' />
      </svg>
    )
  },
  {
    id: 'email', label: 'Email Settings', group: 'System',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' /><polyline points='22,6 12,13 2,6' />
      </svg>
    )
  },
]

// ── Reusable input ────────────────────────────────────────────────────────────
function Field ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
  hint
}) {
  return (
    <div className='ps-field'>
      <label className='ps-label'>{label}</label>
      {hint && <span className='ps-hint'>{hint}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className='ps-input'
      />
    </div>
  )
}

function Toggle ({ label, name, checked, onChange, hint }) {
  return (
    <div className='ps-toggle-row'>
      <div>
        <span className='ps-label'>{label}</span>
        {hint && <span className='ps-hint ps-hint--block'>{hint}</span>}
      </div>
      <button
        type='button'
        className={`ps-toggle ${checked ? 'ps-toggle--on' : ''}`}
        onClick={() => onChange({ target: { name, value: !checked } })}
        aria-pressed={checked}
      >
        <span className='ps-toggle-knob' />
      </button>
    </div>
  )
}

// ── Branding Tab ──────────────────────────────────────────────────────────────
function BrandingTab ({ settings, onSave, saving }) {
  const b = settings?.branding || {}
  const [form, setForm] = useState({
    appName:       b.appName       || 'propnekt',
    tagline:       b.tagline       || '',
    logoUrl:       b.logoUrl       || '',
    faviconUrl:    b.faviconUrl    || '',
    heroTitle:     b.heroTitle     || '',
    heroSubtitle:  b.heroSubtitle  || '',
    heroImageUrl:  b.heroImageUrl  || '',
    contactEmail:  b.contactEmail  || '',
    supportEmail:  b.supportEmail  || '',
    phone:         b.phone         || '',
    address:       b.address       || '',
    footerTagline: b.footerTagline || '',
    // social
    twitter:   b.socialLinks?.twitter   || '',
    instagram: b.socialLinks?.instagram || '',
    facebook:  b.socialLinks?.facebook  || '',
    linkedin:  b.socialLinks?.linkedin  || '',
    whatsapp:  b.socialLinks?.whatsapp  || '',
    // stats bar
    verifiedUsers:  b.statsBar?.verifiedUsers  || '50,000+',
    activeListings: b.statsBar?.activeListings || '10,000+',
    avgRating:      b.statsBar?.avgRating      || '4.9/5',
    citiesCovered:  b.statsBar?.citiesCovered  || '20+'
  })

  useEffect(() => {
    const b2 = settings?.branding || {}
    setForm({
      appName:       b2.appName       || 'propnekt',
      tagline:       b2.tagline       || '',
      logoUrl:       b2.logoUrl       || '',
      faviconUrl:    b2.faviconUrl    || '',
      heroTitle:     b2.heroTitle     || '',
      heroSubtitle:  b2.heroSubtitle  || '',
      heroImageUrl:  b2.heroImageUrl  || '',
      contactEmail:  b2.contactEmail  || '',
      supportEmail:  b2.supportEmail  || '',
      phone:         b2.phone         || '',
      address:       b2.address       || '',
      footerTagline: b2.footerTagline || '',
      twitter:   b2.socialLinks?.twitter   || '',
      instagram: b2.socialLinks?.instagram || '',
      facebook:  b2.socialLinks?.facebook  || '',
      linkedin:  b2.socialLinks?.linkedin  || '',
      whatsapp:  b2.socialLinks?.whatsapp  || '',
      verifiedUsers:  b2.statsBar?.verifiedUsers  || '50,000+',
      activeListings: b2.statsBar?.activeListings || '10,000+',
      avgRating:      b2.statsBar?.avgRating      || '4.9/5',
      citiesCovered:  b2.statsBar?.citiesCovered  || '20+'
    })
  }, [settings])

  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    onSave('/api/admin/platform-settings/branding', {
      appName:       form.appName,
      tagline:       form.tagline,
      logoUrl:       form.logoUrl,
      faviconUrl:    form.faviconUrl,
      heroTitle:     form.heroTitle,
      heroSubtitle:  form.heroSubtitle,
      heroImageUrl:  form.heroImageUrl,
      contactEmail:  form.contactEmail,
      supportEmail:  form.supportEmail,
      phone:         form.phone,
      address:       form.address,
      footerTagline: form.footerTagline,
      socialLinks: {
        twitter:   form.twitter,
        instagram: form.instagram,
        facebook:  form.facebook,
        linkedin:  form.linkedin,
        whatsapp:  form.whatsapp
      },
      statsBar: {
        verifiedUsers:  form.verifiedUsers,
        activeListings: form.activeListings,
        avgRating:      form.avgRating,
        citiesCovered:  form.citiesCovered
      }
    })
  }

  return (
    <form className='ps-section' onSubmit={handleSubmit}>
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='13.5' cy='6.5' r='.5' fill='currentColor'/><circle cx='17.5' cy='10.5' r='.5' fill='currentColor'/><circle cx='8.5' cy='7.5' r='.5' fill='currentColor'/><circle cx='6.5' cy='12.5' r='.5' fill='currentColor'/><path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Branding &amp; Company Identity</h3>
          <p className='ps-section-desc'>Control the public-facing name, logo, hero content, and contact details across the entire platform.</p>
        </div>
      </div>

      <div className='ps-group-label'>App Identity</div>
      <Field label='App Name' name='appName' value={form.appName} onChange={ch} hint='Displayed in nav, footer, emails and SEO' />
      <Field label='Tagline' name='tagline' value={form.tagline} onChange={ch} hint='Short one-line brand tagline' />
      <div className='ps-grid-2'>
        <Field label='Logo URL' name='logoUrl' value={form.logoUrl} onChange={ch} hint='PNG/SVG, min 200px wide' />
        <Field label='Favicon URL' name='faviconUrl' value={form.faviconUrl} onChange={ch} hint='.ico or 32×32 PNG' />
      </div>

      <div className='ps-group-label'>Hero Section</div>
      <Field label='Hero Title' name='heroTitle' value={form.heroTitle} onChange={ch} hint='Main heading on the landing page hero' />
      <Field label='Hero Subtitle' name='heroSubtitle' value={form.heroSubtitle} onChange={ch} hint='Subheading below the hero title' />
      <Field label='Hero Background Image URL' name='heroImageUrl' value={form.heroImageUrl} onChange={ch} hint='1800px+ wide recommended' />

      <div className='ps-group-label'>Stats Bar</div>
      <div className='ps-grid-2'>
        <Field label='Verified Users' name='verifiedUsers' value={form.verifiedUsers} onChange={ch} hint='e.g. 50,000+' />
        <Field label='Active Listings' name='activeListings' value={form.activeListings} onChange={ch} hint='e.g. 10,000+' />
        <Field label='Avg Rating' name='avgRating' value={form.avgRating} onChange={ch} hint='e.g. 4.9/5' />
        <Field label='Cities Covered' name='citiesCovered' value={form.citiesCovered} onChange={ch} hint='e.g. 20+' />
      </div>

      <div className='ps-group-label'>Contact &amp; Footer</div>
      <div className='ps-grid-2'>
        <Field label='Contact Email' name='contactEmail' value={form.contactEmail} onChange={ch} />
        <Field label='Support Email' name='supportEmail' value={form.supportEmail} onChange={ch} />
        <Field label='Phone' name='phone' value={form.phone} onChange={ch} />
        <Field label='Address / City' name='address' value={form.address} onChange={ch} />
      </div>
      <Field label='Footer Tagline' name='footerTagline' value={form.footerTagline} onChange={ch} hint='Short description shown in the footer brand column' />

      <div className='ps-group-label'>Social Links</div>
      <div className='ps-grid-2'>
        <Field label='Twitter / X URL' name='twitter' value={form.twitter} onChange={ch} />
        <Field label='Instagram URL' name='instagram' value={form.instagram} onChange={ch} />
        <Field label='Facebook URL' name='facebook' value={form.facebook} onChange={ch} />
        <Field label='LinkedIn URL' name='linkedin' value={form.linkedin} onChange={ch} />
        <Field label='WhatsApp Link' name='whatsapp' value={form.whatsapp} onChange={ch} hint='e.g. https://wa.me/2348012345678' />
      </div>

      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Branding'}
        </button>
      </div>
    </form>
  )
}

// ── Fees Tab ──────────────────────────────────────────────────────────────────
function FeesTab ({ settings, onSave, saving }) {
  const fees = settings?.fees || {}
  const [form, setForm] = useState({
    propertyTransactionPct: fees.propertyTransactionPct ?? 5,
    serviceRequestPct: fees.serviceRequestPct ?? 10,
    escrowReleasePct: fees.escrowReleasePct ?? 2,
    withdrawalFlatFee: fees.withdrawalFlatFee ?? 100
  })

  useEffect(() => {
    const f = settings?.fees || {}
    setForm({
      propertyTransactionPct: f.propertyTransactionPct ?? 5,
      serviceRequestPct: f.serviceRequestPct ?? 10,
      escrowReleasePct: f.escrowReleasePct ?? 2,
      withdrawalFlatFee: f.withdrawalFlatFee ?? 100
    })
  }, [settings])

  const change = e =>
    setForm(p => ({ ...p, [e.target.name]: Number(e.target.value) }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/fees', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Platform Fees</h3>
          <p className='ps-section-desc'>Set percentage and flat fees applied to transactions across the platform.</p>
        </div>
      </div>
      <Field
        label='Property Transaction Fee (%)'
        name='propertyTransactionPct'
        type='number'
        min={0}
        max={100}
        step={0.1}
        value={form.propertyTransactionPct}
        onChange={change}
        hint='Applied on every property sale/rental payment'
      />
      <Field
        label='Service Request Fee (%)'
        name='serviceRequestPct'
        type='number'
        min={0}
        max={100}
        step={0.1}
        value={form.serviceRequestPct}
        onChange={change}
        hint='Platform cut from artisan jobs'
      />
      <Field
        label='Escrow Release Fee (%)'
        name='escrowReleasePct'
        type='number'
        min={0}
        max={100}
        step={0.1}
        value={form.escrowReleasePct}
        onChange={change}
        hint='Charged when escrow funds are released'
      />
      <Field
        label='Withdrawal Flat Fee (₦)'
        name='withdrawalFlatFee'
        type='number'
        min={0}
        step={1}
        value={form.withdrawalFlatFee}
        onChange={change}
        hint='Fixed fee per withdrawal from wallet'
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Fees'}
        </button>
      </div>
    </form>
  )
}

// ── Listing Tiers Tab ─────────────────────────────────────────────────────────
function TiersTab ({ settings, onSave, saving }) {
  const [tiers, setTiers] = useState(settings?.listingTiers || [])

  useEffect(() => {
    setTiers(settings?.listingTiers || [])
  }, [settings])

  const change = (idx, field, val) =>
    setTiers(prev =>
      prev.map((t, i) =>
        i === idx
          ? {
              ...t,
              [field]: ['name', 'badgeColor'].includes(field)
                ? val
                : Number(val)
            }
          : t
      )
    )

  return (
    <div className='ps-section'>
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'/><line x1='7' y1='7' x2='7.01' y2='7'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Listing Tiers</h3>
          <p className='ps-section-desc'>Configure pricing and per-tier features for each listing quality level.</p>
        </div>
      </div>
      <div className='ps-tiers-grid'>
        {tiers.map((tier, idx) => (
          <div key={tier.name || idx} className='ps-tier-card'>
            <div className='ps-tier-name'>{tier.name}</div>
            <Field
              label='Price (₦/month)'
              name='price'
              type='number'
              min={0}
              step={100}
              value={tier.price ?? 0}
              onChange={e => change(idx, 'price', e.target.value)}
            />
            <Field
              label='Max Images per Listing'
              name='maxImages'
              type='number'
              min={1}
              step={1}
              value={tier.maxImages ?? 5}
              onChange={e => change(idx, 'maxImages', e.target.value)}
            />
            <Field
              label='Featured Days on Homepage'
              name='featuredDays'
              type='number'
              min={0}
              step={1}
              value={tier.featuredDays ?? 0}
              onChange={e => change(idx, 'featuredDays', e.target.value)}
              hint='0 = not featured'
            />
            <Field
              label='Badge Color (hex)'
              name='badgeColor'
              type='text'
              value={tier.badgeColor ?? '#6b7280'}
              onChange={e => change(idx, 'badgeColor', e.target.value)}
              hint='e.g. #f59e0b'
            />
          </div>
        ))}
      </div>
      <div className='ps-save-bar'>
        <button
          className='ps-btn--primary'
          disabled={saving}
          onClick={() => onSave('/api/admin/platform-settings/listing-tiers', { tiers })}
        >
          {saving ? 'Saving…' : 'Save Tiers'}
        </button>
      </div>
    </div>
  )
}

// ── KYC Tab ───────────────────────────────────────────────────────────────────
function KycTab ({ settings, onSave, saving }) {
  const kyc = settings?.kyc || {}
  const [form, setForm] = useState({
    requireForBidding: !!kyc.requireForBidding,
    requireForApplications: !!kyc.requireForApplications,
    requireForPayouts: !!kyc.requireForPayouts,
    artisanVerificationRequired: !!kyc.artisanVerificationRequired
  })

  useEffect(() => {
    const k = settings?.kyc || {}
    setForm({
      requireForBidding: !!k.requireForBidding,
      requireForApplications: !!k.requireForApplications,
      requireForPayouts: !!k.requireForPayouts,
      artisanVerificationRequired: !!k.artisanVerificationRequired
    })
  }, [settings])

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/kyc', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>KYC Requirements</h3>
          <p className='ps-section-desc'>Control which platform actions require verified identity.</p>
        </div>
      </div>
      <Toggle
        label='Require KYC to Place Bids'
        name='requireForBidding'
        checked={form.requireForBidding}
        onChange={change}
        hint='Artisans must have verified identity to bid on jobs'
      />
      <Toggle
        label='Require KYC to Apply for Properties'
        name='requireForApplications'
        checked={form.requireForApplications}
        onChange={change}
        hint='Tenants must be KYC-verified to apply'
      />
      <Toggle
        label='Require KYC for Payouts'
        name='requireForPayouts'
        checked={form.requireForPayouts}
        onChange={change}
        hint='All users must verify identity before withdrawing funds'
      />
      <Toggle
        label='Artisan Verification Required'
        name='artisanVerificationRequired'
        checked={form.artisanVerificationRequired}
        onChange={change}
        hint='Artisans must pass admin review before going live'
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save KYC Settings'}
        </button>
      </div>
    </form>
  )
}

// ── Features Tab ──────────────────────────────────────────────────────────────
function FeaturesTab ({ settings, onSave, saving }) {
  const feats = settings?.features || {}
  const [form, setForm] = useState({
    bnplEnabled: !!feats.bnplEnabled,
    investmentsEnabled: !!feats.investmentsEnabled,
    aiValuationEnabled: !!feats.aiValuationEnabled,
    maintenanceMode: !!feats.maintenanceMode,
    registrationOpen: feats.registrationOpen !== false
  })

  useEffect(() => {
    const f = settings?.features || {}
    setForm({
      bnplEnabled: !!f.bnplEnabled,
      investmentsEnabled: !!f.investmentsEnabled,
      aiValuationEnabled: !!f.aiValuationEnabled,
      maintenanceMode: !!f.maintenanceMode,
      registrationOpen: f.registrationOpen !== false
    })
  }, [settings])

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/features', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'/><line x1='4' y1='22' x2='4' y2='15'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Feature Flags</h3>
          <p className='ps-section-desc'>Enable or disable major platform features globally — changes take effect immediately.</p>
        </div>
      </div>
      <Toggle
        label='BNPL (Buy Now Pay Later)'
        name='bnplEnabled'
        checked={form.bnplEnabled}
        onChange={change}
        hint='Allow tenants/buyers to split payments into installments'
      />
      <Toggle
        label='Investment Platform'
        name='investmentsEnabled'
        checked={form.investmentsEnabled}
        onChange={change}
        hint='Enable fractional property investments (Phase 8)'
      />
      <Toggle
        label='AI Property Valuation'
        name='aiValuationEnabled'
        checked={form.aiValuationEnabled}
        onChange={change}
        hint='Allow AI-powered price suggestions on listings'
      />
      <Toggle
        label='Maintenance Mode'
        name='maintenanceMode'
        checked={form.maintenanceMode}
        onChange={change}
        hint='⚠ Takes the platform offline for all non-admin users'
      />
      <Toggle
        label='New Registrations Open'
        name='registrationOpen'
        checked={form.registrationOpen}
        onChange={change}
        hint='Allow new users to sign up'
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Feature Flags'}
        </button>
      </div>
    </form>
  )
}

// ── Limits Tab ────────────────────────────────────────────────────────────────
function LimitsTab ({ settings, onSave, saving }) {
  const limits = settings?.limits || {}
  const [form, setForm] = useState({
    maxPropertiesPerOwner: limits.maxPropertiesPerOwner ?? 50,
    maxBidsPerArtisan: limits.maxBidsPerArtisan ?? 10,
    maxImagesPerProperty: limits.maxImagesPerProperty ?? 20
  })

  useEffect(() => {
    const l = settings?.limits || {}
    setForm({
      maxPropertiesPerOwner: l.maxPropertiesPerOwner ?? 50,
      maxBidsPerArtisan: l.maxBidsPerArtisan ?? 10,
      maxImagesPerProperty: l.maxImagesPerProperty ?? 20
    })
  }, [settings])

  const change = e =>
    setForm(p => ({ ...p, [e.target.name]: Number(e.target.value) }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/limits', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Platform Limits</h3>
          <p className='ps-section-desc'>Set hard caps for user actions — these apply across all accounts regardless of subscription plan.</p>
        </div>
      </div>
      <Field
        label='Max Properties per Owner'
        name='maxPropertiesPerOwner'
        type='number'
        min={1}
        step={1}
        value={form.maxPropertiesPerOwner}
        onChange={change}
      />
      <Field
        label='Max Bids per Artisan'
        name='maxBidsPerArtisan'
        type='number'
        min={1}
        step={1}
        value={form.maxBidsPerArtisan}
        onChange={change}
        hint='How many active bids an artisan can hold at once'
      />
      <Field
        label='Max Images per Property'
        name='maxImagesPerProperty'
        type='number'
        min={1}
        step={1}
        value={form.maxImagesPerProperty}
        onChange={change}
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Limits'}
        </button>
      </div>
    </form>
  )
}

// ── Trial Tab ─────────────────────────────────────────────────────────────────
function TrialTab ({ settings, onSave, saving }) {
  const trial = settings?.trial || {}
  const [form, setForm] = useState({
    enabled: trial.enabled ?? true,
    durationDays: trial.durationDays ?? 30,
    grantsPremiumAccess: trial.grantsPremiumAccess ?? true
  })
  const [enforcing, setEnforcing] = useState(false)
  const [expiring, setExpiring] = useState(false)
  const [actionResult, setActionResult] = useState(null)

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  useEffect(() => {
    const t = settings?.trial || {}
    setForm({
      enabled: t.enabled ?? true,
      durationDays: t.durationDays ?? 30,
      grantsPremiumAccess: t.grantsPremiumAccess ?? true
    })
  }, [settings])

  const change = e =>
    setForm(p => ({
      ...p,
      [e.target.name]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : Number(e.target.value) || e.target.value
    }))
  const submit = e => {
    e.preventDefault()
    onSave('/api/admin/platform-settings/trial', { trial: form })
  }

  const runAction = async (endpoint, setLoading) => {
    setLoading(true); setActionResult(null)
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setActionResult(data)
    } catch (e) {
      setActionResult({ success: false, message: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='ps-section' onSubmit={submit}>
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Trial &amp; Onboarding</h3>
          <p className='ps-section-desc'>
            When new property owners or artisans register, they start on the free tier.
            A trial period lets them access premium features before committing to a plan.
          </p>
        </div>
      </div>
      <Toggle
        label='Enable Trial Period'
        name='enabled'
        checked={form.enabled}
        onChange={e => setForm(p => ({ ...p, enabled: e.target.value }))}
        hint='When enabled, new users get a trial period with elevated access'
      />
      <Field
        label='Trial Duration (days)'
        name='durationDays'
        type='number'
        min={0}
        max={365}
        step={1}
        value={form.durationDays}
        onChange={change}
        hint='How many days the trial lasts after registration (0 = no trial)'
      />
      <Toggle
        label='Grant Full Premium Access During Trial'
        name='grantsPremiumAccess'
        checked={form.grantsPremiumAccess}
        onChange={e => setForm(p => ({ ...p, grantsPremiumAccess: e.target.value }))}
        hint='Give trial users pro-level features (unlimited listings, all premium features)'
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Trial Settings'}
        </button>
      </div>

      <div className='ps-enforcement-section'>
        <h4 className='ps-enforcement-title'>Plan Enforcement</h4>
        <p className='ps-enforcement-desc'>
          Use these actions to immediately apply plan limit changes to existing users.
          Properties exceeding the free plan listing limit will be set to inactive.
        </p>
        <div className='ps-action-btns'>
          <button
            type='button'
            className='ps-btn--secondary'
            disabled={expiring}
            onClick={() => runAction('/api/admin/platform-settings/expire-trials', setExpiring)}
          >
            {expiring ? 'Running…' : 'Expire Overdue Trials'}
          </button>
          <button
            type='button'
            className='ps-btn--warning'
            disabled={enforcing}
            onClick={() => {
              if (!window.confirm('This will reset ALL free-plan users to current free tier limits and deactivate excess listings. Continue?')) return
              runAction('/api/admin/platform-settings/enforce-plan-limits', setEnforcing)
            }}
          >
            {enforcing ? 'Running…' : 'Enforce Free Plan Limits Now'}
          </button>
        </div>
        {actionResult && (
          <div className={`ps-msg ps-msg--${actionResult.success ? 'success' : 'error'}`}>
            {actionResult.success ? '✓' : '✗'}{' '}
            {actionResult.success
              ? `Done — ${actionResult.processed ?? actionResult.usersUpdated ?? 0} users processed, ${actionResult.propertiesDeactivated ?? 0} properties deactivated.`
              : actionResult.message || 'Action failed'}
          </div>
        )}
      </div>
    </form>
  )
}

// ── Subscription Plans Tab ─────────────────────────────────────────────────────
function InspectionFeeTab ({ settings, onSave, saving }) {
  const pf = settings?.inspectionFee || {}
  const [form, setForm] = useState({
    enabled: pf.enabled ?? true,
    amount: pf.amount ?? 5000,
    currency: pf.currency ?? 'NGN',
    partialRefundPct: pf.partialRefundPct ?? 50,
    appliesTo: (pf.appliesTo || ['Apartment', 'House', 'Land', 'Commercial']).filter(
      (v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i
    ),
    description: pf.description ?? ''
  })

  useEffect(() => {
    const f = settings?.inspectionFee || {}
    setForm({
      enabled: f.enabled ?? true,
      amount: f.amount ?? 5000,
      currency: f.currency ?? 'NGN',
      partialRefundPct: f.partialRefundPct ?? 50,
      appliesTo: (f.appliesTo || ['Apartment', 'House', 'Land', 'Commercial']).filter(
        (v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i
      ),
      description: f.description ?? ''
    })
  }, [settings])

  const CATEGORIES = ['Apartment', 'House', 'Land', 'Commercial']

  const toggleCategory = cat => {
    setForm(p => ({
      ...p,
      appliesTo: p.appliesTo.includes(cat)
        ? p.appliesTo.filter(c => c !== cat)
        : [...p.appliesTo, cat]
    }))
  }

  return (
    <form className='ps-section' onSubmit={e => { e.preventDefault(); onSave('/api/admin/platform-settings/inspection-fee', { inspectionFee: form }) }}>
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <rect x='8' y='2' width='8' height='4' rx='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/><path d='M12 11h4M12 16h4M8 11h.01M8 16h.01'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Inspection Fee</h3>
          <p className='ps-section-desc'>
            Platform-wide viewing fee for non-hotel properties. Users pay this to confirm a viewing slot
            with the property owner. The fee is <strong>non-refundable</strong> by default; a partial
            refund can be issued if the owner cancels.
          </p>
        </div>
      </div>

      <Toggle
        label='Enable Inspection Fee'
        name='enabled'
        checked={form.enabled}
        onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))}
        hint='When disabled, the Schedule Inspection button is hidden on property pages'
      />

      <Field
        label='Inspection Fee Amount'
        name='amount'
        type='number'
        min={0}
        step={100}
        value={form.amount}
        onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
        hint='Amount in the selected currency (e.g. ₦5000)'
      />

      <Field
        label='Currency'
        name='currency'
        value={form.currency}
        onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
        hint='e.g. NGN, USD'
      />

      <Field
        label='Partial Refund % (owner cancellation)'
        name='partialRefundPct'
        type='number'
        min={0}
        max={100}
        step={5}
        value={form.partialRefundPct}
        onChange={e => setForm(p => ({ ...p, partialRefundPct: Number(e.target.value) }))}
        hint='% of the fee refunded when the property owner cancels (0 = fully non-refundable)'
      />

      <div className='ps-field'>
        <label className='ps-label'>Applies To (property categories)</label>
        <div className='ps-check-group'>
          {CATEGORIES.map(cat => (
            <label key={cat} className={`ps-check-label${form.appliesTo.includes(cat) ? ' ps-check-label--on' : ''}`}>
              <input type='checkbox' checked={form.appliesTo.includes(cat)} onChange={() => toggleCategory(cat)} />
              {cat}
            </label>
          ))}
        </div>
        <p className='ps-hint'>Inspection fee only shows on property pages matching these categories</p>
      </div>

      <div className='ps-field'>
        <label className='ps-label'>Description shown to users</label>
        <textarea
          rows={3}
          className='ps-textarea'
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder='Explain what the inspection fee covers…'
        />
      </div>

      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Inspection Fee Settings'}
        </button>
      </div>
    </form>
  )
}

const PLAN_FEATURE_OPTIONS = [
  'analytics',
  'priority_support',
  'featured_badge',
  'escrow_access',
  'document_upload',
  'api_access',
  'bulk_upload',
  'dedicated_manager'
]

function PlansTab ({ settings, onSave, saving }) {
  const [plans, setPlans] = useState(settings?.subscriptionPlans || [])
  const tierOptions = (settings?.listingTiers || []).map(t => t.name)

  useEffect(() => {
    setPlans(settings?.subscriptionPlans || [])
  }, [settings])

  const setField = (idx, key, val) =>
    setPlans(p => p.map((pl, i) => (i !== idx ? pl : { ...pl, [key]: val })))
  const toggleFeature = (idx, feat) =>
    setPlans(p =>
      p.map((pl, i) =>
        i !== idx
          ? pl
          : {
              ...pl,
              features: pl.features.includes(feat)
                ? pl.features.filter(f => f !== feat)
                : [...pl.features, feat]
            }
      )
    )

  const submit = e => {
    e.preventDefault()
    onSave('/api/admin/platform-settings/subscription-plans', {
      subscriptionPlans: plans
    })
  }

  return (
    <form className='ps-section' onSubmit={submit}>
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <rect x='1' y='4' width='22' height='16' rx='2' ry='2'/><line x1='1' y1='10' x2='23' y2='10'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Subscription Plans</h3>
          <p className='ps-section-desc'>
            Define subscription tiers for property owners and artisans. Set Paystack plan codes for automatic billing.
          </p>
        </div>
      </div>
      <div className='ps-plans-grid'>
        {plans.map((plan, idx) => (
          <div key={idx} className='ps-plan-card'>
            <div className='ps-plan-header'>
              <input
                className='ps-input ps-plan-name'
                value={plan.name}
                onChange={e => setField(idx, 'name', e.target.value)}
              />
              <span className='ps-plan-id'>{plan.id}</span>
            </div>
            <div className='ps-plan-fields'>
              <div className='ps-plan-field'>
                <label>Price (₦/month)</label>
                <input
                  type='number'
                  className='ps-input'
                  min={0}
                  value={plan.price}
                  onChange={e => setField(idx, 'price', Number(e.target.value))}
                />
              </div>
              <div className='ps-plan-field'>
                <label>Listing Limit (-1 = ∞)</label>
                <input
                  type='number'
                  className='ps-input'
                  value={plan.listingLimit}
                  onChange={e =>
                    setField(idx, 'listingLimit', Number(e.target.value))
                  }
                />
              </div>
              <div className='ps-plan-field'>
                <label>Media per Listing</label>
                <input
                  type='number'
                  className='ps-input'
                  min={1}
                  value={plan.mediaPerListing}
                  onChange={e =>
                    setField(idx, 'mediaPerListing', Number(e.target.value))
                  }
                />
              </div>
              <div className='ps-plan-field'>
                <label>AI Credits (-1 = ∞)</label>
                <input
                  type='number'
                  className='ps-input'
                  value={plan.aiCredits}
                  onChange={e =>
                    setField(idx, 'aiCredits', Number(e.target.value))
                  }
                />
              </div>
              <div className='ps-plan-field'>
                <label>Paystack Plan Code</label>
                <input
                  type='text'
                  className='ps-input'
                  placeholder='PLN_xxxxx'
                  value={plan.paystackPlanCode || ''}
                  onChange={e =>
                    setField(idx, 'paystackPlanCode', e.target.value)
                  }
                />
              </div>
              <div className='ps-plan-field'>
                <label>Listing Tier Granted</label>
                <select
                  className='ps-input'
                  value={plan.listingTier || 'Standard'}
                  onChange={e => setField(idx, 'listingTier', e.target.value)}
                >
                  {(tierOptions.length ? tierOptions : ['Standard', 'Gold', 'Diamond', 'Elite']).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='ps-plan-features'>
              <label>Features</label>
              <div className='ps-feat-chips'>
                {PLAN_FEATURE_OPTIONS.map(f => (
                  <button
                    key={f}
                    type='button'
                    className={`ps-feat-chip${
                      (plan.features || []).includes(f) ? ' on' : ''
                    }`}
                    onClick={() => toggleFeature(idx, f)}
                  >
                    {f.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Subscription Plans'}
        </button>
      </div>
    </form>
  )
}

// ── Email Settings Tab ────────────────────────────────────────────────────────
function EmailTab ({ settings, onSave, saving }) {
  const email = settings?.email || {}
  const [form, setForm] = useState({
    fromName: email.fromName ?? 'propnekt',
    fromAddress: email.fromAddress ?? 'noreply@propnekt.app',
    supportAddress: email.supportAddress ?? 'support@propnekt.app'
  })

  useEffect(() => {
    const e = settings?.email || {}
    setForm({
      fromName: e.fromName ?? 'propnekt',
      fromAddress: e.fromAddress ?? 'noreply@propnekt.app',
      supportAddress: e.supportAddress ?? 'support@propnekt.app'
    })
  }, [settings])

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/email', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Email Settings</h3>
          <p className='ps-section-desc'>Configure the sender identity for all platform transactional emails.</p>
        </div>
      </div>
      <Field
        label='Sender Name'
        name='fromName'
        value={form.fromName}
        onChange={change}
        hint='Displayed as the "From" name in all outgoing emails'
      />
      <Field
        label='Sender Address'
        name='fromAddress'
        value={form.fromAddress}
        onChange={change}
        hint='Reply-to address for platform emails (e.g. noreply@yourapp.com)'
      />
      <Field
        label='Support Address'
        name='supportAddress'
        value={form.supportAddress}
        onChange={change}
        hint='Where users can reach support (shown in email footers)'
      />
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Email Settings'}
        </button>
      </div>
    </form>
  )
}

// ── Account Verification Tab ──────────────────────────────────────────────────
function AcctVerifyTab ({ settings, onSave, saving }) {
  const av = settings?.accountVerification || {}
  const [form, setForm] = useState({
    requireKycForListing: av.requireKycForListing ?? true,
    requirePaymentSetupForListing: av.requirePaymentSetupForListing ?? true,
    requireKycForEscrow: av.requireKycForEscrow ?? true,
    requireKycLevel: av.requireKycLevel ?? 'basic'
  })

  useEffect(() => {
    const a = settings?.accountVerification || {}
    setForm({
      requireKycForListing: a.requireKycForListing ?? true,
      requirePaymentSetupForListing: a.requirePaymentSetupForListing ?? true,
      requireKycForEscrow: a.requireKycForEscrow ?? true,
      requireKycLevel: a.requireKycLevel ?? 'basic'
    })
  }, [settings])

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <form
      className='ps-section'
      onSubmit={e => {
        e.preventDefault()
        onSave('/api/admin/platform-settings/account-verification', form)
      }}
    >
      <div className='ps-section-header'>
        <div className='ps-section-icon' style={{ background: 'rgba(196,229,60,0.1)', color: '#C4E53C' }}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/>
          </svg>
        </div>
        <div>
          <h3 className='ps-section-title'>Account Verification Requirements</h3>
          <p className='ps-section-desc'>Define which actions require verified accounts and what verification level is needed.</p>
        </div>
      </div>
      <Toggle
        label='Require KYC to List Properties'
        name='requireKycForListing'
        checked={form.requireKycForListing}
        onChange={change}
        hint='Property owners must verify identity before listing goes live'
      />
      <Toggle
        label='Require Bank Setup to List Properties'
        name='requirePaymentSetupForListing'
        checked={form.requirePaymentSetupForListing}
        onChange={change}
        hint='Property owners must link a bank account before publishing'
      />
      <Toggle
        label='Require KYC to Access Escrow'
        name='requireKycForEscrow'
        checked={form.requireKycForEscrow}
        onChange={change}
        hint='Both parties must be KYC-verified before escrow funds are held'
      />
      <div className='ps-field'>
        <label className='ps-label'>Minimum KYC Level</label>
        <span className='ps-hint'>
          The level of identity verification required across the platform
        </span>
        <select
          name='requireKycLevel'
          value={form.requireKycLevel}
          onChange={change}
          className='ps-input'
        >
          <option value='basic'>Basic (ID only)</option>
          <option value='intermediate'>
            Intermediate (ID + address proof)
          </option>
          <option value='advanced'>
            Advanced (ID + address + income proof)
          </option>
        </select>
      </div>
      <div className='ps-save-bar'>
        <button type='submit' className='ps-btn--primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save Verification Settings'}
        </button>
      </div>
    </form>
  )
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function PlatformSettings () {
  const [activeTab, setActiveTab] = useState('branding')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('GET', '/api/admin/platform-settings')
      if (data.success) setSettings(data.settings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (path, body) => {
    setSaving(true)
    try {
      const data = await api('PATCH', path, body)
      if (data.success) {
        setSettings(data.settings)
        setToast({ type: 'success', msg: 'Settings saved successfully!' })
      } else {
        setToast({ type: 'error', msg: data.message || 'Failed to save' })
      }
    } catch (e) {
      setToast({ type: 'error', msg: 'Network error' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (loading)
    return (
      <div className='ps-loading'>
        <div className='ps-spinner' /> Loading settings…
      </div>
    )

  const groups = [...new Set(TABS.map(t => t.group))]

  return (
    <div className='platform-settings'>
      {toast && (
        <div className={`ps-toast ps-toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className='ps-layout'>
        {/* ── Sidebar nav ── */}
        <aside className='ps-sidenav'>
          <div className='ps-sidenav-head'>
            <div className='ps-sidenav-icon'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='12' cy='12' r='3'/><path d='M19.07 4.93a10 10 0 0 1 1.41 14.14M4.93 4.93A10 10 0 0 0 3.52 19.07'/>
                <path d='M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/>
              </svg>
            </div>
            <div>
              <div className='ps-sidenav-title'>Settings</div>
              <div className='ps-sidenav-sub'>Platform configuration</div>
            </div>
          </div>

          <nav className='ps-sidenav-nav'>
            {groups.map(group => (
              <div key={group} className='ps-sidenav-group'>
                <div className='ps-sidenav-group-label'>{group}</div>
                {TABS.filter(t => t.group === group).map(t => (
                  <button
                    key={t.id}
                    className={`ps-sidenav-item ${activeTab === t.id ? 'ps-sidenav-item--active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span className='ps-sidenav-item-icon'>{t.icon}</span>
                    <span className='ps-sidenav-item-label'>{t.label}</span>
                    {activeTab === t.id && <span className='ps-sidenav-item-dot' />}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className='ps-main'>
          <div className='ps-page-header'>
            <div className='ps-page-header-icon'>
              {TABS.find(t => t.id === activeTab)?.icon}
            </div>
            <div>
              <h2 className='ps-title'>{TABS.find(t => t.id === activeTab)?.label}</h2>
              <p className='ps-subtitle'>Configure global platform behaviour, fees, and feature flags.</p>
            </div>
          </div>

          <div className='ps-content'>
            {activeTab === 'branding'    && <BrandingTab     settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'fees'        && <FeesTab         settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'tiers'       && <TiersTab        settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'plans'       && <PlansTab        settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'trial'       && <TrialTab        settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'inspection'  && <InspectionFeeTab settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'kyc'         && <KycTab          settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'features'    && <FeaturesTab     settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'limits'      && <LimitsTab       settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'email'       && <EmailTab        settings={settings} onSave={handleSave} saving={saving} />}
            {activeTab === 'acctverify'  && <AcctVerifyTab   settings={settings} onSave={handleSave} saving={saving} />}
          </div>
        </div>
      </div>
    </div>
  )
}
