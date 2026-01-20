'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface CandidateDetail {
    id: number
    name: string
    email: string
    resume_filename: string | null
    resume_text: string | null
    cv_data: any | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function DocumentDetailsPage() {
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
                    setError('Failed to load document information')
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
                <div className="text-white text-xl animate-pulse">Loading document details...</div>
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

    const cvData = candidate.cv_data
    const isSpreadsheet = cvData?.document_type === 'spreadsheet'
    const isDocument = cvData?.document_type === 'document'
    const isImage = cvData?.document_type === 'image'
    const isResume = cvData?.is_resume === true || cvData?.detected_type === 'Resume/CV'
    
    // Get document icon based on detected type
    const getDocIcon = () => {
        if (isSpreadsheet) return '📊'
        if (isImage) return '🖼️'
        const docCat = cvData?.doc_category
        if (docCat === 'invoice') return '🧾'
        if (docCat === 'quotation') return '💰'
        if (docCat === 'proposal') return '📑'
        if (docCat === 'contract') return '📝'
        if (docCat === 'report') return '📈'
        if (docCat === 'meeting_notes') return '📋'
        if (isResume) return '👤'
        return '📄'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">{getDocIcon()}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Document Details</h1>
                            <p className="text-slate-400">
                                {candidate.resume_filename || 'No attachment'} 
                                {cvData?.file_type && <span className="ml-2 px-2 py-0.5 bg-purple-600/30 text-purple-400 rounded text-sm">{cvData.file_type}</span>}
                                {cvData?.detected_type && <span className="ml-2 px-2 py-0.5 bg-cyan-600/30 text-cyan-400 rounded text-sm">{cvData.detected_type}</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {!cvData ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-slate-300 mb-2">No Attachment Data</h2>
                        <p className="text-slate-500">This email did not have any parseable attachments.</p>
                    </div>
                ) : isSpreadsheet ? (
                    <SpreadsheetView data={cvData} />
                ) : isImage ? (
                    <ImageOCRView data={cvData} resumeText={candidate.resume_text} />
                ) : isDocument && isResume ? (
                    <DocumentView data={cvData} resumeText={candidate.resume_text} />
                ) : isDocument ? (
                    <GenericDocumentView data={cvData} resumeText={candidate.resume_text} />
                ) : (
                    <LegacyDocumentView data={cvData} resumeText={candidate.resume_text} />
                )}
            </div>
        </div>
    )
}

// Spreadsheet View Component (CSV/Excel)
function SpreadsheetView({ data }: { data: any }) {
    const [showAll, setShowAll] = useState(false)
    const columns = data.columns || []
    const records = showAll ? (data.all_records || []) : (data.sample_records || [])

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400">{data.record_count || 0}</div>
                    <div className="text-slate-400 text-sm">Total Rows</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-cyan-400">{columns.length}</div>
                    <div className="text-slate-400 text-sm">Columns</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-emerald-400">{data.file_type}</div>
                    <div className="text-slate-400 text-sm">File Type</div>
                </div>
            </div>

            {/* Column Names */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">📋 Detected Columns ({columns.length} total)</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {columns.map((col: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">
                            {col}
                        </span>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800/90 backdrop-blur z-10">
                    <h3 className="text-lg font-semibold text-white">
                        📊 Data Preview 
                        <span className="text-sm font-normal text-slate-400 ml-2">
                            (Showing {records.length} of {data.record_count} rows × {columns.length} columns)
                        </span>
                    </h3>
                    {data.record_count > 10 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-4 py-1.5 bg-purple-600/30 text-purple-400 rounded-lg text-sm hover:bg-purple-600/50 transition-colors"
                        >
                            {showAll ? 'Show Less' : `Show All ${data.record_count} Rows`}
                        </button>
                    )}
                </div>
                {/* Scrollable table container - both horizontal and vertical */}
                <div className={`overflow-auto ${showAll ? 'max-h-[70vh]' : ''}`}>
                    <table className="text-sm min-w-full">
                        <thead className="bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-slate-400 font-medium sticky left-0 bg-slate-700 z-10">#</th>
                                {columns.map((col: string, i: number) => (
                                    <th key={i} className="px-4 py-3 text-left text-slate-400 font-medium whitespace-nowrap min-w-[120px]">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {records.map((record: any, rowIndex: number) => (
                                <tr key={rowIndex} className="hover:bg-slate-700/30">
                                    <td className="px-4 py-3 text-slate-500 sticky left-0 bg-slate-800/90">{rowIndex + 1}</td>
                                    {columns.map((col: string, colIndex: number) => (
                                        <td key={colIndex} className="px-4 py-3 text-slate-300 whitespace-nowrap max-w-[300px] truncate" title={record[col] || ''}>
                                            {record[col] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// Image OCR View Component
function ImageOCRView({ data, resumeText }: { data: any, resumeText: string | null }) {
    const ocrResults = data.ocr_results || []
    const extractedContacts = data.extracted_contacts || {}
    
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400">{data.text_blocks || 0}</div>
                    <div className="text-slate-400 text-sm">Text Blocks Detected</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-cyan-400">{data.average_confidence || 0}%</div>
                    <div className="text-slate-400 text-sm">Average Confidence</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-emerald-400">{extractedContacts.emails?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Emails Found</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-orange-400">{extractedContacts.phones?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Phones Found</div>
                </div>
            </div>

            {/* Extracted Contacts */}
            {(extractedContacts.emails?.length > 0 || extractedContacts.phones?.length > 0) && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📇 Extracted Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {extractedContacts.emails?.length > 0 && (
                            <div>
                                <div className="text-slate-400 text-sm mb-2">📧 Emails</div>
                                <div className="flex flex-wrap gap-2">
                                    {extractedContacts.emails.map((email: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                                            {email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {extractedContacts.phones?.length > 0 && (
                            <div>
                                <div className="text-slate-400 text-sm mb-2">📞 Phone Numbers</div>
                                <div className="flex flex-wrap gap-2">
                                    {extractedContacts.phones.map((phone: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm">
                                            {phone}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* OCR Text Blocks */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">🔍 OCR Detected Text</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ocrResults.map((result: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-2 bg-slate-900/50 rounded-lg">
                            <span className="text-slate-500 text-xs font-mono w-6">{i + 1}</span>
                            <span className="text-slate-300 flex-1">{result.text}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                                result.confidence >= 90 ? 'bg-green-600/20 text-green-400' :
                                result.confidence >= 70 ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-red-600/20 text-red-400'
                            }`}>
                                {result.confidence}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Extracted Text */}
            {data.full_text && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📝 Full Extracted Text</h3>
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {data.full_text}
                    </pre>
                </div>
            )}

            {/* Error Display */}
            {data.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">❌ OCR Error</h3>
                    <p className="text-red-300">{data.error}</p>
                </div>
            )}
        </div>
    )
}

// Generic Document View (Invoice, Report, Contract, etc.)
function GenericDocumentView({ data, resumeText }: { data: any, resumeText: string | null }) {
    const extractedContacts = data.extracted_contacts || {}
    
    return (
        <div className="space-y-6">
            {/* Document Type Banner */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">
                        {data.doc_category === 'invoice' ? '🧾' :
                         data.doc_category === 'quotation' ? '💰' :
                         data.doc_category === 'proposal' ? '📑' :
                         data.doc_category === 'contract' ? '📝' :
                         data.doc_category === 'report' ? '📈' :
                         data.doc_category === 'meeting_notes' ? '📋' : '📄'}
                    </span>
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-400">{data.detected_type || 'Document'}</h3>
                        <p className="text-slate-400 text-sm">This document was auto-detected as a non-resume file</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400">{data.word_count || 0}</div>
                    <div className="text-slate-400 text-sm">Words</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-cyan-400">{data.char_count || 0}</div>
                    <div className="text-slate-400 text-sm">Characters</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-emerald-400">{data.dates_found?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Dates Found</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-3xl font-bold text-orange-400">{data.amounts_found?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Amounts Found</div>
                </div>
            </div>

            {/* Extracted Contacts */}
            {(extractedContacts.emails?.length > 0 || extractedContacts.phones?.length > 0) && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📇 Extracted Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {extractedContacts.emails?.length > 0 && (
                            <div>
                                <div className="text-slate-400 text-sm mb-2">📧 Emails</div>
                                <div className="flex flex-wrap gap-2">
                                    {extractedContacts.emails.map((email: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                                            {email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {extractedContacts.phones?.length > 0 && (
                            <div>
                                <div className="text-slate-400 text-sm mb-2">📞 Phone Numbers</div>
                                <div className="flex flex-wrap gap-2">
                                    {extractedContacts.phones.map((phone: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm">
                                            {phone}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dates Found */}
            {data.dates_found?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📅 Dates Found</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.dates_found.map((date: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm">
                                {date}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Amounts Found */}
            {data.amounts_found?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">💰 Amounts Found</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.amounts_found.map((amount: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm font-mono">
                                {amount}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Summary */}
            {data.summary && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📝 Document Preview</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                        {data.summary}
                    </p>
                </div>
            )}

            {/* Full Document Text */}
            {resumeText && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📄 Full Document Text</h3>
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {resumeText.slice(0, 10000)}
                        {resumeText.length > 10000 && '\n\n... [truncated]'}
                    </pre>
                </div>
            )}
        </div>
    )
}

// Regular Document View (PDF/DOCX) - Resume specific
function DocumentView({ data, resumeText }: { data: any, resumeText: string | null }) {
    return (
        <div className="space-y-6">
            {/* Resume Badge */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                        <h3 className="text-lg font-semibold text-green-400">Resume / CV Detected</h3>
                        <p className="text-slate-400 text-sm">This document was auto-detected as a resume/curriculum vitae</p>
                    </div>
                </div>
            </div>

            {/* Extracted Info Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon="👤" label="Name" value={data.personal_info?.full_name || 'Not detected'} />
                <InfoCard icon="📧" label="Email" value={data.contact_details?.email_address || 'Not detected'} />
                <InfoCard icon="📞" label="Phone" value={data.contact_details?.mobile_numbers?.join(', ') || 'Not detected'} />
                <InfoCard icon="📍" label="Location" value={data.personal_info?.current_location || 'Not detected'} />
            </div>

            {/* Position & Experience */}
            {data.position_discipline && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">💼 Position & Experience</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-slate-400 text-sm">Position</div>
                            <div className="text-white">{data.position_discipline.current_position || '-'}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Discipline</div>
                            <div className="text-white">{data.position_discipline.discipline || '-'}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Years of Experience</div>
                            <div className="text-white">{data.position_discipline.years_of_experience || '-'}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">File Type</div>
                            <div className="text-white">{data.file_type || '-'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Details */}
            {data.contact_details && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📞 Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LinkItem label="LinkedIn" value={data.contact_details.linkedin_url} />
                        <LinkItem label="Portfolio" value={data.contact_details.portfolio_link} />
                        <div className="col-span-2">
                            <div className="text-slate-400 text-sm mb-1">Phone Numbers</div>
                            <div className="flex flex-wrap gap-2">
                                {data.contact_details.mobile_numbers?.length > 0 
                                    ? data.contact_details.mobile_numbers.map((phone: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg">{phone}</span>
                                    ))
                                    : <span className="text-slate-500">No phones detected</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Work History */}
            {data.work_history && data.work_history.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">🏢 Work History</h3>
                    <div className="space-y-4">
                        {data.work_history.map((job: any, i: number) => (
                            <div key={i} className="border-l-2 border-purple-500 pl-4">
                                <div className="text-white font-medium">{job.job_title || 'Unknown Position'}</div>
                                <div className="text-slate-400 text-sm">{job.company_name} • {job.start_date} - {job.end_date || 'Present'}</div>
                                {job.responsibilities && <div className="text-slate-300 text-sm mt-1">{job.responsibilities}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Software Skills */}
            {data.software_experience && data.software_experience.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">💻 Software Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.software_experience.map((sw: any, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 rounded-lg text-sm">
                                {sw.software_name} {sw.years_experience && `(${sw.years_experience}y)`}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data.education_certifications?.education && data.education_certifications.education.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">🎓 Education</h3>
                    <div className="space-y-3">
                        {data.education_certifications.education.map((edu: any, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                                <div>
                                    <div className="text-white">{edu.degree} {edu.major && `in ${edu.major}`}</div>
                                    <div className="text-slate-400 text-sm">{edu.institution} {edu.year && `• ${edu.year}`}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Raw Text Preview */}
            {resumeText && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📝 Raw Document Text</h3>
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {resumeText.slice(0, 5000)}
                        {resumeText.length > 5000 && '\n\n... [truncated]'}
                    </pre>
                </div>
            )}
        </div>
    )
}

// Legacy view for old data without document_type
function LegacyDocumentView({ data, resumeText }: { data: any, resumeText: string | null }) {
    return (
        <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-400">⚠️ This is a legacy record. Re-scan the email to get structured document data.</p>
            </div>
            
            {/* Show whatever data exists */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Parsed Data</h3>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>

            {resumeText && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">📝 Document Text</h3>
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {resumeText.slice(0, 5000)}
                    </pre>
                </div>
            )}
        </div>
    )
}

// Helper Components
function InfoCard({ icon, label, value }: { icon: string, label: string, value: string }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
                <span>{icon}</span>
                <span className="text-slate-400 text-sm">{label}</span>
            </div>
            <div className="text-white font-medium truncate">{value}</div>
        </div>
    )
}

function LinkItem({ label, value }: { label: string, value: string }) {
    if (!value) return (
        <div>
            <div className="text-slate-400 text-sm">{label}</div>
            <div className="text-slate-500">Not detected</div>
        </div>
    )
    return (
        <div>
            <div className="text-slate-400 text-sm">{label}</div>
            <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" 
               className="text-cyan-400 hover:underline truncate block">{value}</a>
        </div>
    )
}
