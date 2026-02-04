'use client'

import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  Home,
  Users,
  TrendingUp,
  Building2,
  MapPin,
  DollarSign,
  Shield,
  Database,
  Code,
  Wrench,
  MessageSquare,
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Menu,
  Bell,
  User as UserIcon
} from 'lucide-react'
import { useReviews } from '@/context/ReviewsProvider'

const PropConnectPlatform = () => {
  const {
    currentSection,
    setCurrentSection,
    reviews,
    avgRating,
    submitReview,
    loading
  } = useReviews()

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    rating: 0,
    comment: ''
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showReviewsPanel, setShowReviewsPanel] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections = [
    { id: 'overview', name: 'Platform Overview', icon: Home },
    { id: 'modules', name: 'Core Modules', icon: Building2 },
    { id: 'userflows', name: 'User Flows', icon: Users },
    { id: 'architecture', name: 'Technical Architecture', icon: Code },
    { id: 'database', name: 'Database Model', icon: Database },
    { id: 'revenue', name: 'Revenue Model', icon: DollarSign },
    { id: 'financials', name: 'Financial Projections', icon: TrendingUp },
    { id: 'artisans', name: 'Artisans Marketplace', icon: Wrench },
    { id: 'security', name: 'Security & Compliance', icon: Shield },
    { id: 'roadmap', name: 'Implementation', icon: MapPin }
  ]

  const handleSectionChange = sectionId => {
    setCurrentSection(sectionId)
    setShowReviewsPanel(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFeedback = type => {
    setFeedbackType(type)
    setShowFeedbackModal(true)
  }

  const submitFeedbackReview = async () => {
    if (!feedbackData.rating || feedbackData.rating < 1) {
      showNotificationMessage('Please provide a rating', 'error')
      return
    }

    try {
      await submitReview({
        name: feedbackData.name,
        email: feedbackData.email,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        metadata: {
          feedbackType,
          timestamp: new Date().toISOString()
        }
      })

      showNotificationMessage(
        'Thank you! Your review has been submitted.',
        'success'
      )
      setShowFeedbackModal(false)
      setFeedbackData({ name: '', email: '', rating: 0, comment: '' })
    } catch (error) {
      showNotificationMessage(
        'Failed to submit review. Please try again.',
        error
      )
    }
  }

  const rateSection = async rating => {
    try {
      await submitReview({
        rating,
        metadata: {
          quickRate: true,
          timestamp: new Date().toISOString()
        }
      })
      showNotificationMessage('Rating submitted successfully!', 'success')
    } catch (error) {
      showNotificationMessage('Failed to submit rating.', error)
    }
  }

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  // Data arrays from your original component
  const modules = [
    {
      title: 'Property Rental Marketplace',
      icon: '🏘️',
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Landlord-Tenant connection with AI matching',
        'Smart property listing management',
        'Automated rent collection & reminders',
        'Advanced tenant verification & KYC',
        'Digital lease agreements with e-signatures',
        'Real-time maintenance request system',
        'Flexible payment scheduling',
        'AI-powered dispute resolution'
      ],
      metrics: { users: '10K+', satisfaction: '4.8/5', automation: '95%' }
    },
    {
      title: 'Property Sales Platform',
      icon: '🏗️',
      color: 'from-emerald-500 to-teal-500',
      features: [
        'Comprehensive land & building listings',
        'AI-powered buyer-seller matching',
        'Immersive 360° virtual property tours',
        'Secure document management system',
        'Smart price negotiation tools',
        'Integrated escrow services',
        'Legal documentation automation',
        'Blockchain-based title verification'
      ],
      metrics: { listings: '5K+', avgPrice: '$120K', closureRate: '68%' }
    },
    {
      title: 'Hotel Booking System',
      icon: '🏨',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Real-time availability tracking',
        'Multi-property management dashboard',
        'Dynamic pricing & revenue optimization',
        'Seamless booking management',
        'Multi-gateway payment processing',
        'Guest reviews & ratings system',
        'Channel manager integration',
        'Advanced revenue analytics'
      ],
      metrics: { bookings: '50K+', occupancy: '82%', revenue: '$15M' }
    },
    {
      title: 'Investment Platform',
      icon: '💰',
      color: 'from-orange-500 to-red-500',
      features: [
        'Fractional property ownership',
        'Real-time portfolio tracking',
        'Advanced ROI calculator',
        'Automated income distribution',
        'Comprehensive investment analytics',
        'Secondary market trading',
        'Enhanced KYC & accreditation',
        'Digital tax documentation'
      ],
      metrics: { aum: '$200M', investors: '3K+', avgReturn: '12.5%' }
    },
    {
      title: 'Rent Payment Solution',
      icon: '💳',
      color: 'from-indigo-500 to-blue-500',
      features: [
        'Multiple payment methods',
        'Flexible installment plans',
        'One-click auto-debit setup',
        'Smart payment reminders',
        'Comprehensive transaction history',
        'Instant receipt generation',
        'Automated late fee calculation',
        'Predictive payment analytics'
      ],
      metrics: { transactions: '100K+', onTime: '94%', volume: '$50M' }
    },
    {
      title: 'Lease Management',
      icon: '📋',
      color: 'from-pink-500 to-rose-500',
      features: [
        'Intelligent lease tracking & renewals',
        'Digital signatures with DocuSign',
        'Cloud-based document storage',
        'Automated rent escalation',
        'Notice period tracking',
        'Built-in dispute resolution',
        'Compliance monitoring dashboard',
        'Smart notification system'
      ],
      metrics: { leases: '8K+', renewalRate: '76%', disputes: '< 2%' }
    },
    {
      title: 'Artisans Marketplace',
      icon: '🔧',
      color: 'from-amber-500 to-yellow-500',
      features: [
        'Verified service provider profiles',
        'Job posting & bidding system',
        'Rich portfolio showcase',
        'Comprehensive ratings & reviews',
        'Secure payment escrow',
        'Property purchase financing',
        'Micro-loan access',
        'Automated credential verification'
      ],
      metrics: { artisans: '2.5K+', jobs: '15K+', satisfaction: '4.7/5' }
    }
  ]

  const technicalArchitecture = {
    frontend: {
      web: [
        'React 18 / Next.js 14',
        'TypeScript',
        'Tailwind CSS',
        'Redux Toolkit',
        'React Query'
      ],
      mobile: ['React Native', 'TypeScript', 'Native Base', 'Redux Toolkit']
    },
    backend: {
      api: [
        'Node.js 20 LTS',
        'Express / Fastify',
        'TypeScript',
        'GraphQL (Apollo)',
        'REST APIs'
      ],
      services: [
        'Microservices Architecture',
        'Domain-Driven Design',
        'Event-Driven Architecture'
      ]
    },
    database: {
      primary: ['PostgreSQL 16', 'CockroachDB (optional for global)'],
      cache: ['Redis 7', 'Redis Cluster'],
      search: ['Elasticsearch 8 / OpenSearch', 'Geospatial indexing'],
      logs: ['MongoDB (optional)', 'Time-series data']
    },
    messaging: {
      eventBus: ['Apache Kafka / AWS MSK', 'Event Sourcing patterns'],
      realtime: ['WebSockets', 'Server-Sent Events']
    },
    payments: {
      gateways: [
        'Stripe Connect',
        'Paystack',
        'Flutterwave',
        'Local processors'
      ],
      banking: ['Plaid / TrueLayer', 'Bank account verification'],
      crypto: ['Optional: Web3 wallet integration']
    },
    storage: {
      objects: ['AWS S3 / Compatible', 'CloudFront CDN'],
      documents: ['Encrypted document storage', 'Version control']
    },
    infrastructure: {
      orchestration: [
        'Kubernetes (EKS/GKE/AKS)',
        'Helm Charts',
        'Auto-scaling'
      ],
      cicd: ['GitHub Actions', 'ArgoCD', 'Docker'],
      monitoring: ['Prometheus', 'Grafana', 'Jaeger (tracing)', 'ELK Stack'],
      security: [
        'WAF',
        'DDoS protection',
        'Vault (secrets)',
        'Certificate management'
      ]
    },
    integrations: {
      kyc: ['Jumio', 'Onfido', 'Smile Identity'],
      maps: ['Google Maps API', 'Mapbox'],
      communication: ['Twilio (SMS)', 'SendGrid (Email)', 'OneSignal (Push)'],
      legal: ['DocuSign', 'E-signature APIs']
    }
  }

  const databaseEntities = [
    {
      table: 'users',
      description: 'Core user accounts with authentication',
      columns: [
        'id (uuid, PK)',
        'email (unique)',
        'password_hash',
        'role (enum)',
        'kyc_status',
        'created_at',
        'updated_at'
      ]
    },
    {
      table: 'profiles',
      description: 'Extended user profile information',
      columns: [
        'user_id (FK)',
        'display_name',
        'phone',
        'address (jsonb)',
        'avatar_url',
        'bio',
        'is_verified'
      ]
    },
    {
      table: 'properties',
      description: 'Property listings (sale, rent, hotel)',
      columns: [
        'id (uuid, PK)',
        'owner_id (FK)',
        'type (enum)',
        'title',
        'description',
        'price',
        'status',
        'metadata (jsonb)'
      ]
    },
    {
      table: 'leases',
      description: 'Long-term rental agreements',
      columns: [
        'id (uuid, PK)',
        'tenant_id (FK)',
        'property_id (FK)',
        'start_date',
        'end_date',
        'rent_amount',
        'status'
      ]
    },
    {
      table: 'payments',
      description: 'All financial transactions',
      columns: [
        'id (uuid, PK)',
        'type (enum)',
        'amount',
        'currency',
        'payer_id (FK)',
        'payee_id (FK)',
        'status'
      ]
    },
    {
      table: 'investments',
      description: 'Investment positions',
      columns: [
        'id (uuid, PK)',
        'offering_id (FK)',
        'investor_id (FK)',
        'amount',
        'units',
        'status'
      ]
    },
    {
      table: 'artisan_profiles',
      description: 'Artisan service provider details',
      columns: [
        'artisan_id (FK, PK)',
        'trades (text[])',
        'certifications (jsonb)',
        'rating',
        'verified_documents'
      ]
    },
    {
      table: 'reviews',
      description: 'Platform section reviews',
      columns: [
        'id (uuid, PK)',
        'section',
        'name',
        'email',
        'rating (1-5)',
        'comment',
        'metadata (jsonb)',
        'created_at'
      ]
    }
  ]

  const revenueStreams = [
    {
      stream: 'Transaction Commissions',
      percentage: '40%',
      models: [
        'Property sale commission (1-3% of sale price)',
        'Rental listing fees (3-10% of monthly rent)',
        'Booking commission (10-15% per reservation)',
        'Investment transaction fees (0.5-2% of investment)',
        'Artisan job commission (10-20% per job)'
      ],
      projectedY1: '$2.2M'
    },
    {
      stream: 'Subscription Plans',
      percentage: '30%',
      models: [
        'Landlord premium listings ($50-200/month)',
        'Property manager packages ($200-500/month)',
        'Investor dashboard access ($100-300/month)',
        'Hotel business accounts ($300-1000/month)',
        'Artisan premium profiles ($30-100/month)'
      ],
      projectedY1: '$1.65M'
    },
    {
      stream: 'Service Fees',
      percentage: '15%',
      models: [
        'Tenant verification (₦2,000-5,000 / $2-5)',
        'Background checks ($10-30 per check)',
        'Property valuation services ($100-500)',
        'Legal documentation fees ($50-200)',
        'Inspection services ($75-250)'
      ],
      projectedY1: '$825K'
    },
    {
      stream: 'Payment Processing',
      percentage: '8%',
      models: [
        'Transaction processing fees (1-2% per transaction)',
        'Installment plan charges (2-5% of total)',
        'International payment markup (2-3%)',
        'Instant withdrawal fees (1% per withdrawal)',
        'Currency conversion fees (1-2%)'
      ],
      projectedY1: '$440K'
    },
    {
      stream: 'Premium Features',
      percentage: '5%',
      models: [
        'Featured property listings ($50-500/listing)',
        'Priority customer support ($50/month)',
        'Advanced analytics access ($100-300/month)',
        'API access for integrations ($500-2000/month)',
        'White-label solutions (custom pricing)'
      ],
      projectedY1: '$275K'
    },
    {
      stream: 'Partnerships & Advertising',
      percentage: '2%',
      models: [
        'Property developer promotions',
        'Financial institution partnerships',
        'Insurance product referrals (10-20% commission)',
        'Home service provider ads',
        'Mortgage provider referrals (0.5-1% of loan)'
      ],
      projectedY1: '$110K'
    }
  ]

  const financialProjections = [
    {
      year: 2026,
      users: '10K',
      gmv: '$200M',
      revenue: '$5.5M',
      cogs: '$1.65M',
      opex: '$6.0M',
      ebitda: '-$1.0M',
      margin: '-18%',
      color: 'bg-red-50 text-red-800'
    },
    {
      year: 2027,
      users: '30K',
      gmv: '$600M',
      revenue: '$18M',
      cogs: '$5.4M',
      opex: '$9.0M',
      ebitda: '$3.6M',
      margin: '20%',
      color: 'bg-yellow-50 text-yellow-800'
    },
    {
      year: 2028,
      users: '90K',
      gmv: '$1.5B',
      revenue: '$45M',
      cogs: '$13.5M',
      opex: '$12M',
      ebitda: '$18M',
      margin: '40%',
      color: 'bg-green-50 text-green-800'
    },
    {
      year: 2029,
      users: '200K',
      gmv: '$3.0B',
      revenue: '$95M',
      cogs: '$28.5M',
      opex: '$20M',
      ebitda: '$60M',
      margin: '63%',
      color: 'bg-emerald-50 text-emerald-800'
    },
    {
      year: 2030,
      users: '400K',
      gmv: '$5.0B',
      revenue: '$160M',
      cogs: '$48M',
      opex: '$28M',
      ebitda: '$110M',
      margin: '69%',
      color: 'bg-blue-50 text-blue-800'
    }
  ]

  const implementationPhases = [
    {
      phase: 'Phase 1: Foundation',
      timeline: '8 weeks',
      budget: '$150K',
      deliverables: [
        'Platform architecture & infrastructure setup',
        'User authentication system (OAuth2, MFA)',
        'Basic property listing module',
        'Payment gateway integration (Stripe)',
        'Admin dashboard (basic operations)',
        'Database schema implementation',
        'CI/CD pipeline setup'
      ],
      team: '6 engineers + 1 PM'
    },
    {
      phase: 'Phase 2: Core Features',
      timeline: '8 weeks',
      budget: '$200K',
      deliverables: [
        'Complete rental marketplace',
        'Property sales platform',
        'Tenant verification system (KYC)',
        'Rent payment & scheduling solution',
        'Search service with geospatial',
        'Mobile app (MVP - iOS/Android)',
        'Escrow integration'
      ],
      team: '8 engineers + 2 designers + 1 PM'
    },
    {
      phase: 'Phase 3: Expansion',
      timeline: '8 weeks',
      budget: '$250K',
      deliverables: [
        'Hotel booking system',
        'Investment platform (fractional ownership)',
        'Lease management tools',
        'Advanced analytics dashboard',
        'Integration APIs (public)',
        'Artisan marketplace foundation',
        'Document management system'
      ],
      team: '10 engineers + 2 designers + 1 PM'
    },
    {
      phase: 'Phase 4: Optimization & Launch',
      timeline: '8 weeks',
      budget: '$200K',
      deliverables: [
        'AI-powered property recommendations',
        'Virtual property tours (360°)',
        'Artisan marketplace expansion',
        'Partner integrations (banks, KYC providers)',
        'Performance optimization',
        'Security audits & penetration testing',
        'Beta testing & public launch'
      ],
      team: '10 engineers + 3 designers + 1 PM + QA team'
    }
  ]

  const SectionRating = () => (
    <div className='flex flex-col items-center justify-center space-y-4 py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-inner mt-8'>
      <span className='text-gray-700 font-semibold text-lg'>
        How would you rate this section?
      </span>
      <div className='flex space-x-3'>
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            onClick={() => rateSection(rating)}
            className='group relative transition-all transform hover:scale-110 active:scale-95'
          >
            <Star
              className='w-10 h-10 text-gray-300 group-hover:text-yellow-400 transition-colors duration-200'
              fill='none'
            />
            <span className='absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </button>
        ))}
      </div>
      <p className='text-sm text-gray-500 mt-4'>
        Your feedback helps us improve
      </p>
    </div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Animated Background */}
      <div className='fixed inset-0 opacity-5 pointer-events-none'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.5) 2%, transparent 0%),
                           radial-gradient(circle at 75px 75px, rgba(139, 92, 246, 0.5) 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
            : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-20'>
            <div className='flex items-center space-x-4'>
              <div
                className={`relative ${
                  isScrolled ? 'w-12 h-12' : 'w-14 h-14'
                } transition-all`}
              >
                <div className='absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl rotate-6 animate-pulse' />
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl'>
                  <Building2
                    className={`${
                      isScrolled ? 'w-6 h-6' : 'w-8 h-8'
                    } text-white transition-all`}
                  />
                </div>
              </div>
              <div>
                <h1
                  className={`font-bold transition-all ${
                    isScrolled
                      ? 'text-2xl text-gray-900'
                      : 'text-3xl text-white'
                  }`}
                >
                  PropKonnect
                </h1>
                <p
                  className={`text-sm transition-all ${
                    isScrolled ? 'text-gray-600' : 'text-blue-100'
                  }`}
                >
                  Real Estate Ecosystem
                </p>
              </div>
            </div>

            <div className='hidden md:flex items-center space-x-3'>
              <button
                onClick={() => setShowReviewsPanel(!showReviewsPanel)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                  isScrolled
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <Star size={18} />
                <span>Reviews</span>
                {avgRating && (
                  <span className='text-sm font-bold'>
                    ({avgRating.toFixed(1)})
                  </span>
                )}
              </button>
              <button
                onClick={() => handleFeedback('suggestion')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                  isScrolled
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <MessageSquare size={18} />
                <span>Feedback</span>
              </button>
              <button
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isScrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <Bell size={20} />
              </button>
              <button
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isScrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <UserIcon size={20} />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm'
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='sticky top-20 z-40 bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex overflow-x-auto gap-2 py-3 scrollbar-hide'>
            {sections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-sm ${
                    currentSection === section.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className='text-sm font-semibold'>{section.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Floating Feedback Button */}
      <button
        onClick={() => handleFeedback('suggestion')}
        className='fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 z-50 group'
      >
        <MessageSquare className='w-6 h-6' />
        <span className='absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'>
          Share Your Feedback
        </span>
      </button>

      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed top-24 right-8 ${
            notificationType === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          } text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 animate-slideIn`}
        >
          {notificationType === 'success' ? (
            <CheckCircle2 className='w-6 h-6' />
          ) : (
            <AlertCircle className='w-6 h-6' />
          )}
          <span className='font-semibold'>{notificationMessage}</span>
        </div>
      )}

      {/* Reviews Panel */}
      {showReviewsPanel && (
        <div className='fixed right-0 top-40 bottom-0 w-96 bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-200 animate-slideInRight'>
          <div className='sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold text-white'>Section Reviews</h3>
              {avgRating && (
                <div className='flex items-center space-x-2 mt-2'>
                  <Star
                    className='w-5 h-5 text-yellow-300'
                    fill='currentColor'
                  />
                  <span className='text-white font-semibold'>
                    {avgRating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReviewsPanel(false)}
              className='text-white hover:bg-white/20 p-2 rounded-xl transition-colors'
            >
              <X size={24} />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            {loading ? (
              <div className='text-center py-12 text-gray-500'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
                Loading reviews...
              </div>
            ) : reviews.length > 0 ? (
              reviews.map(review => (
                <div
                  key={review._id}
                  className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {review.name || 'Anonymous'}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex items-center space-x-1'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }
                          fill={star <= review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <Star className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                <p className='font-medium'>No reviews yet</p>
                <p className='text-sm mt-2'>Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-3xl flex items-center justify-between'>
              <h3 className='text-2xl font-bold text-white flex items-center space-x-3'>
                <MessageSquare className='w-8 h-8' />
                <span>Share Your Feedback</span>
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className='text-white hover:bg-white/20 p-2 rounded-xl transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='p-8'>
              <div className='flex space-x-4 mb-6'>
                {[
                  { type: 'suggestion', label: 'Suggestion', icon: '💡' },
                  { type: 'correction', label: 'Correction', icon: '✏️' },
                  { type: 'question', label: 'Question', icon: '❓' },
                  { type: 'praise', label: 'Praise', icon: '👏' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setFeedbackType(item.type)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      feedbackType === item.type
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className='text-2xl mb-1'>{item.icon}</div>
                    <div className='text-sm'>{item.label}</div>
                  </button>
                ))}
              </div>

              <div className='space-y-4 mb-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Name (optional)
                  </label>
                  <input
                    type='text'
                    value={feedbackData.name}
                    onChange={e =>
                      setFeedbackData({ ...feedbackData, name: e.target.value })
                    }
                    placeholder='Your name'
                    className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email (optional)
                  </label>
                  <input
                    type='email'
                    value={feedbackData.email}
                    onChange={e =>
                      setFeedbackData({
                        ...feedbackData,
                        email: e.target.value
                      })
                    }
                    placeholder='your.email@example.com'
                    className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Rating *
                  </label>
                  <div className='flex space-x-2'>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() =>
                          setFeedbackData({ ...feedbackData, rating })
                        }
                        className='transition-all transform hover:scale-110'
                      >
                        <Star
                          className={`w-10 h-10 ${
                            rating <= feedbackData.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill={
                            rating <= feedbackData.rating
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Comment (optional)
                  </label>
                  <textarea
                    value={feedbackData.comment}
                    onChange={e =>
                      setFeedbackData({
                        ...feedbackData,
                        comment: e.target.value
                      })
                    }
                    placeholder='Share your thoughts...'
                    rows={4}
                    className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none'
                  />
                </div>
              </div>

              <button
                onClick={submitFeedbackReview}
                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]'
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Continuing in separate sections */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Due to character limit, I'll create sections as separate files */}
        {/* Overview Section */}

        {currentSection === 'overview' && (
          <div className='space-y-8 animate-fadeIn'>
            {/* Hero Section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-12 text-white'>
              <div className='absolute inset-0 bg-black/10' />
              <div className='relative z-10'>
                <div className='flex items-center space-x-3 mb-6'>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold'>
                    Africa
                  </span>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold'>
                    🇳🇬 Starting with Nigeria
                  </span>
                </div>
                <h2 className='text-2xl font-bold mb-4 leading-tight'>
                  Transforming Real Estate & Livelihoods in Africa
                </h2>
                <p className='text-xl text-blue-100 mb-8 max-w-4xl leading-relaxed'>
                  PropKonnect bridges the gap between property owners, seekers,
                  investors, and skilled artisans while solving critical
                  challenges in trust, access, financing, and wealth creation
                  across African markets.
                </p>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center'>
                    <div className='text-3xl font-bold'>220M+</div>
                    <div className='text-sm text-blue-100'>
                      Nigeria Population
                    </div>
                  </div>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center'>
                    <div className='text-3xl font-bold'>60%</div>
                    <div className='text-sm text-blue-100'>
                      Mobile Money Users
                    </div>
                  </div>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center'>
                    <div className='text-3xl font-bold'>$3-8B</div>
                    <div className='text-sm text-blue-100'>
                      Market Opportunity
                    </div>
                  </div>
                  <div className='bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center'>
                    <div className='text-3xl font-bold'>15M+</div>
                    <div className='text-sm text-blue-100'>
                      Skilled Artisans
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real African Problems & Solutions */}
            <div className='grid md:grid-cols-3 gap-8'>
              {/* Problem 1: Trust & Fraud */}
              <div className='bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-600 hover:shadow-2xl transition-all'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-red-100 p-3 rounded-lg'>
                    <AlertCircle className='w-8 h-8 text-red-600' />
                  </div>
                  <h3 className='font-bold text-2xl text-red-900'>
                    Trust Crisis
                  </h3>
                </div>

                <div className='mb-6'>
                  <h4 className='font-semibold text-gray-800 mb-3'>
                    Real Problems:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-2'>•</span>
                      <span>
                        <strong>Fake landlords</strong> collect deposits and
                        disappear (₦50B+ annual losses)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-2'>•</span>
                      <span>
                        <strong>Title fraud</strong> due to manual documentation
                        and weak verification
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-2'>•</span>
                      <span>
                        <strong>Fake property listings</strong>{' '}
                        {"waste tenants'"}
                        time and money
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-2'>•</span>
                      <span>
                        <strong>Agent exploitation</strong> with hidden fees and
                        false promises
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-2'>•</span>
                      <span>
                        <strong>No recourse</strong> when things go wrong -
                        legal system is slow
                      </span>
                    </li>
                  </ul>
                </div>

                <div className='bg-green-50 rounded-xl p-4 border-2 border-green-200'>
                  <h4 className='font-semibold text-green-900 mb-3'>
                    Our Solution:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>BVN/NIN verification</strong> for all users
                        (government-backed identity)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Property ownership verification</strong> via
                        Land Registry integration
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Blockchain-backed certificates</strong> for
                        immutable records
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Escrow protection</strong> - money only released
                        after verification
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Rating system</strong> with verified reviews
                        from real transactions
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Problem 2: Financial Access */}
              <div className='bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-600 hover:shadow-2xl transition-all'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-orange-100 p-3 rounded-lg'>
                    <DollarSign className='w-8 h-8 text-orange-600' />
                  </div>
                  <h3 className='font-bold text-2xl text-orange-900'>
                    Financial Barriers
                  </h3>
                </div>

                <div className='mb-6'>
                  <h4 className='font-semibold text-gray-800 mb-3'>
                    Real Problems:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>Annual rent upfront</strong> - tenants need 1-2
                        years rent at once
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>Agency fees</strong> add 10-20% on top of rent
                        (exploitative)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>No installment options</strong> -{' '}
                        {`banks don't`}
                        offer rent loans
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>{`Artisans can't access mortgages`}</strong> -
                        informal income not recognized
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>Investment barriers</strong> - property
                        ownership only for the wealthy
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-orange-500 mr-2'>•</span>
                      <span>
                        <strong>Landlords face cash flow</strong> issues with
                        annual collection
                      </span>
                    </li>
                  </ul>
                </div>

                <div className='bg-green-50 rounded-xl p-4 border-2 border-green-200'>
                  <h4 className='font-semibold text-green-900 mb-3'>
                    Our Solution:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>half / full rent payments</strong> with
                        automated deductions
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Rent-now-pay-later</strong> in partnership with
                        fintech lenders
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Fractional property investment</strong> from
                        ₦10,000 ($10)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Artisan mortgage program</strong> using platform
                        earnings history
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Credit scoring</strong> based on rent payment
                        history
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Microfinance integration</strong> for equipment
                        and property down payments
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Problem 3: Market Inefficiency */}
              <div className='bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-600 hover:shadow-2xl transition-all'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-purple-100 p-3 rounded-lg'>
                    <TrendingUp className='w-8 h-8 text-purple-600' />
                  </div>
                  <h3 className='font-bold text-2xl text-purple-900'>
                    Market Chaos
                  </h3>
                </div>

                <div className='mb-6'>
                  <h4 className='font-semibold text-gray-800 mb-3'>
                    Real Problems:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>Fragmented listings</strong> across WhatsApp,
                        Facebook, physical boards
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>Manual search</strong> wastes weeks driving
                        around neighborhoods
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>No price transparency</strong> - same property,
                        different prices
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>Artisan discovery</strong> via word-of-mouth
                        only (unreliable)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>Legal documentation</strong> takes months and
                        costs ₦200K+
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-purple-500 mr-2'>•</span>
                      <span>
                        <strong>Property management chaos</strong> -
                        spreadsheets and phone calls
                      </span>
                    </li>
                  </ul>
                </div>

                <div className='bg-green-50 rounded-xl p-4 border-2 border-green-200'>
                  <h4 className='font-semibold text-green-900 mb-3'>
                    Our Solution:
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Centralized marketplace</strong> with geospatial
                        search
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>AI-powered matching</strong> based on budget,
                        location, preferences
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Price comparison</strong> and market analytics
                        dashboard
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Verified artisan network</strong> with
                        portfolios and ratings
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Digital documentation</strong> in 24 hours (vs.
                        3 months)
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle2 className='w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0' />
                      <span>
                        <strong>Automated property management</strong> suite for
                        landlords
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Artisan Empowerment Focus */}
            <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 border-2 border-amber-300'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='bg-amber-500 p-4 rounded-full'>
                  <Wrench className='w-10 h-10 text-white' />
                </div>
                <div>
                  <h3 className='text-3xl font-bold text-gray-900'>
                    Empowering Artisans: From Survival to Wealth
                  </h3>
                  <p className='text-gray-600'>
                    {`                    Breaking the cycle of poverty for Nigeria's 15M+ skilled
                    workers`}
                  </p>
                </div>
              </div>

              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h4 className='font-bold text-xl text-gray-900 mb-4'>
                    The Artisan Crisis in Nigeria:
                  </h4>
                  <div className='space-y-3'>
                    <div className='bg-white rounded-lg p-4 border-l-4 border-red-500'>
                      <p className='text-sm text-gray-700'>
                        <strong className='text-red-700'>
                          Income Instability:
                        </strong>{' '}
                        Plumbers, electricians, masons earn ₦30K-80K/month
                        inconsistently
                      </p>
                    </div>
                    <div className='bg-white rounded-lg p-4 border-l-4 border-red-500'>
                      <p className='text-sm text-gray-700'>
                        <strong className='text-red-700'>
                          No Social Security:
                        </strong>{' '}
                        No pensions, health insurance, or safety net
                      </p>
                    </div>
                    <div className='bg-white rounded-lg p-4 border-l-4 border-red-500'>
                      <p className='text-sm text-gray-700'>
                        <strong className='text-red-700'>
                          Zero Asset Ownership:
                        </strong>{' '}
                        99% of artisans will never own property traditionally
                      </p>
                    </div>
                    <div className='bg-white rounded-lg p-4 border-l-4 border-red-500'>
                      <p className='text-sm text-gray-700'>
                        <strong className='text-red-700'>
                          Limited Job Access:
                        </strong>{' '}
                        Discovery happens via word-of-mouth only
                      </p>
                    </div>
                    <div className='bg-white rounded-lg p-4 border-l-4 border-red-500'>
                      <p className='text-sm text-gray-700'>
                        <strong className='text-red-700'>Exploitation:</strong>{' '}
                        Middlemen take 30-50% of job payments
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-bold text-xl text-gray-900 mb-4'>
                    How PropKonnect Changes Their Lives:
                  </h4>
                  <div className='space-y-3'>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>📱 Digital Profile:</strong> Showcase skills,
                        certifications, past work to 10,000+ potential clients
                      </p>
                    </div>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>💰 Direct Earnings:</strong> 85-90% of job
                        payment (vs. 50-70% through middlemen)
                      </p>
                    </div>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>🏠 Property Ownership Path:</strong> Invest from
                        ₦10K/month into fractional property shares
                      </p>
                    </div>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>📊 Credit Building:</strong> Platform earnings
                        create credit score for microloans
                      </p>
                    </div>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>🎓 Skills Verification:</strong> Digital
                        certificates and verified customer reviews
                      </p>
                    </div>
                    <div className='bg-green-500 text-white rounded-lg p-4'>
                      <p className='text-sm'>
                        <strong>🤝 Co-ownership Opportunities:</strong> Team up
                        with other artisans to buy property together
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 bg-white rounded-xl p-6 border-2 border-amber-300'>
                <h4 className='font-bold text-lg text-gray-900 mb-3'>
                  Real Impact Example:
                </h4>
                <p className='text-gray-700 italic'>
                  {`"A plumber earning ₦60K/month completes 8 jobs via PropKonnect
                  (₦480K total). Platform keeps 15% (₦72K), plumber earns ₦408K.
                  From this, he invests ₦50K/month into a ₦5M property co-owned
                  with 4 other artisans. In 5 years, owns ₦3M in property while
                  building credit for equipment loans. Previously, he'd own
                  nothing and have no path forward."`}
                </p>
              </div>
            </div>

            {/* Target Market Breakdown */}
            <div className='bg-white rounded-2xl shadow-xl p-8'>
              <h3 className='text-3xl font-bold text-gray-900 mb-6 text-center'>
                Our Target Market Segments
              </h3>
              <div className='grid md:grid-cols-5 gap-6'>
                {[
                  {
                    name: 'Property Owners',
                    icon: '🏘️',
                    count: '500K+',
                    size: 'Landlords & Developers',
                    pain: 'Vacancy rates, payment collection, property management costs',
                    gain: 'Automated rent collection, verified tenants, 60% cost reduction'
                  },
                  {
                    name: 'Property Seekers',
                    icon: '🔍',
                    count: '2M+',
                    size: 'Tenants & Buyers',
                    pain: 'Fraud fears, upfront rent burden, limited options',
                    gain: 'Verified listings, monthly payments, 70% more affordable'
                  },
                  {
                    name: 'Investors',
                    icon: '💼',
                    count: '50K+',
                    size: 'HNIs & Diaspora',
                    pain: 'High entry barriers, illiquidity, lack of transparency',
                    gain: 'Invest from $100, digital dashboard, 12-15% annual returns'
                  },
                  {
                    name: 'Hospitality',
                    icon: '🏨',
                    count: '5K+',
                    size: 'Hotels & Guests',
                    pain: 'Channel management complexity, payment issues',
                    gain: 'Unified booking system, instant payments, 25% revenue increase'
                  },
                  {
                    name: 'Artisans',
                    icon: '🔧',
                    count: '15M+',
                    size: 'Skilled Workers',
                    pain: 'Job scarcity, exploitation, no wealth accumulation',
                    gain: 'Direct client access, property ownership, credit building'
                  }
                ].map((segment, index) => (
                  <div
                    key={index}
                    className='group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-gray-200 hover:border-blue-400 cursor-pointer'
                  >
                    <div className='text-6xl mb-4 group-hover:scale-110 transition-transform'>
                      {segment.icon}
                    </div>
                    <h4 className='font-bold text-xl text-gray-900 mb-1'>
                      {segment.name}
                    </h4>
                    <p className='text-3xl font-bold text-blue-600 mb-2'>
                      {segment.count}
                    </p>
                    <p className='text-sm text-gray-600 mb-3'>{segment.size}</p>

                    <div className='mt-4 pt-4 border-t border-gray-300'>
                      <p className='text-xs text-red-700 font-semibold mb-2'>
                        Pain:
                      </p>
                      <p className='text-xs text-gray-600 mb-3'>
                        {segment.pain}
                      </p>

                      <p className='text-xs text-green-700 font-semibold mb-2'>
                        Gain:
                      </p>
                      <p className='text-xs text-gray-700'>{segment.gain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Nigeria? Why Now? */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white'>
                <h3 className='text-2xl font-bold mb-6'>Why Nigeria?</h3>
                <ul className='space-y-4'>
                  <li className='flex items-start'>
                    <CheckCircle2 className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Massive Population</p>
                      <p className='text-sm text-blue-100'>
                        220M people, 60% urban by 2030
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Housing Crisis</p>
                      <p className='text-sm text-blue-100'>
                        17M housing deficit, growing 700K/year
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Digital Adoption</p>
                      <p className='text-sm text-blue-100'>
                        60% mobile money penetration, growing fintech sector
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Young Population</p>
                      <p className='text-sm text-blue-100'>
                        Median age 18, tech-savvy generation
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Infrastructure Readiness</p>
                      <p className='text-sm text-blue-100'>
                        BVN/NIN system, 4G coverage in major cities
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className='bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-8 text-white'>
                <h3 className='text-2xl font-bold mb-6'>Why Now?</h3>
                <ul className='space-y-4'>
                  <li className='flex items-start'>
                    <TrendingUp className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Economic Pressure</p>
                      <p className='text-sm text-green-100'>
                        Inflation forcing people to seek alternative
                        housing/income
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <TrendingUp className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Tech Maturity</p>
                      <p className='text-sm text-green-100'>
                        Mobile-first infrastructure now reliable and scalable
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <TrendingUp className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Fintech Boom</p>
                      <p className='text-sm text-green-100'>
                        Payment infrastructure matured in last 5 years
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <TrendingUp className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Regulatory Momentum</p>
                      <p className='text-sm text-green-100'>
                        Government pushing digital real estate registry
                      </p>
                    </div>
                  </li>
                  <li className='flex items-start'>
                    <TrendingUp className='w-6 h-6 mr-3 mt-1 flex-shrink-0' />
                    <div>
                      <p className='font-semibold'>Competition Gap</p>
                      <p className='text-sm text-green-100'>
                        No comprehensive platform addressing all pain points
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <SectionRating />
          </div>
        )}
        {/* Modules Section */}
        {currentSection === 'modules' && (
          <div className='space-y-8 animate-fadeIn'>
            <div className='text-center mb-8'>
              <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                Core Platform Modules
              </h2>
              <p className='text-xl text-gray-600'>
                Seven integrated modules powering the complete real estate
                ecosystem
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {modules.map((module, index) => (
                <div
                  key={index}
                  className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                >
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />

                  <div className='p-8'>
                    <div className='flex items-start gap-4 mb-6'>
                      <span className='text-6xl'>{module.icon}</span>
                      <div className='flex-1'>
                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                          {module.title}
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                          {Object.entries(module.metrics).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'
                              >
                                {key}: {value}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <ul className='space-y-3'>
                      {module.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className='flex items-start gap-2 text-sm text-gray-700'
                        >
                          <ChevronRight
                            size={16}
                            className='text-blue-600 mt-0.5 flex-shrink-0'
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <SectionRating />
          </div>
        )}
        {/* User Flows Section */}
        {currentSection === 'userflows' && (
          <div className='space-y-8 animate-fadeIn'>
            <div className='text-center mb-8'>
              <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                User Journey Flows
              </h2>
              <p className='text-xl text-gray-600'>
                Seamless experiences designed for every user type
              </p>
            </div>

            <div className='space-y-8'>
              {[
                {
                  role: 'Landlord Journey',
                  icon: '🏠',
                  color: 'from-blue-500 to-cyan-500',
                  steps: [
                    'Create account & complete KYC',
                    'List property with details',
                    'Set rental terms & pricing',
                    'Review tenant applications',
                    'Sign digital lease agreement',
                    'Receive automated payments',
                    'Manage maintenance requests',
                    'Access analytics dashboard'
                  ]
                },
                {
                  role: 'Tenant Journey',
                  icon: '👤',
                  color: 'from-green-500 to-emerald-500',
                  steps: [
                    'Sign up & verify identity',
                    'Search with smart filters',
                    'Schedule property viewings',
                    'Submit rental application',
                    'Complete background check',
                    'E-sign lease & pay deposit',
                    'Set up payment schedule',
                    'Pay rent & submit requests'
                  ]
                },
                {
                  role: 'Investor Journey',
                  icon: '💼',
                  color: 'from-purple-500 to-pink-500',
                  steps: [
                    'Register & get accredited',
                    'Complete enhanced KYC',
                    'Browse opportunities',
                    'Review ROI & risk profile',
                    'Make investment commitment',
                    'Track portfolio performance',
                    'Receive distributions',
                    'Access tax documents'
                  ]
                },
                {
                  role: 'Artisan Journey',
                  icon: '🔧',
                  color: 'from-orange-500 to-amber-500',
                  steps: [
                    'Apply with credentials',
                    'Complete verification',
                    'Create professional profile',
                    'Browse available jobs',
                    'Submit bids & quotes',
                    'Accept job with escrow',
                    'Complete work & get paid',
                    'Apply for property purchase'
                  ]
                }
              ].map((flow, index) => (
                <div key={index} className='bg-white rounded-2xl shadow-lg p-8'>
                  <div className='flex items-center gap-4 mb-6'>
                    <span className='text-5xl'>{flow.icon}</span>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      {flow.role}
                    </h3>
                  </div>

                  <div className='grid md:grid-cols-4 gap-4'>
                    {flow.steps.map((step, idx) => (
                      <div key={idx} className='relative'>
                        <div className='bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-all'>
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${flow.color} text-white flex items-center justify-center text-sm font-bold mb-2`}
                          >
                            {idx + 1}
                          </div>
                          <p className='text-sm text-gray-700'>{step}</p>
                        </div>
                        {idx < flow.steps.length - 1 && (
                          <ChevronRight className='hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 text-gray-400' />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SectionRating />
          </div>
        )}
        {/* Continue with remaining sections... (Architecture, Database, Revenue, Financials, Artisans, Security, Roadmap) */}
        {/* Each following the same pattern with SectionRating at the end */}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default PropConnectPlatform
