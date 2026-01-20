'use client'

import { useState } from 'react'

interface EmailSearchFilterProps {
    onSearch: (query: string) => void
    onScan: (query?: string) => void
    isLoading: boolean
}

export default function EmailSearchFilter({ onSearch, onScan, isLoading }: EmailSearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(true)
    
    // Filter selections (not instant - user builds query first)
    const [selectedKeyword, setSelectedKeyword] = useState('')
    const [customKeyword, setCustomKeyword] = useState('')
    const [selectedTimeRange, setSelectedTimeRange] = useState('')
    const [selectedAttachment, setSelectedAttachment] = useState('')
    const [selectedSource, setSelectedSource] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchQuery)
    }

    // Keyword options
    const keywordOptions = [
        { label: 'None (All Emails)', value: '', query: '' },
        { label: 'Job/Recruitment', value: 'job', query: 'subject:(job OR application OR resume OR cv OR hiring OR vacancy OR career OR candidate OR role OR position OR developer OR engineer OR opportunity OR opening OR recruitment OR interview)' },
        { label: 'Sales', value: 'sales', query: 'subject:(sales OR quotation OR proposal OR pricing OR order OR deal)' },
        { label: 'Marketing', value: 'marketing', query: 'subject:(marketing OR campaign OR leads OR promotion OR newsletter)' },
        { label: 'Invoices/Billing', value: 'invoice', query: 'subject:(invoice OR payment OR bill OR receipt OR amount OR due)' },
        { label: 'Reports', value: 'reports', query: 'subject:(report OR analysis OR summary OR review OR monthly OR weekly)' },
        { label: 'Projects', value: 'projects', query: 'subject:(project OR milestone OR deliverable OR deadline OR update)' },
        { label: 'Meetings', value: 'meetings', query: 'subject:(meeting OR call OR schedule OR agenda OR invite)' },
        { label: 'Custom...', value: 'custom', query: '' },
    ]

    // Time range options
    const timeRangeOptions = [
        { label: 'All Time', value: '', query: '' },
        { label: 'Today', value: 'today', query: 'newer_than:1d' },
        { label: 'Last 3 Days', value: '3days', query: 'newer_than:3d' },
        { label: 'Last 7 Days', value: '7days', query: 'newer_than:7d' },
        { label: 'Last 30 Days', value: '30days', query: 'newer_than:30d' },
        { label: 'Last 3 Months', value: '3months', query: 'newer_than:90d' },
        { label: 'Last 6 Months', value: '6months', query: 'newer_than:180d' },
        { label: 'Last Year', value: 'year', query: 'newer_than:365d' },
    ]

    // Attachment options
    const attachmentOptions = [
        { label: 'Any (With or Without)', value: '', query: '' },
        { label: 'Must Have Attachment', value: 'any', query: 'has:attachment' },
        { label: 'PDF Files Only', value: 'pdf', query: 'has:attachment filename:pdf' },
        { label: 'Excel Files Only', value: 'excel', query: 'has:attachment (filename:xlsx OR filename:xls OR filename:csv)' },
        { label: 'Word Docs Only', value: 'word', query: 'has:attachment (filename:doc OR filename:docx)' },
        { label: 'Images Only', value: 'images', query: 'has:attachment (filename:jpg OR filename:png OR filename:jpeg)' },
    ]

    // Source options
    const sourceOptions = [
        { label: 'Any Source', value: '', query: '' },
        { label: 'From LinkedIn', value: 'linkedin', query: 'from:linkedin' },
        { label: 'From Indeed', value: 'indeed', query: 'from:indeed' },
        { label: 'From Naukri', value: 'naukri', query: 'from:naukri' },
        { label: 'From Monster', value: 'monster', query: 'from:monster' },
        { label: 'From Glassdoor', value: 'glassdoor', query: 'from:glassdoor' },
    ]

    // Status options
    const statusOptions = [
        { label: 'Any Status', value: '', query: '' },
        { label: 'Unread Only', value: 'unread', query: 'is:unread' },
        { label: 'Starred Only', value: 'starred', query: 'is:starred' },
        { label: 'Important Only', value: 'important', query: 'is:important' },
    ]

    // Build the combined query from all selections
    const buildQuery = () => {
        const parts: string[] = []
        
        // Add keyword filter
        if (selectedKeyword === 'custom' && customKeyword.trim()) {
            parts.push(`subject:(${customKeyword.trim()})`)
        } else if (selectedKeyword) {
            const opt = keywordOptions.find(o => o.value === selectedKeyword)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Add time range
        if (selectedTimeRange) {
            const opt = timeRangeOptions.find(o => o.value === selectedTimeRange)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Add attachment filter
        if (selectedAttachment) {
            const opt = attachmentOptions.find(o => o.value === selectedAttachment)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Add source filter
        if (selectedSource) {
            const opt = sourceOptions.find(o => o.value === selectedSource)
            if (opt?.query) parts.push(opt.query)
        }
        
        // Add status filter
        if (selectedStatus) {
            const opt = statusOptions.find(o => o.value === selectedStatus)
            if (opt?.query) parts.push(opt.query)
        }
        
        return parts.join(' ')
    }

    // Execute the scan with built query
    const handleBuildAndScan = () => {
        const query = buildQuery()
        onScan(query || undefined)
    }

    // Reset all filters
    const handleReset = () => {
        setSelectedKeyword('')
        setCustomKeyword('')
        setSelectedTimeRange('')
        setSelectedAttachment('')
        setSelectedSource('')
        setSelectedStatus('')
    }

    // Count active filters
    const activeFilterCount = [
        selectedKeyword,
        selectedTimeRange,
        selectedAttachment,
        selectedSource,
        selectedStatus
    ].filter(Boolean).length

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            {/* Search existing records */}
            <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">🔍 Search Saved Records</h3>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search existing records by name, email, or subject..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-700"></div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Scan New Emails from Gmail
                </button>
                <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Advanced scan options - Multi-Select Filters */}
            {showAdvanced && (
                <div className="space-y-5 animate-fade-in">
                    
                    {/* Filter Builder */}
                    <div className="bg-linear-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-700/50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-emerald-300">📧 Build Your Email Query</h3>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    Reset All
                                </button>
                            )}
                        </div>
                        
                        {/* Filter Dropdowns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            
                            {/* Keywords */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">📌 Keywords</label>
                                <select
                                    value={selectedKeyword}
                                    onChange={(e) => setSelectedKeyword(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    {keywordOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {selectedKeyword === 'custom' && (
                                    <input
                                        type="text"
                                        value={customKeyword}
                                        onChange={(e) => setCustomKeyword(e.target.value)}
                                        placeholder="Enter custom keyword..."
                                        className="w-full mt-2 px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                )}
                            </div>
                            
                            {/* Time Range */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">📅 Time Range</label>
                                <select
                                    value={selectedTimeRange}
                                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    {timeRangeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Attachments */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">📎 Attachments</label>
                                <select
                                    value={selectedAttachment}
                                    onChange={(e) => setSelectedAttachment(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    {attachmentOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Source */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">📧 Email Source</label>
                                <select
                                    value={selectedSource}
                                    onChange={(e) => setSelectedSource(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    {sourceOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">📌 Email Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-900/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Query Preview */}
                        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-500">Generated Query:</span>
                                {activeFilterCount > 0 && (
                                    <span className="text-xs text-emerald-400">{activeFilterCount} filter(s) active</span>
                                )}
                            </div>
                            <code className="text-sm text-emerald-300 font-mono break-all">
                                {buildQuery() || '(no filters - will scan all emails)'}
                            </code>
                        </div>
                        
                        {/* Scan Button */}
                        <button
                            onClick={handleBuildAndScan}
                            disabled={isLoading}
                            className="w-full py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Scanning Gmail...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    🚀 Build & Scan Gmail
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Help Section */}
                    <div className="bg-slate-900/30 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">💡 Tips for Better Results</h4>
                        <ul className="text-xs text-slate-500 space-y-1">
                            <li>• <strong>Keywords</strong> search in email subjects for precise matching</li>
                            <li>• Combine <strong>Time Range + Attachments</strong> to find recent documents</li>
                            <li>• Use <strong>Source</strong> filter to get emails from specific job portals</li>
                            <li>• <strong>Custom keyword</strong> lets you search for any specific term</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
