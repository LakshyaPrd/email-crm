'use client'

import { Candidate } from '@/app/page'

interface CandidatesTableProps {
  candidates: Candidate[]
  isLoading: boolean
  onRefresh: () => void
  onViewEmail: (candidateId: number) => void
  onViewEmailInfo: (candidateId: number) => void
  onViewCVInfo: (candidateId: number) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function CandidatesTable({ 
  candidates, 
  isLoading, 
  onRefresh, 
  onViewEmail,
  onViewEmailInfo,
  onViewCVInfo
}: CandidatesTableProps) {
  
  const downloadResume = (candidateId: number, filename: string) => {
    const link = document.createElement('a')
    link.href = `${API_URL}/resume/${candidateId}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (candidates.length === 0 && !isLoading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-3xl p-16 text-center">
        <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-white mb-2">No emails found</h3>
        <p className="text-slate-400">Use the scan feature above to fetch emails from Gmail</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Emails
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium">
            {candidates.length}
          </span>
        </h2>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Resume</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {candidates.map((candidate) => (
                <tr 
                  key={candidate.id} 
                  className="hover:bg-indigo-500/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{candidate.name}</span>
                      <span className="text-sm text-slate-400">{candidate.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 line-clamp-2">{candidate.email_subject}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                    {formatDate(candidate.email_date || candidate.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    {candidate.resume_filename ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadResume(candidate.id, candidate.resume_filename!)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-all"
                        title="Download Resume"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">No resume</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* See Email Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewEmail(candidate.id)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all"
                        title="View Full Email"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </button>

                      {/* Email Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewEmailInfo(candidate.id)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm transition-all"
                        title="View Email Info"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Info
                      </button>

                      {/* Document Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewCVInfo(candidate.id)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-all"
                        title="View Document Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Doc
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
