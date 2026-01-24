'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface CandidateDetail {
    id: number
    name: string
    email: string
    resume_filename: string | null
    resume_text: string | null
    cv_data: any | null
    gmail_thread_id: string | null
    source_email: any | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type TabType = 'notes' | 'tags' | 'email' | 'cv'

export default function CandidateProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('cv')
    const [notes, setNotes] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const response = await fetch(`${API_URL}/candidates/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setCandidate(data)
                    // Initialize with existing data if available
                    setNotes(data.notes || '')
                    setTags(data.tags || [])
                } else {
                    setError('Failed to load candidate information')
                }
            } catch (err) {
                setError('Failed to connect to server')
            } finally {
                setLoading(false)
            }
        }
        fetchCandidate()
    }, [params.id])

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600 text-xl animate-pulse">Loading candidate profile...</div>
            </div>
        )
    }

    if (error || !candidate) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600 text-xl">{error || 'Candidate not found'}</div>
            </div>
        )
    }

    const cvData = candidate.cv_data || {}
    const personalInfo = cvData.personal_info || {}
    const professionalInfo = cvData.professional_info || {}
    const contactDetails = cvData.contact_details || {}
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                    <span>←</span> Back to Candidates
                </button>

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Profile Photo with Status */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shrink-0 shadow-lg">
                                {(personalInfo.name || candidate.name || 'U')[0].toUpperCase()}
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                        
                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {personalInfo.name || candidate.name || 'Unknown Candidate'}
                                </h1>
                                {/* Verification Badge */}
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-600 mb-4">
                                {professionalInfo.current_position || 'Position not specified'}
                            </p>
                            
                            {/* Contact Info Row */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {(personalInfo.email || candidate.email) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600">📧</span>
                                        <span>{personalInfo.email || candidate.email}</span>
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

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                                activeTab === 'notes'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            📝 Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('tags')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                                activeTab === 'tags'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            🏷️ Tags
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                                activeTab === 'email'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            📧 Email Info
                        </button>
                        <button
                            onClick={() => setActiveTab('cv')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                                activeTab === 'cv'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            👤 CV Info
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add your notes about this candidate..."
                                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Save Notes
                            </button>
                        </div>
                    )}

                    {/* Tags Tab */}
                    {activeTab === 'tags' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
                            
                            {/* Tag Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add a tag..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={addTag}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Tag
                                </button>
                            </div>

                            {/* Tags Display */}
                            <div className="flex flex-wrap gap-2">
                                {tags.length > 0 ? (
                                    tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2"
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
                                    <p className="text-gray-500 italic">No tags added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Email Info Tab */}
                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Information</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Subject</label>
                                    <p className="text-gray-900 mt-1">
                                        {candidate.source_email?.subject || 'No subject available'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">From</label>
                                    <p className="text-gray-900 mt-1">
                                        {candidate.source_email?.from || candidate.email || 'Unknown sender'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Received Date</label>
                                    <p className="text-gray-900 mt-1">
                                        {candidate.source_email?.date || 'Date not available'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Attachments</label>
                                    <p className="text-gray-900 mt-1">
                                        {candidate.resume_filename || 'No attachments'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Email Body</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {candidate.source_email?.body || 'Email body not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CV Info Tab */}
                    {activeTab === 'cv' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Information</h2>

                            {/* Work History */}
                            {cvData.work_history && cvData.work_history.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🏢 Work Experience</h3>
                                    <div className="space-y-4">
                                        {cvData.work_history.map((job: any, index: number) => (
                                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <div className="font-semibold text-gray-900">
                                                    {job.job_title || 'Position not specified'}
                                                </div>
                                                <div className="text-gray-700">
                                                    {job.company_name || 'Company not specified'}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {job.start_date} - {job.end_date || 'Present'}
                                                </div>
                                                {job.responsibilities && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {job.responsibilities}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {cvData.education && cvData.education.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🎓 Education</h3>
                                    <div className="space-y-3">
                                        {cvData.education.map((edu: any, index: number) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {edu.degree} {edu.major && `in ${edu.major}`}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {edu.institution} {edu.year && `• ${edu.year}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {cvData.skills && cvData.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">💡 Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cvData.skills.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certifications */}
                            {cvData.certifications && cvData.certifications.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">📜 Certifications</h3>
                                    <div className="space-y-2">
                                        {cvData.certifications.map((cert: any, index: number) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <span className="text-blue-600">✓</span>
                                                <span className="text-gray-900">
                                                    {typeof cert === 'string' ? cert : cert.name || cert.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Links */}
                            {(personalInfo.linkedin || personalInfo.github) && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🔗 Links</h3>
                                    <div className="space-y-2">
                                        {personalInfo.linkedin && (
                                            <a
                                                href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <span>🔗</span>
                                                LinkedIn Profile
                                            </a>
                                        )}
                                        {personalInfo.github && (
                                            <a
                                                href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <span>🔗</span>
                                                GitHub Profile
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* No CV Data */}
                            {!cvData.work_history && !cvData.education && !cvData.skills && !cvData.certifications && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📄</div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No CV Data Available</h3>
                                    <p className="text-gray-500">
                                        CV information could not be extracted from this candidate's resume.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
