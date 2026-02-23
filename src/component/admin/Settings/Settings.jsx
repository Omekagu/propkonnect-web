import React, { useState } from 'react'
import './Settings.scss'

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: '◈' },
  { id: 'notifications', label: 'Notifications', icon: '◎' },
  { id: 'billing', label: 'Billing', icon: '▦' },
  { id: 'security', label: 'Security', icon: '⬡' },
  { id: 'preferences', label: 'Preferences', icon: '◉' }
]

// ─── Reusable field components ────────────────────────────────────────────────
function FieldGroup ({ label, hint, children }) {
  return (
    <div className='field-group'>
      <div className='field-group__label-wrap'>
        <label className='field-group__label'>{label}</label>
        {hint && <span className='field-group__hint'>{hint}</span>}
      </div>
      <div className='field-group__control'>{children}</div>
    </div>
  )
}

function Toggle ({ checked, onChange, label, description }) {
  return (
    <div className='toggle-row'>
      <div className='toggle-row__text'>
        <span className='toggle-row__label'>{label}</span>
        {description && <span className='toggle-row__desc'>{description}</span>}
      </div>
      <button
        role='switch'
        aria-checked={checked}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className='toggle__thumb' />
      </button>
    </div>
  )
}

function SectionBlock ({ title, description, children }) {
  return (
    <div className='section-block'>
      <div className='section-block__header'>
        <h3 className='section-block__title'>{title}</h3>
        {description && <p className='section-block__desc'>{description}</p>}
      </div>
      <div className='section-block__body'>{children}</div>
    </div>
  )
}

function SaveBar ({ dirty, onSave, onDiscard, saving }) {
  if (!dirty) return null
  return (
    <div className='save-bar'>
      <span className='save-bar__msg'>You have unsaved changes</span>
      <div className='save-bar__actions'>
        <button className='btn btn--ghost' onClick={onDiscard}>
          Discard
        </button>
        <button className='btn btn--primary' onClick={onSave} disabled={saving}>
          {saving ? <span className='spinner' /> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function ProfileTab ({ data, onChange }) {
  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Personal Information'
        description='Your name and contact details shown to tenants and agents.'
      >
        <div className='avatar-row'>
          <div className='avatar-large'>
            {data.firstName?.[0]}
            {data.lastName?.[0]}
          </div>
          <div className='avatar-row__actions'>
            <button className='btn btn--ghost btn--sm'>Upload photo</button>
            <button className='btn btn--danger-ghost btn--sm'>Remove</button>
          </div>
        </div>

        <div className='two-col'>
          <FieldGroup label='First Name'>
            <input
              className='input'
              value={data.firstName}
              onChange={e => onChange('firstName', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label='Last Name'>
            <input
              className='input'
              value={data.lastName}
              onChange={e => onChange('lastName', e.target.value)}
            />
          </FieldGroup>
        </div>

        <FieldGroup
          label='Email Address'
          hint='Used for login and tenant communication'
        >
          <input
            className='input'
            type='email'
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </FieldGroup>

        <div className='two-col'>
          <FieldGroup label='Phone Number'>
            <input
              className='input'
              type='tel'
              value={data.phone}
              onChange={e => onChange('phone', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label='Time Zone'>
            <select
              className='input input--select'
              value={data.timezone}
              onChange={e => onChange('timezone', e.target.value)}
            >
              <option value='America/New_York'>Eastern Time (ET)</option>
              <option value='America/Chicago'>Central Time (CT)</option>
              <option value='America/Denver'>Mountain Time (MT)</option>
              <option value='America/Los_Angeles'>Pacific Time (PT)</option>
              <option value='Europe/London'>GMT / London</option>
              <option value='Africa/Lagos'>West Africa Time (WAT)</option>
            </select>
          </FieldGroup>
        </div>
      </SectionBlock>

      <SectionBlock
        title='Business Details'
        description='Optional info used on lease agreements and invoices.'
      >
        <FieldGroup label='Company / Trading Name' hint='Optional'>
          <input
            className='input'
            value={data.company}
            onChange={e => onChange('company', e.target.value)}
            placeholder='e.g. King Properties LLC'
          />
        </FieldGroup>
        <div className='two-col'>
          <FieldGroup label='Tax ID / EIN' hint='Optional'>
            <input
              className='input'
              value={data.taxId}
              onChange={e => onChange('taxId', e.target.value)}
              placeholder='XX-XXXXXXX'
            />
          </FieldGroup>
          <FieldGroup label='License Number' hint='Optional'>
            <input
              className='input'
              value={data.licenseNo}
              onChange={e => onChange('licenseNo', e.target.value)}
            />
          </FieldGroup>
        </div>
        <FieldGroup label='Business Address'>
          <input
            className='input'
            value={data.businessAddress}
            onChange={e => onChange('businessAddress', e.target.value)}
            placeholder='Street, City, State, ZIP'
          />
        </FieldGroup>
      </SectionBlock>
    </div>
  )
}

function NotificationsTab ({ data, onChange }) {
  const channel = key => ({
    checked: data[key] ?? false,
    onChange: v => onChange(key, v)
  })

  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Rent & Payments'
        description='Alerts related to rent collection and financial events.'
      >
        <Toggle
          label='Rent received'
          description='Get notified when a tenant completes a payment.'
          {...channel('rentReceived')}
        />
        <Toggle
          label='Overdue rent'
          description='Alert when rent is 1+ days past due.'
          {...channel('rentOverdue')}
        />
        <Toggle
          label='Partial payment'
          description='Notified when only part of the rent is paid.'
          {...channel('rentPartial')}
        />
        <Toggle
          label='Payout processed'
          description='When your monthly payout is initiated.'
          {...channel('payoutProcessed')}
        />
      </SectionBlock>

      <SectionBlock
        title='Maintenance Requests'
        description='Stay on top of property repair activity.'
      >
        <Toggle
          label='New request submitted'
          description='A tenant submits a maintenance ticket.'
          {...channel('maintenanceNew')}
        />
        <Toggle
          label='Request status updated'
          description='Contractor updates the job status.'
          {...channel('maintenanceUpdated')}
        />
        <Toggle
          label='Request resolved'
          description='A ticket is marked complete.'
          {...channel('maintenanceResolved')}
        />
      </SectionBlock>

      <SectionBlock
        title='Leases & Tenants'
        description='Lease lifecycle and tenant-related events.'
      >
        <Toggle
          label='Lease expiring soon'
          description='30-day warning before a lease ends.'
          {...channel('leaseExpiringSoon')}
        />
        <Toggle
          label='Lease signed'
          description='When a new or renewed lease is executed.'
          {...channel('leaseSigned')}
        />
        <Toggle
          label='Tenant move-in / move-out'
          description='Move events on any of your properties.'
          {...channel('tenantMoveEvent')}
        />
        <Toggle
          label='New tenant application'
          description='Someone applies for a vacant unit.'
          {...channel('tenantApplication')}
        />
      </SectionBlock>

      <SectionBlock
        title='Delivery Channels'
        description='How you want to receive notifications.'
      >
        <Toggle label='Email notifications' {...channel('deliveryEmail')} />
        <Toggle label='SMS / Text messages' {...channel('deliverySms')} />
        <Toggle label='Push notifications (app)' {...channel('deliveryPush')} />
        <Toggle
          label='Weekly digest summary'
          description='One email per week summarising all activity.'
          {...channel('weeklyDigest')}
        />
      </SectionBlock>
    </div>
  )
}

function BillingTab ({ data, onChange }) {
  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Payout Account'
        description='Where collected rent gets deposited after platform fees.'
      >
        <div className='bank-card'>
          <div className='bank-card__icon'>🏦</div>
          <div className='bank-card__info'>
            <span className='bank-card__name'>
              {data.bankName || 'No account linked'}
            </span>
            {data.bankLast4 && (
              <span className='bank-card__number'>
                Account ending in •••• {data.bankLast4}
              </span>
            )}
          </div>
          <button className='btn btn--ghost btn--sm'>
            {data.bankName ? 'Update' : 'Link Account'}
          </button>
        </div>

        <FieldGroup label='Payout Schedule'>
          <select
            className='input input--select'
            value={data.payoutSchedule}
            onChange={e => onChange('payoutSchedule', e.target.value)}
          >
            <option value='instant'>Instant (2% fee)</option>
            <option value='daily'>Daily</option>
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly (1st of month)</option>
          </select>
        </FieldGroup>
      </SectionBlock>

      <SectionBlock
        title='Subscription Plan'
        description='Your current platform plan and billing cycle.'
      >
        <div className='plan-card plan-card--active'>
          <div className='plan-card__left'>
            <span className='plan-card__name'>Pro Owner</span>
            <span className='plan-card__features'>
              Up to 20 properties · Unlimited tenants · Priority support
            </span>
          </div>
          <div className='plan-card__right'>
            <span className='plan-card__price'>
              $49<span>/mo</span>
            </span>
            <button className='btn btn--ghost btn--sm'>Change Plan</button>
          </div>
        </div>

        <FieldGroup
          label='Billing Email'
          hint='Invoices and receipts are sent here'
        >
          <input
            className='input'
            type='email'
            value={data.billingEmail}
            onChange={e => onChange('billingEmail', e.target.value)}
          />
        </FieldGroup>
      </SectionBlock>

      <SectionBlock
        title='Platform Fees'
        description='Fee rates applied to rent collected through the platform.'
      >
        <div className='fee-table'>
          <div className='fee-row'>
            <span>Rent collection fee</span>
            <strong>2.5%</strong>
          </div>
          <div className='fee-row'>
            <span>Late payment processing</span>
            <strong>$2.50</strong>
          </div>
          <div className='fee-row'>
            <span>Instant payout fee</span>
            <strong>2.0%</strong>
          </div>
          <div className='fee-row fee-row--total'>
            <span>Your current monthly platform fee</span>
            <strong>$49.00</strong>
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}

function SecurityTab ({ data, onChange }) {
  const [showPwForm, setShowPwForm] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })

  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Password'
        description='Keep your account secure with a strong, unique password.'
      >
        {!showPwForm ? (
          <button
            className='btn btn--ghost'
            onClick={() => setShowPwForm(true)}
          >
            Change Password
          </button>
        ) : (
          <div className='pw-form'>
            <FieldGroup label='Current Password'>
              <input
                className='input'
                type='password'
                value={pw.current}
                onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label='New Password' hint='Min. 8 characters'>
              <input
                className='input'
                type='password'
                value={pw.next}
                onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label='Confirm New Password'>
              <input
                className='input'
                type='password'
                value={pw.confirm}
                onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
              />
            </FieldGroup>
            <div className='btn-row'>
              <button
                className='btn btn--ghost'
                onClick={() => setShowPwForm(false)}
              >
                Cancel
              </button>
              <button className='btn btn--primary'>Update Password</button>
            </div>
          </div>
        )}
      </SectionBlock>

      <SectionBlock
        title='Two-Factor Authentication'
        description='Add a second layer of protection to your account.'
      >
        <Toggle
          label='Enable 2FA via Authenticator App'
          description='Use Google Authenticator or Authy.'
          checked={data.twoFactorEnabled}
          onChange={v => onChange('twoFactorEnabled', v)}
        />
        <Toggle
          label='SMS backup code'
          description='Receive a code via text when 2FA app is unavailable.'
          checked={data.smsFallback}
          onChange={v => onChange('smsFallback', v)}
        />
      </SectionBlock>

      <SectionBlock
        title='Active Sessions'
        description='Devices currently signed into your account.'
      >
        <div className='session-list'>
          {[
            {
              device: 'MacBook Pro · Chrome',
              location: 'Lagos, NG',
              time: 'Active now',
              current: true
            },
            {
              device: 'iPhone 15 · Safari',
              location: 'Lagos, NG',
              time: '2 hours ago',
              current: false
            },
            {
              device: 'Windows PC · Edge',
              location: 'Abuja, NG',
              time: '3 days ago',
              current: false
            }
          ].map((s, i) => (
            <div key={i} className='session-row'>
              <div className='session-row__icon'>{s.current ? '💻' : '📱'}</div>
              <div className='session-row__info'>
                <span className='session-row__device'>
                  {s.device}{' '}
                  {s.current && (
                    <span className='current-badge'>This device</span>
                  )}
                </span>
                <span className='session-row__meta'>
                  {s.location} · {s.time}
                </span>
              </div>
              {!s.current && (
                <button className='btn btn--danger-ghost btn--sm'>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <button className='btn btn--danger-ghost'>
          Revoke All Other Sessions
        </button>
      </SectionBlock>

      <SectionBlock
        title='Danger Zone'
        description='Irreversible account actions.'
      >
        <div className='danger-zone'>
          <div className='danger-zone__item'>
            <div>
              <p className='danger-zone__label'>Deactivate account</p>
              <p className='danger-zone__desc'>
                Temporarily disable your account. Your data is preserved.
              </p>
            </div>
            <button className='btn btn--danger-ghost'>Deactivate</button>
          </div>
          <div className='danger-zone__item'>
            <div>
              <p className='danger-zone__label'>Delete account permanently</p>
              <p className='danger-zone__desc'>
                All properties, tenants, and transaction history will be erased.
              </p>
            </div>
            <button className='btn btn--danger'>Delete Account</button>
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}

function PreferencesTab ({ data, onChange }) {
  return (
    <div className='tab-panel'>
      <SectionBlock
        title='Display & Locale'
        description='Customize how the dashboard looks and formats data.'
      >
        <FieldGroup label='Currency'>
          <select
            className='input input--select'
            value={data.currency}
            onChange={e => onChange('currency', e.target.value)}
          >
            <option value='USD'>USD — US Dollar</option>
            <option value='GBP'>GBP — British Pound</option>
            <option value='EUR'>EUR — Euro</option>
            <option value='NGN'>NGN — Nigerian Naira</option>
            <option value='CAD'>CAD — Canadian Dollar</option>
          </select>
        </FieldGroup>

        <FieldGroup label='Date Format'>
          <select
            className='input input--select'
            value={data.dateFormat}
            onChange={e => onChange('dateFormat', e.target.value)}
          >
            <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
            <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
            <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
          </select>
        </FieldGroup>

        <FieldGroup label='Theme'>
          <div className='theme-picker'>
            {['dark', 'light', 'system'].map(t => (
              <button
                key={t}
                className={`theme-btn ${
                  data.theme === t ? 'theme-btn--active' : ''
                }`}
                onClick={() => onChange('theme', t)}
              >
                {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '⚙️'}
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </FieldGroup>
      </SectionBlock>

      <SectionBlock
        title='Dashboard Defaults'
        description='Set default views when you first open each section.'
      >
        <FieldGroup label='Default Property View'>
          <select
            className='input input--select'
            value={data.defaultPropertyView}
            onChange={e => onChange('defaultPropertyView', e.target.value)}
          >
            <option value='grid'>Grid</option>
            <option value='list'>List</option>
            <option value='map'>Map</option>
          </select>
        </FieldGroup>
        <Toggle
          label='Show vacant properties first'
          description='Pin un-tenanted units to the top of all lists.'
          checked={data.vacantFirst}
          onChange={v => onChange('vacantFirst', v)}
        />
        <Toggle
          label='Compact sidebar'
          description='Collapse navigation labels by default.'
          checked={data.compactSidebar}
          onChange={v => onChange('compactSidebar', v)}
        />
      </SectionBlock>

      <SectionBlock
        title='Privacy'
        description='Control what data is visible to tenants and agents.'
      >
        <Toggle
          label='Show phone number to tenants'
          checked={data.showPhone}
          onChange={v => onChange('showPhone', v)}
        />
        <Toggle
          label='Show company name on lease agreements'
          checked={data.showCompany}
          onChange={v => onChange('showCompany', v)}
        />
        <Toggle
          label='Allow agents to contact me directly'
          checked={data.allowAgentContact}
          onChange={v => onChange('allowAgentContact', v)}
        />
      </SectionBlock>
    </div>
  )
}

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL = {
  // profile
  firstName: 'Marcus',
  lastName: 'King',
  email: 'marcus@kingproperties.io',
  phone: '+234 801 234 5678',
  timezone: 'Africa/Lagos',
  company: 'King Properties LLC',
  taxId: '',
  licenseNo: '',
  businessAddress: '',
  // notifications
  rentReceived: true,
  rentOverdue: true,
  rentPartial: false,
  payoutProcessed: true,
  maintenanceNew: true,
  maintenanceUpdated: false,
  maintenanceResolved: true,
  leaseExpiringSoon: true,
  leaseSigned: true,
  tenantMoveEvent: false,
  tenantApplication: true,
  deliveryEmail: true,
  deliverySms: false,
  deliveryPush: true,
  weeklyDigest: true,
  // billing
  bankName: 'First Bank Nigeria',
  bankLast4: '4821',
  payoutSchedule: 'monthly',
  billingEmail: 'billing@kingproperties.io',
  // security
  twoFactorEnabled: false,
  smsFallback: false,
  // preferences
  currency: 'NGN',
  dateFormat: 'DD/MM/YYYY',
  theme: 'dark',
  defaultPropertyView: 'grid',
  vacantFirst: false,
  compactSidebar: false,
  showPhone: false,
  showCompany: true,
  allowAgentContact: true
}

// ─── Root Settings component ──────────────────────────────────────────────────
export default function Settings () {
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState(INITIAL)
  const [savedData, setSavedData] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const dirty = JSON.stringify(formData) !== JSON.stringify(savedData)

  function handleChange (key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave () {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900)) // simulate API
    setSavedData(formData)
    setSaving(false)
    setToast('Settings saved successfully')
    setTimeout(() => setToast(null), 3000)
  }

  function handleDiscard () {
    setFormData(savedData)
  }

  const tabProps = { data: formData, onChange: handleChange }

  return (
    <div className='settings'>
      {/* Header */}
      <div className='settings__header'>
        <div>
          <h1 className='settings__title'>Settings</h1>
          <p className='settings__subtitle'>
            Manage your account, preferences, and security
          </p>
        </div>
      </div>

      <div className='settings__layout'>
        {/* Sidebar nav */}
        <nav className='settings__nav'>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`settings-nav-item ${
                activeTab === tab.id ? 'settings-nav-item--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className='settings-nav-item__icon'>{tab.icon}</span>
              <span className='settings-nav-item__label'>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className='settings__panel'>
          {activeTab === 'profile' && <ProfileTab {...tabProps} />}
          {activeTab === 'notifications' && <NotificationsTab {...tabProps} />}
          {activeTab === 'billing' && <BillingTab {...tabProps} />}
          {activeTab === 'security' && <SecurityTab {...tabProps} />}
          {activeTab === 'preferences' && <PreferencesTab {...tabProps} />}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={saving}
      />

      {toast && <div className='toast'>{toast}</div>}
    </div>
  )
}
