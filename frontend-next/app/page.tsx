'use client'

import { useState, useEffect, useRef } from 'react'
import ProfileCards from '@/components/ProfileCards'
import TabbedSidebar from '@/components/TabbedSidebar'

export type Candidate = {
    id?: number
    unique_id: string
    name: string
    email: string
    phone: string
    linkedin_url?: string
    current_location?: string
    current_company?: string
    current_designation?: string
    total_experience_years?: number
    key_skills?: string[]
    highest_degree?: string
    university_name?: string
    graduation_year?: string
    expected_salary?: string
    notice_period?: string
    cv_text?: string
    cv_summary?: string
    created_at?: string
    email_subject?: string
    email_from?: string
    email_to?: string | null
    email_cc?: string | null
    email_date?: string | null
    resume_filename?: string | null
    notes?: string | null
    tags?: string | null
    gmail_message_id?: string
    email_body?: string
    resume_path?: string
    resume_text?: string
    cv_data?: any
    extracted_phones?: string
    extracted_emails?: string
    extracted_links?: string
    recruiter_id?: number
    recruiter_name?: string
}

type ScanProgress = {
    status: string
    total_emails: number
    processed_emails: number
    current_subject: string
    candidates_added: number
    skipped: number
    message: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function Home() {
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<{id: number, email: string, name: string} | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    
    // IMAP login states
    const [showIMAPLogin, setShowIMAPLogin] = useState(false)
    const [imapProvider, setImapProvider] = useState('outlook')
    const [imapEmail, setImapEmail] = useState('')
    const [imapPassword, setImapPassword] = useState('')
    
    // Sidebar tab state
    const [activeTab, setActiveTab] = useState<'search' | 'scan'>('scan') // 'search' or 'scan'
    const [showFilters, setShowFilters] = useState(false)
    
    // Advanced filters - Search Database
    const [cvFreshness, setCvFreshness] = useState('all')
    const [lastVisited, setLastVisited] = useState('all')
    const [experienceYears, setExperienceYears] = useState('')
    const [educationDegree, setEducationDegree] = useState('')
    const [cvLanguage, setCvLanguage] = useState('')
    
    // Personal Information Filters
    const [residenceLocation, setResidenceLocation] = useState('')
    const [nationality, setNationality] = useState('')
    const [gender, setGender] = useState('')
    const [ageMin, setAgeMin] = useState('')
    const [ageMax, setAgeMax] = useState('')
    const [languages, setLanguages] = useState('')
    const [maritalStatus, setMaritalStatus] = useState('')
    const [specialNeeds, setSpecialNeeds] = useState('')
    
    // Target Job Filters
    const [salaryMin, setSalaryMin] = useState('')
    const [salaryMax, setSalaryMax] = useState('')
    const [careerLevel, setCareerLevel] = useState('')
    const [targetJobLocation, setTargetJobLocation] = useState('')
    const [employmentType, setEmploymentType] = useState('')
    const [noticePeriod, setNoticePeriod] = useState('')
    
    // Education Filters
    const [degree, setDegree] = useState('')
    const [major, setMajor] = useState('')
    const [grade, setGrade] = useState('')
    const [institution, setInstitution] = useState('')
    
    // Previous Actions Filters
    const [hasNotes, setHasNotes] = useState(false)
    const [hasViews, setHasViews] = useState(false)
    const [hasTags, setHasTags] = useState(false)
    
    // CV Requirements Filters
    const [hasContactInfo, setHasContactInfo] = useState(false)
    const [hasMobileConfirmed, setHasMobileConfirmed] = useState(false)
    const [hasPhoto, setHasPhoto] = useState(false)
    const [hasExperience, setHasExperience] = useState(false)
    
    // Scan filters
    const [selectedKeyword, setSelectedKeyword] = useState('job')
    const [customKeyword, setCustomKeyword] = useState('')
    const [selectedTimeRange, setSelectedTimeRange] = useState('7days')
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>([])
    const [selectedSources, setSelectedSources] = useState<string[]>([])
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    
    // Custom date range
    const [customDateFrom, setCustomDateFrom] = useState('')
    const [customDateTo, setCustomDateTo] = useState('')
    
    // Custom source email
    const [customSourceEmail, setCustomSourceEmail] = useState('')
    
    // Dropdown open states and refs
    const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false)
    const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false)
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
    const attachmentDropdownRef = useRef<HTMLDivElement>(null)
    const sourceDropdownRef = useRef<HTMLDivElement>(null)
    const statusDropdownRef = useRef<HTMLDivElement>(null)
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentDropdownRef.current && !attachmentDropdownRef.current.contains(event.target as Node)) {
                setAttachmentDropdownOpen(false)
            }
            if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
                setSourceDropdownOpen(false)
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setStatusDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    // Last used scan query (for display)
    const [lastScanQuery, setLastScanQuery] = useState('')
    
    // Scan progress state
    const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null)
    const [scannedCandidates, setScannedCandidates] = useState<Candidate[]>([]) // Candidates from most recent scan

    // Check login status on mount
    useEffect(() => {
        checkLoginStatus()
    }, [])

    // Fetch all candidates from database when tab changes to search
    useEffect(() => {
        if (isLoggedIn && activeTab === 'search') {
            fetchCandidates()
        }
    }, [isLoggedIn, activeTab])

    // Filter options
    const keywordOptions = [
        { label: 'All Emails', value: '', query: '' },
        { label: 'Job/Recruitment', value: 'job', query: '(job OR application OR resume OR cv OR hiring OR vacancy OR career OR candidate OR position OR developer OR engineer)' },
        { label: 'Sales', value: 'sales', query: '(sales OR quotation OR proposal OR pricing OR invoice)' },
        { label: 'Marketing', value: 'marketing', query: '(marketing OR campaign OR leads OR promotion OR newsletter)' },
        { label: 'Custom...', value: 'custom', query: '' },
    ]

    const timeRangeOptions = [
        { label: 'All Time', value: '', query: '' },
        { label: 'Today', value: 'today', query: 'newer_than:1d' },
        { label: 'Last 3 Days', value: '3days', query: 'newer_than:3d' },
        { label: 'Last 7 Days', value: '7days', query: 'newer_than:7d' },
        { label: 'Last 30 Days', value: '30days', query: 'newer_than:30d' },
        { label: 'Last 3 Months', value: '3months', query: 'newer_than:90d' },
        { label: 'Custom Date Range...', value: 'custom', query: '' },
    ]

    const attachmentOptions = [
        { label: 'PDF', value: 'pdf', query: 'filename:pdf' },
        { label: 'Word', value: 'word', query: '(filename:doc OR filename:docx)' },
        { label: 'Excel', value: 'excel', query: '(filename:xlsx OR filename:xls)' },
        { label: 'Images', value: 'images', query: '(filename:jpg OR filename:png OR filename:jpeg)' },
    ]

    const sourceOptions = [
        { label: 'LinkedIn', value: 'linkedin', query: 'from:linkedin' },
        { label: 'Indeed', value: 'indeed', query: 'from:indeed' },
        { label: 'Naukri', value: 'naukri', query: 'from:naukri' },
        { label: 'Glassdoor', value: 'glassdoor', query: 'from:glassdoor' },
    ]

    const statusOptions = [
        { label: 'Unread', value: 'unread', query: 'is:unread' },
        { label: 'Read', value: 'read', query: 'is:read' },
        { label: 'Starred', value: 'starred', query: 'is:starred' },
        { label: 'Important', value: 'important', query: 'is:important' },
        { label: 'In Inbox', value: 'inbox', query: 'in:inbox' },
    ]

    // Build scan query from filters
    const buildScanQuery = () => {
        const parts: string[] = []
        if (selectedKeyword === 'custom' && customKeyword.trim()) {
            parts.push(`subject:(${customKeyword.trim()})`)
        } else if (selectedKeyword) {
            const opt = keywordOptions.find(o => o.value === selectedKeyword)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Handle time range - custom or preset
        if (selectedTimeRange === 'custom' && customDateFrom) {
            // Gmail uses format: after:YYYY/MM/DD before:YYYY/MM/DD
            const fromDate = customDateFrom.replace(/-/g, '/')
            parts.push(`after:${fromDate}`)
            if (customDateTo) {
                const toDate = customDateTo.replace(/-/g, '/')
                parts.push(`before:${toDate}`)
            }
        } else if (selectedTimeRange) {
            const opt = timeRangeOptions.find(o => o.value === selectedTimeRange)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Handle attachments - multi-select (OR logic)
        if (selectedAttachments.length > 0) {
            const attachQueries = selectedAttachments
                .map(v => attachmentOptions.find(o => o.value === v)?.query)
                .filter(Boolean)
            if (attachQueries.length > 0) {
                parts.push(`has:attachment (${attachQueries.join(' OR ')})`)
            }
        }
        
        // Handle sources - multi-select (OR logic) + custom email
        const sourceQueries: string[] = []
        selectedSources.forEach(v => {
            const opt = sourceOptions.find(o => o.value === v)
            if (opt?.query) sourceQueries.push(opt.query)
        })
        if (customSourceEmail.trim()) {
            sourceQueries.push(`from:${customSourceEmail.trim()}`)
        }
        if (sourceQueries.length > 0) {
            parts.push(`(${sourceQueries.join(' OR ')})`)
        }
        
        // Handle status - multi-select (AND logic for status filters)
        selectedStatuses.forEach(v => {
            const opt = statusOptions.find(o => o.value === v)
            if (opt?.query) parts.push(opt.query)
        })
        
        return parts.join(' ')
    }

    // Helper to get session token
    const getSessionToken = () => {
        const session = localStorage.getItem('crm_session')
        if (session) {
            try {
                const data = JSON.parse(session)
                return data.token
            } catch {
                return null
            }
        }
        return null
    }

    const fetchCandidates = async (search?: string) => {
        try {
            const token = getSessionToken()
            if (!token) {
                console.error('No session token found')
                return
            }

            let url = `${API_URL}/candidates?`
            if (search) url += `search=${encodeURIComponent(search)}`
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) return
            const data = await response.json()
            setCandidates(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching candidates:', error)
            setCandidates([])
        }
    }

    const checkLoginStatus = async () => {
        const savedUser = localStorage.getItem('recruiter_user')
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser)
                setUser(userData)
                setIsLoggedIn(true)
                fetchCandidates()
            } catch {
                localStorage.removeItem('recruiter_user')
            }
        }
    }

    const handleLogin = async () => {
        setIsLoading(true)
        try {
            // Call backend to get OAuth URL
            const response = await fetch(`${API_URL}/auth/google/login`)
            const data = await response.json()
            
            if (data.success && data.auth_url) {
                // Open OAuth in popup window
                const width = 500
                const height = 600
                const left = window.screen.width / 2 - width / 2
                const top = window.screen.height / 2 - height / 2
                
                const popup = window.open(
                    data.auth_url,
                    'Gmail OAuth',
                    `width=${width},height=${height},left=${left},top=${top}`
                )
                
                // Listen for OAuth callback
                window.addEventListener('message', (event) => {
                    if (!event.origin.includes('localhost')) return
                    
                    if (event.data.type === 'OAUTH_SUCCESS') {
                        // Store session
                        localStorage.setItem('crm_session', JSON.stringify(event.data.data))
                        setUser(event.data.data.user)
                        setIsLoggedIn(true)
                        fetchCandidates()
                        setIsLoading(false)
                    } else if (event.data.type === 'OAUTH_ERROR') {
                        alert(`Login failed: ${event.data.error}`)
                        setIsLoading(false)
                    }
                }, { once: true })
                
                // Check if popup was blocked
                if (!popup || popup.closed) {
                    alert('Popup blocked! Please allow popups for this site.')
                    setIsLoading(false)
                }
            } else {
                alert(data.detail || 'Failed to initiate OAuth')
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Login error:', error)
            alert('Failed to login. Make sure the backend is running.')
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST' })
        } catch (error) {
            console.error('Logout error:', error)
        }
        localStorage.removeItem('recruiter_user')
        setIsLoggedIn(false)
        setUser(null)
        setCandidates([])
    }

    const handleSearch = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams()
            
            // Basic search
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim())
            }
            
            // CV Freshness
            if (cvFreshness && cvFreshness !== 'all') {
                params.append('cv_freshness', cvFreshness)
            }
            
            // Experience
            if (experienceYears) {
                params.append('experience_years', experienceYears)
            }
            
            // Education
            if (educationDegree) {
                params.append('education_degree', educationDegree)
            }
            
            // CV Language
            if (cvLanguage) {
                params.append('cv_language', cvLanguage)
            }
            
            // Personal Information
            if (residenceLocation) params.append('residence_location', residenceLocation)
            if (nationality) params.append('nationality', nationality)
            if (gender) params.append('gender', gender)
            if (ageMin) params.append('age_min', ageMin)
            if (ageMax) params.append('age_max', ageMax)
            if (languages) params.append('languages', languages)
            if (maritalStatus) params.append('marital_status', maritalStatus)
            if (specialNeeds) params.append('special_needs', specialNeeds)
            
            // Target Job
            if (salaryMin) params.append('salary_min', salaryMin)
            if (salaryMax) params.append('salary_max', salaryMax)
            if (careerLevel) params.append('career_level', careerLevel)
            if (targetJobLocation) params.append('target_job_location', targetJobLocation)
            if (employmentType) params.append('employment_type', employmentType)
            if (noticePeriod) params.append('notice_period', noticePeriod)
            
            // Education Details
            if (degree) params.append('degree', degree)
            if (major) params.append('major', major)
            if (grade) params.append('grade', grade)
            if (institution) params.append('institution', institution)
            
            // Previous Actions
            if (hasNotes) params.append('has_notes', 'true')
            if (hasViews) params.append('has_views', 'true')
            if (hasTags) params.append('has_tags', 'true')
            
            // CV Requirements
            if (hasContactInfo) params.append('has_contact_info', 'true')
            if (hasMobileConfirmed) params.append('has_mobile_confirmed', 'true')
            if (hasPhoto) params.append('has_photo', 'true')
            if (hasExperience) params.append('has_experience', 'true')
            
            setIsLoading(true)
            const response = await fetch(`${API_URL}/candidates?${params.toString()}`)
            const data = await response.json()
            setCandidates(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Search error:', error)
            setCandidates([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleScan = async () => {
        const query = buildScanQuery()
        setLastScanQuery(query)
        setIsLoading(true)
        setScanProgress(null)
        setScannedCandidates([]) // Clear previous scan results
        
        try {
            const token = getSessionToken()
            if (!token) {
                alert('Session expired. Please login again.')
                setIsLoading(false)
                return
            }

            const scanRes = await fetch(`${API_URL}/scan`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    search_query: query || null,
                    recruiter_id: user?.id
                })
            })
            
            if (!scanRes.ok) {
                throw new Error('Scan request failed')
            }
            
            const pollProgress = async () => {
                try {
                    const progressRes = await fetch(`${API_URL}/scan-progress`)
                    if (progressRes.ok) {
                        const progress = await progressRes.json()
                        console.log('📊 Scan progress:', progress)
                        setScanProgress(progress)
                        
                        if (progress.status === 'complete') {
                            console.log(`✅ Scan complete! candidates_added: ${progress.candidates_added}`)
                            setIsLoading(false)
                            // Fetch the most recent candidates (those just added by the scan)
                            if (progress.candidates_added > 0) {
                                try {
                                    console.log(`📥 Fetching candidates from ${API_URL}/candidates`)
                                    const res = await fetch(`${API_URL}/candidates`)
                                    console.log(`📡 Response status: ${res.status}`)
                                    if (res.ok) {
                                        const data = await res.json()
                                        console.log(`📦 Received raw data:`, data)
                                        // Backend returns a raw array, not {candidates: [...]}
                                        const allCandidates = Array.isArray(data) ? data : []
                                        console.log(`📦 Total candidates: ${allCandidates.length}`)
                                        // Get the most recent N candidates where N = candidates_added
                                        const recentCandidates = allCandidates.slice(0, progress.candidates_added)
                                        console.log(`✂️ Sliced to ${recentCandidates.length} recent candidates`)
                                        setScannedCandidates(recentCandidates)
                                        console.log(`✅ Loaded ${recentCandidates.length} scanned candidates into state`)
                                    } else {
                                        console.error(`❌ Failed to fetch candidates: ${res.status} ${res.statusText}`)
                                    }
                                } catch (e) {
                                    console.error('❌ Failed to fetch scanned candidates:', e)
                                    alert('Scan completed but failed to load candidates. Please check the Search Database tab.')
                                }
                            } else {
                                console.log('ℹ️ No candidates added in this scan')
                                setScannedCandidates([])
                            }
                            setTimeout(() => setScanProgress(null), 5000)
                        } else if (progress.status === 'error') {
                            console.error('❌ Scan error:', progress.message)
                            setIsLoading(false)
                            setTimeout(() => setScanProgress(null), 5000)
                        } else {
                            setTimeout(pollProgress, 500)
                        }
                    }
                } catch (e) {
                    console.error('❌ Error polling progress:', e)
                    setTimeout(pollProgress, 1000)
                }
            }
            pollProgress()
        } catch (error) {
            console.error('Scan error:', error)
            alert('Failed to start scan. Please try again.')
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkLoginStatus()
    }, [])

    if (!isLoggedIn) {
        const handleIMAPLogin = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'imap',
                        provider: imapProvider,
                        email: imapEmail,
                        password: imapPassword
                    })
                })
                const data = await response.json()
                if (data.success) {
                    setUser(data.user)
                    setIsLoggedIn(true)
                    localStorage.setItem('recruiter_user', JSON.stringify(data.user))
                    fetchCandidates()
                } else {
                    alert(data.detail || 'Login failed')
                }
            } catch (error) {
                alert('Failed to login. Make sure the backend is running and credentials are correct.')
            } finally {
                setIsLoading(false)
            }
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📧</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">CV Scanner</h2>
                    <p className="text-slate-400 mb-8 text-center">Connect your Gmail to scan and manage CVs</p>
                    
                    {!showIMAPLogin ? (
                        <>
                            {/* Gmail OAuth - Primary and Recommended */}
                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-3 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="text-lg">Connect with Gmail</span>
                                    </>
                                )}
                            </button>
                            
                            {/* Benefits */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6">
                                <div className="flex items-start gap-2 text-xs text-emerald-300">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    <div>
                                        <p className="font-medium mb-1">Recommended for best experience:</p>
                                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                                            <li>No app password needed</li>
                                            <li>Choose which Google account</li>
                                            <li>Secure OAuth 2.0</li>
                                            <li>Instant access to emails</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-slate-700"></div>
                                <span className="text-xs text-slate-500">Advanced</span>
                                <div className="flex-1 h-px bg-slate-700"></div>
                            </div>
                            
                            {/* Other Email (IMAP) - Less Prominent */}
                            <button
                                onClick={() => { setShowIMAPLogin(true); setImapProvider('gmail'); }}
                                className="w-full py-2.5 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700/50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Use IMAP (Outlook, Yahoo, Other)</span>
                            </button>
                            <p className="text-xs text-slate-500 text-center mt-2">Requires app password</p>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {/* Show provider name */}
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-slate-300 font-medium">
                                        {imapProvider === 'outlook' && '📧 Connecting to Outlook'}
                                        {imapProvider === 'yahoo' && '📧 Connecting to Yahoo'}
                                        {imapProvider === 'gmail' && '📧 Connecting via IMAP'}
                                    </p>
                                </div>

                                {imapProvider !== 'gmail' && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Provider</label>
                                        <select
                                            value={imapProvider}
                                            onChange={(e) => setImapProvider(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="outlook">Outlook / Hotmail / Live</option>
                                            <option value="yahoo">Yahoo Mail</option>
                                            <option value="gmail">Gmail (via IMAP)</option>
                                        </select>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={imapEmail}
                                        onChange={(e) => setImapEmail(e.target.value)}
                                        placeholder={
                                            imapProvider === 'outlook' ? 'yourname@outlook.com' :
                                            imapProvider === 'yahoo' ? 'yourname@yahoo.com' :
                                            'your.email@example.com'
                                        }
                                        className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">App Password</label>
                                    <input
                                        type="password"
                                        value={imapPassword}
                                        onChange={(e) => setImapPassword(e.target.value)}
                                        placeholder="Enter app password"
                                        className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {imapProvider === 'outlook' && (
                                            <>
                                                <a 
                                                    href="https://account.microsoft.com/security" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                >
                                                    Get Outlook App Password →
                                                </a>
                                                {' (Enable 2FA → Generate app password)'}
                                            </>
                                        )}
                                        {imapProvider === 'yahoo' && (
                                            <>
                                                <a 
                                                    href="https://login.yahoo.com/account/security" 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                >
                                                    Get Yahoo App Password →
                                                </a>
                                                {' (Generate app password under Security)'}
                                            </>
                                        )}
                                        {imapProvider === 'gmail' && 'Use Gmail App Password (16 characters)'}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleIMAPLogin}
                                    disabled={isLoading || !imapEmail || !imapPassword}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>Connect</>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setShowIMAPLogin(false)}
                                    className="w-full py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 rounded-lg text-sm transition-colors"
                                >
                                    ← Back to Gmail
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-lg">📧</span>
                            </div>
                            <h1 className="text-lg font-bold text-white">CV Scanner</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400">{user?.name}</span>
                            <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={() => {
                                    // Reset to pre-scan state
                                    setCandidates([])
                                    setScanProgress(null)
                                    setSearchQuery('')
                                    setSelectedKeyword('job')
                                    setCustomKeyword('')
                                    setSelectedTimeRange('7days')
                                    setSelectedAttachments([])
                                    setSelectedSources([])
                                    setSelectedStatuses([])
                                    setCustomDateFrom('')
                                    setCustomDateTo('')
                                    setCustomSourceEmail('')
                                    // Call backend reset
                                    fetch(`${API_URL}/reset-session`, { method: 'POST' })
                                }}
                                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm border border-amber-500/30"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm border border-red-500/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-60px)]">
                {/* LEFT SIDEBAR - Tabbed Interface */}
                <TabbedSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSearch={handleSearch}
                    fetchCandidates={fetchCandidates}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    cvFreshness={cvFreshness}
                    setCvFreshness={setCvFreshness}
                    lastVisited={lastVisited}
                    setLastVisited={setLastVisited}
                    experienceYears={experienceYears}
                    setExperienceYears={setExperienceYears}
                    educationDegree={educationDegree}
                    setEducationDegree={setEducationDegree}
                    cvLanguage={cvLanguage}
                    setCvLanguage={setCvLanguage}
                    selectedKeyword={selectedKeyword}
                    setSelectedKeyword={setSelectedKeyword}
                    customKeyword={customKeyword}
                    setCustomKeyword={setCustomKeyword}
                    selectedTimeRange={selectedTimeRange}
                    setSelectedTimeRange={setSelectedTimeRange}
                    customDateFrom={customDateFrom}
                    setCustomDateFrom={setCustomDateFrom}
                    customDateTo={customDateTo}
                    setCustomDateTo={setCustomDateTo}
                    selectedAttachments={selectedAttachments}
                    setSelectedAttachments={setSelectedAttachments}
                    selectedSources={selectedSources}
                    setSelectedSources={setSelectedSources}
                    selectedStatuses={selectedStatuses}
                    setSelectedStatuses={setSelectedStatuses}
                    customSourceEmail={customSourceEmail}
                    setCustomSourceEmail={setCustomSourceEmail}
                    attachmentDropdownRef={attachmentDropdownRef}
                    sourceDropdownRef={sourceDropdownRef}
                    statusDropdownRef={statusDropdownRef}
                    attachmentDropdownOpen={attachmentDropdownOpen}
                    setAttachmentDropdownOpen={setAttachmentDropdownOpen}
                    sourceDropdownOpen={sourceDropdownOpen}
                    setSourceDropdownOpen={setSourceDropdownOpen}
                    statusDropdownOpen={statusDropdownOpen}
                    setStatusDropdownOpen={setStatusDropdownOpen}
                    attachmentOptions={attachmentOptions}
                    sourceOptions={sourceOptions}
                    statusOptions={statusOptions}
                    handleScan={handleScan}
                    isLoading={isLoading}
                    scanProgress={scanProgress}
                    keywordOptions={keywordOptions}
                    timeRangeOptions={timeRangeOptions}
                    // Personal Information Filters
                    residenceLocation={residenceLocation}
                    setResidenceLocation={setResidenceLocation}
                    nationality={nationality}
                    setNationality={setNationality}
                    gender={gender}
                    setGender={setGender}
                    ageMin={ageMin}
                    setAgeMin={setAgeMin}
                    ageMax={ageMax}
                    setAgeMax={setAgeMax}
                    languages={languages}
                    setLanguages={setLanguages}
                    maritalStatus={maritalStatus}
                    setMaritalStatus={setMaritalStatus}
                    specialNeeds={specialNeeds}
                    setSpecialNeeds={setSpecialNeeds}
                    // Target Job Filters
                    salaryMin={salaryMin}
                    setSalaryMin={setSalaryMin}
                    salaryMax={salaryMax}
                    setSalaryMax={setSalaryMax}
                    careerLevel={careerLevel}
                    setCareerLevel={setCareerLevel}
                    targetJobLocation={targetJobLocation}
                    setTargetJobLocation={setTargetJobLocation}
                    employmentType={employmentType}
                    setEmploymentType={setEmploymentType}
                    noticePeriod={noticePeriod}
                    setNoticePeriod={setNoticePeriod}
                    // Education Filters
                    degree={degree}
                    setDegree={setDegree}
                    major={major}
                    setMajor={setMajor}
                    grade={grade}
                    setGrade={setGrade}
                    institution={institution}
                    setInstitution={setInstitution}
                    // Previous Actions
                    hasNotes={hasNotes}
                    setHasNotes={setHasNotes}
                    hasViews={hasViews}
                    setHasViews={setHasViews}
                    hasTags={hasTags}
                    setHasTags={setHasTags}
                    // CV Requirements
                    hasContactInfo={hasContactInfo}
                    setHasContactInfo={setHasContactInfo}
                    hasMobileConfirmed={hasMobileConfirmed}
                    setHasMobileConfirmed={setHasMobileConfirmed}
                    hasPhoto={hasPhoto}
                    setHasPhoto={setHasPhoto}
                    hasExperience={hasExperience}
                    setHasExperience={setHasExperience}
                />

                {/* RIGHT SIDE - Results */}
                <div className="flex-1 p-4 overflow-hidden">
                    {/* Results Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400 text-lg">📋</span>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {activeTab === 'search' ? 'All Candidates' : 'Scanned Candidates'}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {activeTab === 'search' 
                                        ? `${candidates.length} candidates in database${searchQuery ? ` • Filtered by "${searchQuery}"` : ''}`
                                        : `${scannedCandidates.length} from last scan`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Cards */}
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl h-[calc(100%-60px)] overflow-hidden">
                        <ProfileCards 
                            candidates={activeTab === 'search' ? candidates : scannedCandidates}
                            onRefresh={() => activeTab === 'search' ? fetchCandidates() : null}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
