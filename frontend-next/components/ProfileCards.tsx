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

type TabType = 'notes' | 'tags' | 'email' | 'cv'

export default function ProfileCards({ candidates, onRefresh }: ProfileCardsProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('notes')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'new'>('all')
    const [sortBy, setSortBy] = useState('newest')
    const [notes, setNotes] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')

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
        setActiveTab('notes')
        setNotes(candidate.notes || '')
        setTags(candidate.tags ? JSON.parse(candidate.tags) : [])
    }

    const addTag = () => {
        const tag = newTag.trim()
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag])
            setNewTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
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
                                            onClick={() => setActiveTab('notes')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'notes'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            📝 Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('tags')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'tags'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            🏷️ Tags
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('email')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'email'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            📧 Email Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('cv')}
                                            className={`pb-3 font-medium transition-colors ${
                                                activeTab === 'cv'
                                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            👤 CV Details
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div>
                                        {/* Notes Tab */}
                                        {activeTab === 'notes' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add your notes about this candidate..."
                                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                                />
                                                <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                                                    Save Notes
                                                </button>
                                            </div>
                                        )}

                                        {/* Tags Tab */}
                                        {activeTab === 'tags' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                                                <div className="flex gap-2 mb-4">
                                                    <input
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                        placeholder="Add a tag..."
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                    />
                                                    <button
                                                        onClick={addTag}
                                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.length > 0 ? (
                                                        tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2"
                                                            >
                                                                {tag}
                                                                <button
                                                                    onClick={() => removeTag(tag)}
                                                                    className="text-orange-600 hover:text-orange-900 font-bold"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 italic text-sm">No tags added yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Info Tab - COMPREHENSIVE */}
                                        {activeTab === 'email' && (
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">Email Information</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Subject</label>
                                                        <p className="text-gray-900 mt-1">{selectedCandidate.email_subject || 'None'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">From</label>
                                                        <p className="text-gray-900 mt-1">{selectedCandidate.email_from || selectedCandidate.email || 'None'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">To</label>
                                                        <p className="text-gray-900 mt-1">{selectedCandidate.email_to || 'None'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">CC</label>
                                                        <p className="text-gray-900 mt-1">{selectedCandidate.email_cc || 'None'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Date</label>
                                                        <p className="text-gray-900 mt-1">
                                                            {selectedCandidate.email_date ? new Date(selectedCandidate.email_date).toLocaleString() : 'None'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Attachments</label>
                                                        <p className="text-gray-900 mt-1">{selectedCandidate.resume_filename || 'None'}</p>
                                                    </div>
                                                </div>

                                                {/* Email Body */}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Email Body</label>
                                                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                                            {selectedCandidate.email_body || 'No email body available'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Email Signature */}
                                                {selectedCandidate.email_signature && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600 mb-2 block">Signature</label>
                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedCandidate.email_signature}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Extracted Information */}
                                                {(selectedCandidate.extracted_phones || selectedCandidate.extracted_emails || selectedCandidate.extracted_links) && (
                                                    <div className="border-t border-gray-300 pt-4">
                                                        <h5 className="font-semibold text-gray-900 mb-3">Extracted Information</h5>
                                                        <div className="space-y-3">
                                                            {/* Extracted Phone Numbers */}
                                                            {selectedCandidate.extracted_phones && (
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">📞 Phone Numbers</label>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedCandidate.extracted_phones.split(',').map((phone: string, index: number) => (
                                                                            <a
                                                                                key={index}
                                                                                href={`tel:${phone.trim()}`}
                                                                                className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100 transition-colors"
                                                                            >
                                                                                {phone.trim()}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Extracted Emails */}
                                                            {selectedCandidate.extracted_emails && (
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">📧 Email Addresses</label>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedCandidate.extracted_emails.split(',').map((email: string, index: number) => (
                                                                            <a
                                                                                key={index}
                                                                                href={`mailto:${email.trim()}`}
                                                                                className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                                                                            >
                                                                                {email.trim()}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Extracted Links */}
                                                            {selectedCandidate.extracted_links && (
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">🔗 Links</label>
                                                                    <div className="flex flex-col gap-2">
                                                                        {selectedCandidate.extracted_links.split(',').map((link: string, index: number) => (
                                                                            <a
                                                                                key={index}
                                                                                href={link.trim()}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg text-sm font-medium border border-purple-200 hover:bg-purple-100 transition-colors break-all"
                                                                            >
                                                                                {link.trim()}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* CV Details Tab - COMPREHENSIVE */}
                                        {activeTab === 'cv' && (
                                            <div className="space-y-6">
                                                <h4 className="font-semibold text-gray-900 mb-3">CV Information</h4>

                                                {/* Professional Summary */}
                                                {personalInfo.summary && (
                                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                        <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span>📝</span> Professional Summary
                                                        </h5>
                                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                            {personalInfo.summary}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Personal Information */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <span>👤</span> Personal Information
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Name:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{personalInfo.name || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Email:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{personalInfo.email || selectedCandidate.email || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Phone:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{personalInfo.phone || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Location:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{personalInfo.location || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Date of Birth:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{personalInfo.dob || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">LinkedIn:</span>
                                                            <span className="ml-2 text-orange-600 font-medium">
                                                                {personalInfo.linkedin ? (
                                                                    <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                        {personalInfo.linkedin}
                                                                    </a>
                                                                ) : 'None'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Professional Information */}
                                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                    <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <span>💼</span> Professional Information
                                                    </h5>
                                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Years of Experience:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{professionalInfo.years_experience || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">GCC Experience:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{professionalInfo.gcc_experience || 'None'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Willing to Relocate:</span>
                                                            <span className="ml-2 text-gray-900 font-medium">{professionalInfo.willing_to_relocate || 'None'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Education */}
                                                {cvData.education && cvData.education.length > 0 ? (
                                                    <div>
                                                        <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span>🎓</span> Education
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {cvData.education.map((edu: any, index: number) => (
                                                                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                                                                    <div className="font-semibold text-gray-900 mb-1">
                                                                        {edu.degree || 'Degree not specified'} {edu.major && `in ${edu.major}`}
                                                                    </div>
                                                                    <div className="text-gray-700 mb-1">{edu.institution || 'Institution not specified'}</div>
                                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                                        {edu.year && <span>📅 {edu.year}</span>}
                                                                        {edu.cgpa && <span>📊 CGPA: {edu.cgpa}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic text-sm">No education information available</div>
                                                )}

                                                {/* Work History */}
                                                {cvData.work_history && cvData.work_history.length > 0 ? (
                                                    <div>
                                                        <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span>🏢</span> Work Experience
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {cvData.work_history.map((job: any, index: number) => (
                                                                <div key={index} className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-orange-500 p-4">
                                                                    <div className="font-semibold text-gray-900 mb-1">
                                                                        {job.job_title || 'Position not specified'}
                                                                    </div>
                                                                    <div className="text-gray-700 mb-2">{job.company || job.company_name || 'Company not specified'}</div>
                                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                                        <span>📅 {job.start_date || 'Start date not specified'} - {job.end_date || 'Present'}</span>
                                                                        {job.duration && <span>⏱️ {job.duration}</span>}
                                                                        {job.location && <span>📍 {job.location}</span>}
                                                                    </div>
                                                                    {job.responsibilities && (
                                                                        <p className="text-sm text-gray-600 mt-2">{job.responsibilities}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic text-sm">No work history available</div>
                                                )}

                                                {/* Skills */}
                                                {cvData.skills && cvData.skills.length > 0 ? (
                                                    <div>
                                                        <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span>💡</span> Skills
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cvData.skills.map((skill: string, index: number) => (
                                                                <span key={index} className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic text-sm">No skills listed</div>
                                                )}

                                                {/* Certifications */}
                                                {cvData.certifications && cvData.certifications.length > 0 ? (
                                                    <div>
                                                        <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span>📜</span> Certifications
                                                        </h5>
                                                        <div className="space-y-2">
                                                            {cvData.certifications.map((cert: any, index: number) => (
                                                                <div key={index} className="flex items-start gap-2 bg-white rounded-lg border border-gray-200 p-3">
                                                                    <span className="text-orange-600">✓</span>
                                                                    <span className="text-gray-900">
                                                                        {typeof cert === 'string' ? cert : cert.name || cert.title || 'Certification'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic text-sm">No certifications listed</div>
                                                )}

                                                {/* No CV Data Message */}
                                                {!cvData.education && !cvData.work_history && !cvData.skills && !cvData.certifications && (
                                                    <div className="text-center py-8">
                                                        <div className="text-5xl mb-3">📄</div>
                                                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No CV Data Available</h4>
                                                        <p className="text-gray-500 text-sm">CV information could not be extracted from this candidate's resume.</p>
                                                    </div>
                                                )}
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