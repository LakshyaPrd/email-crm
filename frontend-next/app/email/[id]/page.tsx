'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface CandidateDetail {
    id: number
    name: string
    email: string
    phone: string | null
    email_subject: string
    email_from: string | null
    email_to: string | null
    email_cc: string | null
    email_body: string | null
    email_signature: string | null
    email_date: string | null
    extracted_phones: string | null
    extracted_emails: string | null
    extracted_links: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function EmailInfoPage() {
    const params = useParams()
    const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const response = await fetch(`${API_URL}/candidates/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setCandidate(data)
                } else {
                    setError('Failed to load email information')
                }
            } catch (err) {
                setError('Failed to connect to server')
            } finally {
                setLoading(false)
            }
        }
        fetchCandidate()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    if (error || !candidate) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-red-400 text-xl">{error || 'Not found'}</div>
            </div>
        )
    }

    // Parse extracted data
    const phones = candidate.extracted_phones ? JSON.parse(candidate.extracted_phones) : []
    const emails = candidate.extracted_emails ? JSON.parse(candidate.extracted_emails) : []
    const links = candidate.extracted_links ? JSON.parse(candidate.extracted_links) : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Email Information</h1>
                            <p className="text-slate-400">Extracted contact details and metadata</p>
                        </div>
                    </div>
                </div>

                {/* Email Headers */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-amber-400">📧</span> Email Headers
                    </h2>
                    <div className="space-y-3">
                        <div className="flex">
                            <span className="w-24 text-slate-500 font-medium">Subject:</span>
                            <span className="text-white flex-1">{candidate.email_subject || 'No subject'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 text-slate-500 font-medium">From:</span>
                            <span className="text-emerald-400 flex-1">{candidate.email_from || 'Unknown'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-24 text-slate-500 font-medium">To:</span>
                            <span className="text-white flex-1">{candidate.email_to || 'Unknown'}</span>
                        </div>
                        {candidate.email_cc && (
                            <div className="flex">
                                <span className="w-24 text-slate-500 font-medium">CC:</span>
                                <span className="text-white flex-1">{candidate.email_cc}</span>
                            </div>
                        )}
                        <div className="flex">
                            <span className="w-24 text-slate-500 font-medium">Date:</span>
                            <span className="text-white flex-1">
                                {candidate.email_date ? new Date(candidate.email_date).toLocaleString() : 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Extracted Contact Information */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-emerald-400">📱</span> Extracted Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phones */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Phone Numbers</h3>
                            {phones.length > 0 ? (
                                <div className="space-y-1">
                                    {phones.map((phone: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-blue-400">📞</span>
                                            <a href={`tel:${phone}`} className="text-white hover:text-blue-400 transition-colors">
                                                {phone}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No phones found</p>
                            )}
                        </div>

                        {/* Emails */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Email Addresses</h3>
                            {emails.length > 0 ? (
                                <div className="space-y-1">
                                    {emails.map((email: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-green-400">✉️</span>
                                            <a href={`mailto:${email}`} className="text-white hover:text-green-400 transition-colors">
                                                {email}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No emails found</p>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    {links.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Links Found</h3>
                            <div className="space-y-1">
                                {links.map((link: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-purple-400">🔗</span>
                                        <a 
                                            href={link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 transition-colors truncate"
                                        >
                                            {link}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Email Signature */}
                {candidate.email_signature && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">✍️</span> Email Signature
                        </h2>
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm bg-slate-900/50 p-4 rounded-lg">
                            {candidate.email_signature}
                        </pre>
                    </div>
                )}

                {/* Email Body Preview */}
                {candidate.email_body && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-400">📄</span> Email Body
                        </h2>
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                            {candidate.email_body}
                        </pre>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => window.close()}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Close Tab
                    </button>
                </div>
            </div>
        </div>
    )
}
