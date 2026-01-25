'use client'

export default function TabbedSidebar({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    handleSearch,
    fetchCandidates,
    showFilters,
    setShowFilters,
    cvFreshness,
    setCvFreshness,
    experienceYears,
    setExperienceYears,
    educationDegree,
    setEducationDegree,
    residenceLocation, 
    setResidenceLocation,
    gender, 
    setGender,
    selectedKeyword,
    setSelectedKeyword,
    customKeyword,
    setCustomKeyword,
    selectedTimeRange,
    setSelectedTimeRange,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    selectedAttachments,
    setSelectedAttachments,
    selectedSources,
    setSelectedSources,
    selectedStatuses,
    setSelectedStatuses,
    customSourceEmail,
    setCustomSourceEmail,
    attachmentDropdownRef,
    sourceDropdownRef,
    statusDropdownRef,
    attachmentDropdownOpen,
    setAttachmentDropdownOpen,
    sourceDropdownOpen,
    setSourceDropdownOpen,
    statusDropdownOpen,
    setStatusDropdownOpen,
    attachmentOptions,
    sourceOptions,
    statusOptions,
    handleScan,
    isLoading,
    scanProgress,
    keywordOptions,
    timeRangeOptions
}: any) {
    return (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'search'
                            ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    🔍 Search Database
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'scan'
                            ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    📧 Scan Emails
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'search' && (
                    <div className="p-4 space-y-4">
                        {/* Search Bar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Candidates
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Name, email, role..."
                                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-between"
                        >
                            <span>🎯 {showFilters ? 'Hide' : 'Show'} Filters</span>
                            <svg
                                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Filters Section */}
                        {showFilters && (
                            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
                                    Filter Candidates
                                </h3>

                                {/* CV Freshness */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CV Freshness
                                    </label>
                                    <select
                                        value={cvFreshness}
                                        onChange={(e) => setCvFreshness(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="all">All CVs</option>
                                        <option value="week">Within last week</option>
                                        <option value="month">Within last month</option>
                                        <option value="3months">Within last 3 months</option>
                                        <option value="6months">Within last 6 months</option>
                                    </select>
                                </div>

                                {/* Experience Years */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience (Years)
                                    </label>
                                    <select
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Any Experience</option>
                                        <option value="0-1">0-1 years (Entry Level)</option>
                                        <option value="1-3">1-3 years</option>
                                        <option value="3-5">3-5 years</option>
                                        <option value="5-10">5-10 years</option>
                                        <option value="10+">10+ years</option>
                                    </select>
                                </div>

                                {/* Education Degree */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Education Level
                                    </label>
                                    <select
                                        value={educationDegree}
                                        onChange={(e) => setEducationDegree(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Any Degree</option>
                                        <option value="high school">High School</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="bachelor">Bachelor's Degree</option>
                                        <option value="master">Master's Degree</option>
                                        <option value="phd">Ph.D.</option>
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <select
                                        value={residenceLocation}
                                        onChange={(e) => setResidenceLocation(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Any Location</option>
                                        <option value="Dubai">Dubai, UAE</option>
                                        <option value="Abu Dhabi">Abu Dhabi, UAE</option>
                                        <option value="Sharjah">Sharjah, UAE</option>
                                        <option value="India">India</option>
                                        <option value="Pakistan">Pakistan</option>
                                        <option value="Philippines">Philippines</option>
                                        <option value="Egypt">Egypt</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="USA">United States</option>
                                    </select>
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Any</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                {/* Clear Filters Button */}
                                <button
                                    onClick={() => {
                                        setCvFreshness('all')
                                        setExperienceYears('')
                                        setEducationDegree('')
                                        setResidenceLocation('')
                                        setGender('')
                                        fetchCandidates()
                                    }}
                                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Clear All Filters
                                </button>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={fetchCandidates}
                                    className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'scan' && (
                    <div className="p-4 space-y-4">
                        {/* Email Type/Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Type
                            </label>
                            <select
                                value={selectedKeyword}
                                onChange={(e) => setSelectedKeyword(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {keywordOptions.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Keyword Input */}
                        {selectedKeyword === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Keyword
                                </label>
                                <input
                                    type="text"
                                    value={customKeyword}
                                    onChange={(e) => setCustomKeyword(e.target.value)}
                                    placeholder="Enter custom search keyword..."
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Range
                            </label>
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {timeRangeOptions.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Date Range */}
                        {selectedTimeRange === 'custom' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customDateFrom}
                                        onChange={(e) => setCustomDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customDateTo}
                                        onChange={(e) => setCustomDateTo(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Attachment Types */}
                        <div ref={attachmentDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachment Types
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between"
                                >
                                    <span>
                                        {selectedAttachments.length > 0
                                            ? `${selectedAttachments.length} selected`
                                            : 'Any attachment type'}
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {attachmentDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {attachmentOptions.map((opt: any) => (
                                            <label
                                                key={opt.value}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAttachments.includes(opt.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAttachments([...selectedAttachments, opt.value])
                                                        } else {
                                                            setSelectedAttachments(selectedAttachments.filter((v: string) => v !== opt.value))
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                                />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Button */}
                        <button
                            onClick={handleScan}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Start Email Scan
                                </>
                            )}
                        </button>

                        {/* Scan Progress */}
                        {scanProgress && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-blue-900">Status:</span>
                                    <span className="text-blue-700">{scanProgress.status}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-blue-900">Progress:</span>
                                    <span className="text-blue-700">{scanProgress.processed_emails} / {scanProgress.total_emails}</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-300"
                                        style={{
                                            width: `${scanProgress.total_emails > 0 ? (scanProgress.processed_emails / scanProgress.total_emails) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-blue-700 mt-2">
                                    <div>Candidates found: <span className="font-semibold">{scanProgress.candidates_added}</span></div>
                                    <div>Skipped: <span className="font-semibold">{scanProgress.skipped}</span></div>
                                </div>
                                {scanProgress.current_subject && (
                                    <div className="text-xs text-blue-600 mt-2 truncate">
                                        Current: {scanProgress.current_subject}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
