'use client'

import { useState, FormEvent } from 'react'

interface EmailConfigProps {
  onSubmit: (email: string) => void
  isLoading: boolean
}

export default function EmailConfig({ onSubmit, isLoading }: EmailConfigProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm shadow-2xl shadow-indigo-500/10">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/50">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Configure Email Monitoring</h2>
        <p className="text-slate-400 mb-8">Enter your Gmail address to start monitoring job applications</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@company.com"
              required
              disabled={isLoading}
              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-500/50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Configuring...</span>
              </>
            ) : (
              <>
                <span>Start Monitoring</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-300">
              <strong className="text-indigo-400">First time?</strong> Your browser will open for Gmail authorization. This is a one-time setup.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
