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
    // Recruiter info
    recruiter_id?: number
    recruiter_name?: string
}

interface CandidateDetail extends Candidate {
    email_body_html: string | null
    email_signature: string | null
}

interface ProfileCardsProps {
    candidates: Candidate[]
    onRefresh: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ProfileCards({ candidates, onRefresh }: ProfileCardsProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [candidateDetail, setCandidateDetail] = useState<Candidate | null>(null)
    const [loading, setLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')
    const [savingNotes, setSavingNotes] = useState(false)
    const [savingTags, setSavingTags] = useState(false)
    // Blur reveal states for summaries
    const [emailSummaryRevealed, setEmailSummaryRevealed] = useState(false)
    const [cvSummaryRevealed, setCvSummaryRevealed] = useState(false)

    // Get candidate identifier
    const getCandidateKey = (candidate: Candidate): number => {
        return candidate.id || 0
    }

    // Fetch candidate details when selected
    const fetchCandidateDetail = async (id: number) => {
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/candidates/${id}`)
            if (response.ok) {
                const data = await response.json()
                setCandidateDetail(data)
                setNotes(data.notes || '')
                setTags(data.tags ? JSON.parse(data.tags) : [])
            }
        } catch (error) {
            console.error('Error fetching candidate details:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle card click
    const handleCardClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate)
        setEmailSummaryRevealed(false)
        setCvSummaryRevealed(false)
        if (candidate.id) {
            fetchCandidateDetail(candidate.id)
        }
    }

    // Close detail panel
    const closeDetailPanel = () => {
        setSelectedCandidate(null)
        setCandidateDetail(null)
        setEmailSummaryRevealed(false)
        setCvSummaryRevealed(false)
    }

    // Save notes
    const saveNotes = async () => {
        if (!candidateDetail || !candidateDetail.id) return
        setSavingNotes(true)
        try {
            await fetch(`${API_URL}/candidates/${candidateDetail.id}/notes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            })
        } catch (error) {
            console.error('Error saving notes:', error)
        } finally {
            setSavingNotes(false)
        }
    }

    // Add tag
    const addTag = async () => {
        if (!newTag.trim() || !candidateDetail || !candidateDetail.id) return
        const updatedTags = [...tags, newTag.trim()]
        setSavingTags(true)
        try {
            await fetch(`${API_URL}/candidates/${candidateDetail.id}/tags`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: updatedTags })
            })
            setTags(updatedTags)
            setNewTag('')
        } catch (error) {
            console.error('Error adding tag:', error)
        } finally {
            setSavingTags(false)
        }
    }

    // Remove tag
    const removeTag = async (tagToRemove: string) => {
        if (!candidateDetail || !candidateDetail.id) return
        const updatedTags = tags.filter(t => t !== tagToRemove)
        try {
            await fetch(`${API_URL}/candidates/${candidateDetail.id}/tags`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: updatedTags })
            })
            setTags(updatedTags)
        } catch (error) {
            console.error('Error removing tag:', error)
        }
    }

    // Download CV
    const downloadCV = async () => {
        if (!candidateDetail) return
        window.open(`${API_URL}/resume/${candidateDetail.id}`, '_blank')
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Extract info from CV data for display
    const getCandidateInfo = (cvData: any) => {
        if (!cvData) return null

        const info: any = {}

        // Location
        if (cvData.personal_info?.current_location) {
            info.location = cvData.personal_info.current_location
        }

        // Nationality
        if (cvData.personal_info?.nationality) {
            info.nationality = cvData.personal_info.nationality
        }

        // Experience
        if (cvData.position_discipline?.years_of_experience) {
            info.experience = cvData.position_discipline.years_of_experience
        }

        // Current Position
        if (cvData.position_discipline?.current_position) {
            info.position = cvData.position_discipline.current_position
        }

        return info
    }

    // Get CV data
    const cvData = candidateDetail?.cv_data
    const candidateInfo = cvData ? getCandidateInfo(cvData) : null

    return (
        <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
            {/* Left Panel - Candidate Cards List */}
            <div className={`${selectedCandidate ? 'w-1/3' : 'w-full'} border-r border-slate-700 overflow-y-auto pr-2 transition-all`}>
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 p-3 mb-3 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={onRefresh}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {candidates.map((candidate) => {
                        const candidateId = candidate.id || 0
                        const isActive = selectedCandidate && selectedCandidate.id === candidateId

                        return (
                            <div
                                key={candidateId}
                                onClick={() => handleCardClick(candidate)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    isActive
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
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
                                            <span className="text-slate-500 font-mono">CV ID: {candidate.unique_id || 'N/A'}</span>
                                        </div>

                                        {/* Name */}
                                        <h3 className="font-semibold text-white truncate">
                                            {candidate.name || 'Unknown'}
                                        </h3>

                                        {/* Subject as Role */}
                                        <p className="text-sm text-slate-400 truncate">
                                            {candidate.email_subject || 'No subject'}
                                        </p>

                                        {/* Meta info */}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 flex-wrap">
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
                                            {/* Show recruiter name */}
                                            {candidate.recruiter_name && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                                                    👤 {candidate.recruiter_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {candidates.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <div className="text-4xl mb-3">📭</div>
                            <p>No candidates found</p>
                            <p className="text-sm mt-1">Scan emails to find candidates</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Details */}
            {selectedCandidate && (
                <div className="flex-1 overflow-y-auto pl-4">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : candidateDetail ? (
                        <div className="space-y-4">
                            {/* Header with actions and Close button */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 relative">
                                {/* Close Button */}
                                <button
                                    onClick={closeDetailPanel}
                                    className="absolute top-3 right-3 w-8 h-8 bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                    title="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="flex items-start gap-4 pr-10">
                                    {/* Large Avatar */}
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                        {getInitials(candidateDetail.name || 'UN')}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                                                {candidateDetail.unique_id}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-white">{candidateDetail.name}</h2>
                                        <p className="text-slate-400">{candidateDetail.email_subject}</p>

                                        {/* Quick Info Row - Like Indeed */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
                                            {candidateInfo?.location && (
                                                <span className="text-slate-400">
                                                    <span className="text-slate-500">Location:</span> <span className="text-blue-400">{candidateInfo.location}</span>
                                                </span>
                                            )}
                                            {candidateInfo?.nationality && (
                                                <span className="text-slate-400">
                                                    <span className="text-slate-500">Nationality:</span> <span className="text-blue-400">{candidateInfo.nationality}</span>
                                                </span>
                                            )}
                                            {candidateInfo?.experience && (
                                                <span className="text-slate-400">
                                                    <span className="text-slate-500">Work experience:</span> <span className="text-blue-400">{candidateInfo.experience}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        {candidateDetail.resume_filename && (
                                            <button
                                                onClick={downloadCV}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                ⬇️ Download CV
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NOTES AND TAGS - TOP PRIORITY */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Notes Section - LEFT */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        📝 Notes
                                    </h3>

                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this candidate..."
                                        className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    />

                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={saveNotes}
                                            disabled={savingNotes}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm"
                                        >
                                            {savingNotes ? 'Saving...' : 'Save Notes'}
                                        </button>
                                    </div>
                                </div>

                                {/* Tags Section - RIGHT */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        🏷️ Tags
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {tags.map((tag, i) => (
                                            <span 
                                                key={i} 
                                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {tag}
                                                <button 
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-400 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        {tags.length === 0 && (
                                            <span className="text-slate-500 text-sm">No tags added</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Add a tag..."
                                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={addTag}
                                            disabled={!newTag.trim() || savingTags}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* DETAILED INFORMATION WITH BLUR EFFECT */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Left Column - Email Info */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        📧 Email Information
                                    </h3>

                                    <div 
                                        className={`relative cursor-pointer ${!emailSummaryRevealed ? 'blur-sm select-none' : ''}`}
                                        onClick={() => setEmailSummaryRevealed(true)}
                                    >
                                        {!emailSummaryRevealed && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 rounded z-10">
                                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                                    👁️ Click to Reveal
                                                </span>
                                            </div>
                                        )}

                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <span className="text-slate-500">From:</span>
                                                <p className="text-slate-300">{candidateDetail.email_from || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">To:</span>
                                                <p className="text-slate-300">{candidateDetail.email_to || 'N/A'}</p>
                                            </div>
                                            {candidateDetail.email_cc && (
                                                <div>
                                                    <span className="text-slate-500">CC:</span>
                                                    <p className="text-slate-300">{candidateDetail.email_cc}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-slate-500">Date:</span>
                                                <p className="text-slate-300">
                                                    {candidateDetail.email_date 
                                                        ? new Date(candidateDetail.email_date).toLocaleString()
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Subject:</span>
                                                <p className="text-slate-300">{candidateDetail.email_subject}</p>
                                            </div>

                                            {/* Email Body Preview */}
                                            {candidateDetail.email_body && (
                                                <div className="mt-4">
                                                    <span className="text-slate-500">Message:</span>
                                                    <div className="mt-2 p-3 bg-slate-900/50 rounded-lg text-slate-300 text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                                                        {candidateDetail.email_body.slice(0, 500)}
                                                        {candidateDetail.email_body.length > 500 && '...'}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Extracted Data */}
                                            {candidateDetail.extracted_phones && JSON.parse(candidateDetail.extracted_phones).length > 0 && (
                                                <div>
                                                    <span className="text-slate-500">Phones from Email:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {JSON.parse(candidateDetail.extracted_phones).map((phone: string, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                                                                {phone}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Extracted Emails */}
                                            <div>
                                                <span className="text-slate-500">Emails from Email:</span>
                                                {candidateDetail.extracted_emails && JSON.parse(candidateDetail.extracted_emails).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {JSON.parse(candidateDetail.extracted_emails).map((email: string, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                                {email}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-xs mt-1">None</p>
                                                )}
                                            </div>

                                            {/* Extracted Links */}
                                            <div>
                                                <span className="text-slate-500">Links from Email:</span>
                                                {candidateDetail.extracted_links && JSON.parse(candidateDetail.extracted_links).length > 0 ? (
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        {JSON.parse(candidateDetail.extracted_links).slice(0, 3).map((link: string, i: number) => (
                                                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs truncate">
                                                                {link}
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-xs mt-1">None</p>
                                                )}
                                            </div>

                                            {/* Email Signature */}
                                            <div className="pt-3 border-t border-slate-700">
                                                <span className="text-slate-500">Email Signature:</span>
                                                {candidateDetail.email_signature ? (
                                                    <div className="mt-2 p-2 bg-slate-900/30 rounded text-slate-300 text-xs whitespace-pre-wrap">
                                                        {candidateDetail.email_signature}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-xs mt-1">None</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - CV Details */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        📄 CV Details
                                    </h3>

                                    <div 
                                        className={`relative cursor-pointer ${!cvSummaryRevealed ? 'blur-sm select-none' : ''}`}
                                        onClick={() => setCvSummaryRevealed(true)}
                                    >
                                        {!cvSummaryRevealed && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 rounded z-10">
                                                <span className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                                                    👁️ Click to Reveal
                                                </span>
                                            </div>
                                        )}

                                        {cvData ? (
                                            <div className="space-y-3 text-sm">
                                                {/* Name from CV */}
                                                {cvData.personal_info?.full_name && (
                                                    <div>
                                                        <span className="text-slate-500">Name:</span>
                                                        <p className="text-slate-300">{cvData.personal_info.full_name}</p>
                                                    </div>
                                                )}

                                                {/* Location */}
                                                {cvData.personal_info?.current_location && (
                                                    <div>
                                                        <span className="text-slate-500">Location:</span>
                                                        <p className="text-slate-300">{cvData.personal_info.current_location}</p>
                                                    </div>
                                                )}

                                                {/* Nationality */}
                                                {cvData.personal_info?.nationality && (
                                                    <div>
                                                        <span className="text-slate-500">Nationality:</span>
                                                        <p className="text-slate-300">{cvData.personal_info.nationality}</p>
                                                    </div>
                                                )}

                                                {/* Contact */}
                                                {cvData.contact_details && (
                                                    <>
                                                        {cvData.contact_details.email_address && (
                                                            <div>
                                                                <span className="text-slate-500">Email:</span>
                                                                <p className="text-slate-300">{cvData.contact_details.email_address}</p>
                                                            </div>
                                                        )}
                                                        {cvData.contact_details.mobile_numbers?.length > 0 && (
                                                            <div>
                                                                <span className="text-slate-500">Phone:</span>
                                                                <p className="text-slate-300">{cvData.contact_details.mobile_numbers.join(', ')}</p>
                                                            </div>
                                                        )}
                                                        {cvData.contact_details.linkedin_url && (
                                                            <div>
                                                                <span className="text-slate-500">LinkedIn:</span>
                                                                <a href={cvData.contact_details.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block truncate">
                                                                    {cvData.contact_details.linkedin_url}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Education */}
                                                {cvData.education_certifications?.education?.length > 0 && (
                                                    <div>
                                                        <span className="text-slate-500">Education:</span>
                                                        <div className="mt-1 space-y-1">
                                                            {cvData.education_certifications.education.slice(0, 3).map((edu: any, i: number) => (
                                                                <p key={i} className="text-slate-300 text-xs">
                                                                    {edu.degree} {edu.major && `in ${edu.major}`}
                                                                    {edu.institution && ` - ${edu.institution}`}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Skills */}
                                                {cvData.software_experience?.length > 0 && (
                                                    <div>
                                                        <span className="text-slate-500">Skills:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {cvData.software_experience.slice(0, 8).map((skill: any, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                                    {skill.software_name || skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Experience */}
                                                {cvData.position_discipline?.years_of_experience && (
                                                    <div>
                                                        <span className="text-slate-500">Experience:</span>
                                                        <p className="text-slate-300">{cvData.position_discipline.years_of_experience}</p>
                                                    </div>
                                                )}

                                                {/* File Type */}
                                                {cvData.file_type && (
                                                    <div className="pt-2 border-t border-slate-700">
                                                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                                                            {cvData.file_type}
                                                        </span>
                                                        {cvData.detected_type && (
                                                            <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                                                {cvData.detected_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">No CV data available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}