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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  return res.json()
}

const TABS = [
  { id: 'fees',    label: 'Platform Fees' },
  { id: 'tiers',   label: 'Listing Tiers' },
  { id: 'kyc',     label: 'KYC Requirements' },
  { id: 'features',label: 'Feature Flags' },
  { id: 'limits',  label: 'Limits' }
]

// ── Reusable input ────────────────────────────────────────────────────────────
function Field ({ label, name, value, onChange, type = 'text', min, max, step, hint }) {
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

  const change = e => setForm(p => ({ ...p, [e.target.name]: Number(e.target.value) }))

  return (
    <form className='ps-section' onSubmit={e => { e.preventDefault(); onSave('/api/admin/platform-settings/fees', form) }}>
      <h3 className='ps-section-title'>Platform Fees</h3>
      <Field label='Property Transaction Fee (%)' name='propertyTransactionPct' type='number' min={0} max={100} step={0.1} value={form.propertyTransactionPct} onChange={change} hint='Applied on every property sale/rental payment' />
      <Field label='Service Request Fee (%)' name='serviceRequestPct' type='number' min={0} max={100} step={0.1} value={form.serviceRequestPct} onChange={change} hint='Platform cut from artisan jobs' />
      <Field label='Escrow Release Fee (%)' name='escrowReleasePct' type='number' min={0} max={100} step={0.1} value={form.escrowReleasePct} onChange={change} hint='Charged when escrow funds are released' />
      <Field label='Withdrawal Flat Fee (₦)' name='withdrawalFlatFee' type='number' min={0} step={1} value={form.withdrawalFlatFee} onChange={change} hint='Fixed fee per withdrawal from wallet' />
      <button type='submit' className='ps-btn ps-btn--primary' disabled={saving}>{saving ? 'Saving…' : 'Save Fees'}</button>
    </form>
  )
}

// ── Listing Tiers Tab ─────────────────────────────────────────────────────────
function TiersTab ({ settings, onSave, saving }) {
  const [tiers, setTiers] = useState(settings?.listingTiers || [])

  useEffect(() => { setTiers(settings?.listingTiers || []) }, [settings])

  const change = (idx, field, val) =>
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: field === 'name' ? val : Number(val) } : t))

  return (
    <div className='ps-section'>
      <h3 className='ps-section-title'>Listing Tiers</h3>
      <p className='ps-hint'>Configure pricing and features for each listing tier.</p>
      <div className='ps-tiers-grid'>
        {tiers.map((tier, idx) => (
          <div key={tier.name || idx} className='ps-tier-card'>
            <div className='ps-tier-name'>{tier.name}</div>
            <Field label='Monthly Fee (₦)' name='monthlyFee' type='number' min={0} step={100} value={tier.monthlyFee ?? 0} onChange={e => change(idx, 'monthlyFee', e.target.value)} />
            <Field label='Max Listings' name='maxListings' type='number' min={1} step={1} value={tier.maxListings ?? 10} onChange={e => change(idx, 'maxListings', e.target.value)} />
            <Field label='Max Images per Listing' name='maxImages' type='number' min={1} step={1} value={tier.maxImages ?? 10} onChange={e => change(idx, 'maxImages', e.target.value)} />
            <Toggle label='Premier Badge' name='premierBadge' checked={!!tier.premierBadge} onChange={e => change(idx, 'premierBadge', e.target.value)} />
            <Toggle label='Featured on Homepage' name='featuredOnHomepage' checked={!!tier.featuredOnHomepage} onChange={e => change(idx, 'featuredOnHomepage', e.target.value)} />
          </div>
        ))}
      </div>
      <button className='ps-btn ps-btn--primary' disabled={saving} onClick={() => onSave('/api/admin/platform-settings/listing-tiers', { listingTiers: tiers })}>
        {saving ? 'Saving…' : 'Save Tiers'}
      </button>
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
    <form className='ps-section' onSubmit={e => { e.preventDefault(); onSave('/api/admin/platform-settings/kyc', form) }}>
      <h3 className='ps-section-title'>KYC Requirements</h3>
      <Toggle label='Require KYC to Place Bids' name='requireForBidding' checked={form.requireForBidding} onChange={change} hint='Artisans must have verified identity to bid on jobs' />
      <Toggle label='Require KYC to Apply for Properties' name='requireForApplications' checked={form.requireForApplications} onChange={change} hint='Tenants must be KYC-verified to apply' />
      <Toggle label='Require KYC for Payouts' name='requireForPayouts' checked={form.requireForPayouts} onChange={change} hint='All users must verify identity before withdrawing funds' />
      <Toggle label='Artisan Verification Required' name='artisanVerificationRequired' checked={form.artisanVerificationRequired} onChange={change} hint='Artisans must pass admin review before going live' />
      <button type='submit' className='ps-btn ps-btn--primary' disabled={saving}>{saving ? 'Saving…' : 'Save KYC Settings'}</button>
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
    <form className='ps-section' onSubmit={e => { e.preventDefault(); onSave('/api/admin/platform-settings/features', form) }}>
      <h3 className='ps-section-title'>Feature Flags</h3>
      <Toggle label='BNPL (Buy Now Pay Later)' name='bnplEnabled' checked={form.bnplEnabled} onChange={change} hint='Allow tenants/buyers to split payments into installments' />
      <Toggle label='Investment Platform' name='investmentsEnabled' checked={form.investmentsEnabled} onChange={change} hint='Enable fractional property investments (Phase 8)' />
      <Toggle label='AI Property Valuation' name='aiValuationEnabled' checked={form.aiValuationEnabled} onChange={change} hint='Allow AI-powered price suggestions on listings' />
      <Toggle label='Maintenance Mode' name='maintenanceMode' checked={form.maintenanceMode} onChange={change} hint='⚠️ Takes the platform offline for all non-admin users' />
      <Toggle label='New Registrations Open' name='registrationOpen' checked={form.registrationOpen} onChange={change} hint='Allow new users to sign up' />
      <button type='submit' className='ps-btn ps-btn--primary' disabled={saving}>{saving ? 'Saving…' : 'Save Feature Flags'}</button>
    </form>
  )
}

// ── Limits Tab ────────────────────────────────────────────────────────────────
function LimitsTab ({ settings, onSave, saving }) {
  const limits = settings?.limits || {}
  const [form, setForm] = useState({
    maxPropertiesPerOwner: limits.maxPropertiesPerOwner ?? 50,
    maxBidsPerRequest: limits.maxBidsPerRequest ?? 10,
    maxImagesPerProperty: limits.maxImagesPerProperty ?? 20
  })

  useEffect(() => {
    const l = settings?.limits || {}
    setForm({
      maxPropertiesPerOwner: l.maxPropertiesPerOwner ?? 50,
      maxBidsPerRequest: l.maxBidsPerRequest ?? 10,
      maxImagesPerProperty: l.maxImagesPerProperty ?? 20
    })
  }, [settings])

  const change = e => setForm(p => ({ ...p, [e.target.name]: Number(e.target.value) }))

  return (
    <form className='ps-section' onSubmit={e => { e.preventDefault(); onSave('/api/admin/platform-settings/limits', form) }}>
      <h3 className='ps-section-title'>Platform Limits</h3>
      <Field label='Max Properties per Owner' name='maxPropertiesPerOwner' type='number' min={1} step={1} value={form.maxPropertiesPerOwner} onChange={change} />
      <Field label='Max Bids per Service Request' name='maxBidsPerRequest' type='number' min={1} step={1} value={form.maxBidsPerRequest} onChange={change} />
      <Field label='Max Images per Property' name='maxImagesPerProperty' type='number' min={1} step={1} value={form.maxImagesPerProperty} onChange={change} />
      <button type='submit' className='ps-btn ps-btn--primary' disabled={saving}>{saving ? 'Saving…' : 'Save Limits'}</button>
    </form>
  )
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function PlatformSettings () {
  const [activeTab, setActiveTab] = useState('fees')
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

  useEffect(() => { load() }, [load])

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

  if (loading) return <div className='ps-loading'><div className='ps-spinner' /> Loading settings…</div>

  return (
    <div className='platform-settings'>
      <div className='ps-header'>
        <h2 className='ps-title'>Platform Settings</h2>
        <p className='ps-subtitle'>Configure global platform behaviour, fees, and feature flags.</p>
      </div>

      {toast && (
        <div className={`ps-toast ps-toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className='ps-tabs'>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ps-tab ${activeTab === t.id ? 'ps-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='ps-content'>
        {activeTab === 'fees'     && <FeesTab     settings={settings} onSave={handleSave} saving={saving} />}
        {activeTab === 'tiers'    && <TiersTab    settings={settings} onSave={handleSave} saving={saving} />}
        {activeTab === 'kyc'      && <KycTab      settings={settings} onSave={handleSave} saving={saving} />}
        {activeTab === 'features' && <FeaturesTab settings={settings} onSave={handleSave} saving={saving} />}
        {activeTab === 'limits'   && <LimitsTab   settings={settings} onSave={handleSave} saving={saving} />}
      </div>
    </div>
  )
}
