'use client'

import { useState } from 'react'

interface Candidate {
    id?: number
    unique_id: string
    name: string
    email: string
    phone?: string
    email_subject?: string
    email_from?: string
    email_to?: string | null
    email_cc?: string | null
    email_date?: string | null
    resume_filename?: string | null
    notes?: string | null
    tags?: string | null
    created_at?: string
    gmail_message_id?: string
    email_body?: string
    email_signature?: string | null
    resume_path?: string
    resume_text?: string
    cv_data?: any
    extracted_phones?: string
    extracted_emails?: string
    extracted_links?: string
    recruiter_id?: number
    recruiter_name?: string
}

interface ProfileCardsProps {
    candidates: Candidate[]
    onRefresh: () => void
}

type TabType = 'general' | 'cv' | 'transport' | 'skills' | 'experience'

export default function ProfileCards({ candidates, onRefresh }: ProfileCardsProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('general')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'new'>('all')
    const [sortBy, setSortBy] = useState('newest')
    const [notes, setNotes] = useState('')

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const isNewCandidate = (candidate: Candidate) => {
        if (!candidate.created_at) return false
        const createdDate = new Date(candidate.created_at)
        const now = new Date()
        const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
        return diffInHours < 24 // Consider candidates from last 24 hours as "NEW"
    }

    const handleCardClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate)
        setActiveTab('general')
        setNotes(candidate.notes || '')
    }

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === 'all' || (filterType === 'new' && isNewCandidate(candidate))
        return matchesSearch && matchesFilter
    })

    if (candidates.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Candidates Found</h3>
                    <p className="text-gray-500">Start by scanning emails to find candidates</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* LEFT PANEL - Candidate List */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`pb-2 font-medium transition-colors ${
                                filterType === 'all'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            All Candidates
                        </button>
                        <button
                            onClick={() => setFilterType('new')}
                            className={`pb-2 font-medium transition-colors ${
                                filterType === 'new'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            New Applications
                        </button>
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sort by: Date (Newest)</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Candidates Header */}
                <div className="px-4 py-3">
                    <h3 className="text-lg font-bold text-gray-900">Candidates</h3>
                </div>

                {/* Candidate Cards */}
                <div className="flex-1 overflow-y-auto px-4">
                    <div className="space-y-3 pb-4">
                        {filteredCandidates.map((candidate) => {
                            const candidateId = candidate.id || 0
                            const isActive = selectedCandidate?.id === candidateId
                            const isNew = isNewCandidate(candidate)

                            return (
                                <div
                                    key={candidateId}
                                    onClick={() => handleCardClick(candidate)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                        isActive
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
                                        {getInitials(candidate.name || 'UN')}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">
                                            {candidate.name || 'Unknown'}
                                        </h4>
                                        <p className="text-sm text-gray-600 truncate">
                                            {candidate.email_subject || 'No subject'}
                                        </p>
                                    </div>

                                    {/* Badge */}
                                    <div className="flex items-center gap-2">
                                        {isNew ? (
                                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                                NEW
                                            </span>
                                        ) : candidate.resume_filename ? (
                                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                                CV
                                            </span>
                                        ) : null}
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Candidate Profile */}
            {selectedCandidate ? (
                <div className="flex-1 overflow-y-auto">
                    {(() => {
                        // Parse cv_data if it's a string
                        let cvData = selectedCandidate.cv_data || {}
                        if (typeof cvData === 'string') {
                            try {
                                cvData = JSON.parse(cvData)
                            } catch (e) {
                                cvData = {}
                            }
                        }
                        const personalInfo = cvData.personal_info || {}
                        const professionalInfo = cvData.professional_info || {}

                        return (
                            <div className="max-w-4xl mx-auto p-8">
                                {/* Header */}
                                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                                    Candidate Profile: {personalInfo.name || selectedCandidate.name || 'Unknown'}
                                </h1>

                                {/* Profile Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                                    <div className="flex items-start gap-6 mb-8">
                                        {/* Profile Photo */}
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                                            {getInitials(selectedCandidate.name || 'UN')}
                                        </div>

                                        {/* Basic Info */}
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {personalInfo.name || selectedCandidate.name || 'Unknown'}
                                            </h2>
                                            <p className="text-gray-600 mb-3">
                                                {professionalInfo.current_position || selectedCandidate.email_subject || 'Position not specified'}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                    <span>{personalInfo.email || selectedCandidate.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                    </svg>
                                                    <span>{personalInfo.phone || 'Not provided'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{personalInfo.location || 'Not specified'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-6 border-b border-gray-200 mb-6">
                                        <button
                                            onClick={() => setActiveTab('general')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'general'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            General Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('cv')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'cv'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            CV
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('transport')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'transport'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Transport Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('skills')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'skills'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Skills
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('experience')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'experience'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Experience
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div>
                                        {/* General Info Tab */}
                                        {activeTab === 'general' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            {personalInfo.email || selectedCandidate.email || 'Not provided'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                                            <span>{personalInfo.phone || 'Not provided'}</span>
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                                            <span>{personalInfo.location || 'Not specified'}</span>
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                                            <span>Not specified</span>
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                                                            <span>Available</span>
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Email Information */}
                                                <div className="border-t border-gray-200 pt-4 mt-6">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Email Information</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Subject:</span>
                                                            <p className="text-gray-900 mt-1">{selectedCandidate.email_subject || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">From:</span>
                                                            <p className="text-gray-900 mt-1">{selectedCandidate.email_from || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Date:</span>
                                                            <p className="text-gray-900 mt-1">
                                                                {selectedCandidate.email_date 
                                                                    ? new Date(selectedCandidate.email_date).toLocaleDateString() 
                                                                    : 'None'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Attachment:</span>
                                                            <p className="text-gray-900 mt-1">{selectedCandidate.resume_filename || 'None'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                <div className="border-t border-gray-200 pt-4 mt-6">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Notes:</h4>
                                                    <textarea
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder="Add your notes about this candidate..."
                                                        className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* CV Tab */}
                                        {activeTab === 'cv' && (
                                            <div className="space-y-6">
                                                {/* Personal Information */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Full Name:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{personalInfo.name || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Email:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{personalInfo.email || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Phone:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{personalInfo.phone || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Date of Birth:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{personalInfo.dob || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Location:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{personalInfo.location || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">LinkedIn:</span>
                                                            {personalInfo.linkedin ? (
                                                                <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
                                                                   target="_blank" rel="noopener noreferrer"
                                                                   className="text-orange-600 mt-1 font-medium hover:underline block">
                                                                    {personalInfo.linkedin}
                                                                </a>
                                                            ) : (
                                                                <p className="text-gray-900 mt-1 font-medium">None</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Professional Information */}
                                                <div className="border-t border-gray-200 pt-4">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Years of Experience:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{professionalInfo.years_experience || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">GCC Experience:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{professionalInfo.gcc_experience || 'None'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Willing to Relocate:</span>
                                                            <p className="text-gray-900 mt-1 font-medium">{professionalInfo.willing_to_relocate || 'None'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Education */}
                                                {cvData.education && cvData.education.length > 0 && (
                                                    <div className="border-t border-gray-200 pt-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                                                        <div className="space-y-3">
                                                            {cvData.education.map((edu: any, index: number) => (
                                                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                                    <div className="font-medium text-gray-900">
                                                                        {edu.degree} {edu.major && `in ${edu.major}`}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mt-1">{edu.institution}</div>
                                                                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                                        {edu.year && <span>Year: {edu.year}</span>}
                                                                        {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Certifications */}
                                                {cvData.certifications && cvData.certifications.length > 0 && (
                                                    <div className="border-t border-gray-200 pt-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                                                        <div className="space-y-2">
                                                            {cvData.certifications.map((cert: any, index: number) => (
                                                                <div key={index} className="flex items-start gap-2">
                                                                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="text-gray-900">
                                                                        {typeof cert === 'string' ? cert : cert.name || cert.title || 'Certification'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Skills Tab */}
                                        {activeTab === 'skills' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4">Skills</h4>
                                                {cvData.skills && cvData.skills.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {cvData.skills.map((skill: string, index: number) => (
                                                            <span key={index} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No skills listed</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Experience Tab */}
                                        {activeTab === 'experience' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4">Work Experience</h4>
                                                {cvData.work_history && cvData.work_history.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {cvData.work_history.map((job: any, index: number) => (
                                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                                                                <div className="font-semibold text-gray-900 mb-1">
                                                                    {job.job_title || 'Position not specified'}
                                                                </div>
                                                                <div className="text-gray-700 mb-2">{job.company || job.company_name || 'Company not specified'}</div>
                                                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                                    <span>{job.start_date || 'Start date not specified'} - {job.end_date || 'Present'}</span>
                                                                    {job.duration && <span>• {job.duration}</span>}
                                                                    {job.location && <span>• {job.location}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No work history available</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Transport Info Tab */}
                                        {activeTab === 'transport' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4">Transport Information</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Has Own Vehicle</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            Not specified
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            Not specified
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4">
                                    <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                                        Reject
                                    </button>
                                    <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                                        Move to Interview
                                    </button>
                                </div>
                            </div>
                        )
                    })()}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Candidate Selected</h3>
                        <p className="text-gray-500">Select a candidate from the list to view their profile</p>
                    </div>
                </div>
            )}
        </div>
    )
}