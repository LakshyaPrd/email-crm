'use client'

import { useEffect } from 'react'
import { Candidate } from '../app/page'

interface ResumeModalProps {
  candidate: Candidate
  onClose: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ResumeModal({ candidate, onClose }: ResumeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-3xl w-[90%] max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume - {candidate.name}
          </h3>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-4">
          <iframe
            src={`${API_URL}/resume/${candidate.id}`}
            className="w-full h-full rounded-xl bg-white"
            title={`Resume of ${candidate.name}`}
          />
        </div>
      </div>
    </div>
  )
}
