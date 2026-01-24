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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ProfileCards({ candidates, onRefresh }: ProfileCardsProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('notes')
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

    if (candidates.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Candidates Found</h3>
                    <p className="text-gray-500">Start by scanning emails to find candidates</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full">
            {/* LEFT PANEL - Candidate List */}
            <div className={`${selectedCandidate ? 'w-1/3' : 'w-full'} border-r border-gray-200 overflow-y-auto pr-2 transition-all`}>
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 backdrop-blur z-10 p-3 mb-3 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">
                            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={onRefresh}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-3">
                    {candidates.map((candidate) => {
                        const candidateId = candidate.id || 0
                        const isActive = selectedCandidate?.id === candidateId

                        return (
                            <div
                                key={candidateId}
                                onClick={() => handleCardClick(candidate)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                                    isActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {getInitials(candidate.name || 'UN')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Unique ID Badge */}
                                        <div className="flex items-center gap-2 text-xs mb-1">
                                            <span className="text-gray-500 font-mono">CV ID: {candidate.unique_id || 'N/A'}</span>
                                        </div>

                                        {/* Name */}
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {candidate.name || 'Unknown'}
                                        </h3>

                                        {/* Subject as Role */}
                                        <p className="text-sm text-gray-600 truncate">
                                            {candidate.email_subject || 'No subject'}
                                        </p>

                                        {/* Meta info */}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                                            {candidate.resume_filename && (
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                                    📎 CV
                                                </span>
                                            )}
                                            <span>
                                                {candidate.email_date 
                                                    ? new Date(candidate.email_date).toLocaleDateString() 
                                                    : 'No date'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT PANEL - Professional Profile View */}
            {selectedCandidate && (
                <div className="flex-1 overflow-y-auto pl-4">
                    {(() => {
                        const cvData = selectedCandidate.cv_data || {}
                        const personalInfo = cvData.personal_info || {}
                        const professionalInfo = cvData.professional_info || {}

                        return (
                            <div className="space-y-6">
                                {/* Close Button */}
                                <button 
                                    onClick={() => setSelectedCandidate(null)}
                                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
                                >
                                    <span>×</span> Close Profile
                                </button>

                                {/* Profile Header Card */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                                    <div className="flex items-start gap-6">
                                        {/* Profile Photo with Status */}
                                        <div className="relative">
                                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shrink-0 shadow-lg">
                                                {getInitials(selectedCandidate.name || 'UN')}
                                            </div>
                                            {/* Online Status Indicator */}
                                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                        </div>
                                        
                                        {/* Basic Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h1 className="text-3xl font-bold text-gray-900">
                                                    {personalInfo.name || selectedCandidate.name || 'Unknown Candidate'}
                                                </h1>
                                                {/* Verification Badge */}
                                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-lg text-gray-600 mb-4">
                                                {professionalInfo.current_position || selectedCandidate.email_subject || 'Position not specified'}
                                            </p>
                                            
                                            {/* Contact Info Row */}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {(personalInfo.email || selectedCandidate.email) && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-600">📧</span>
                                                        <span>{personalInfo.email || selectedCandidate.email}</span>
                                                    </div>
                                                )}
                                                {personalInfo.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600">📞</span>
                                                        <span>{personalInfo.phone}</span>
                                                    </div>
                                                )}
                                                {personalInfo.location && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-600">📍</span>
                                                        <span>{personalInfo.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2">
                                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                                Hire Me
                                            </button>
                                            <button className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 font-medium">
                                                Follow
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-4 gap-6 mt-8">
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-emerald-600 text-xl">📊</span>
                                                <span className="text-emerald-600 text-3xl font-bold">
                                                    {professionalInfo.years_experience || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">Years Experience</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-blue-600 text-xl">🌍</span>
                                                <span className="text-blue-600 text-3xl font-bold">
                                                    {professionalInfo.gcc_experience || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">GCC Experience</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-purple-600 text-xl">💡</span>
                                                <span className="text-purple-600 text-3xl font-bold">
                                                    {cvData.skills?.length || 0}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">Skills</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-amber-600 text-xl">🏢</span>
                                                <span className="text-amber-600 text-3xl font-bold">
                                                    {cvData.work_history?.length || 0}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">Work History</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-200">
                                    <div className="flex border-b border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('notes')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                                                activeTab === 'notes'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            📝 Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('tags')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                                                activeTab === 'tags'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            🏷️ Tags
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('email')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                                                activeTab === 'email'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            📧 Email Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('cv')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                                                activeTab === 'cv'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            👤 CV Details
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6">
                                        {/* Notes Tab */}
                                        {activeTab === 'notes' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add your notes about this candidate..."
                                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                />
                                                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                    <button
                                                        onClick={addTag}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.length > 0 ? (
                                                        tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                                                            >
                                                                {tag}
                                                                <button
                                                                    onClick={() => removeTag(tag)}
                                                                    className="text-blue-600 hover:text-blue-900 font-bold"
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
                                                            <span className="ml-2 text-blue-600 font-medium">
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
                                                                <div key={index} className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-blue-500 p-4">
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
                                                                <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
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
                                                                    <span className="text-green-600">✓</span>
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
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}