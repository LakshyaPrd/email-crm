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
    lastVisited,
    setLastVisited,
    experienceYears,
    setExperienceYears,
    educationDegree,
    setEducationDegree,
    cvLanguage,
    setCvLanguage,
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
    timeRangeOptions,
    // Personal Information Filters
    residenceLocation, setResidenceLocation,
    nationality, setNationality,
    gender, setGender,
    ageMin, setAgeMin,
    ageMax, setAgeMax,
    languages, setLanguages,
    maritalStatus, setMaritalStatus,
    specialNeeds, setSpecialNeeds,
    // Target Job Filters
    salaryMin, setSalaryMin,
    salaryMax, setSalaryMax,
    careerLevel, setCareerLevel,
    targetJobLocation, setTargetJobLocation,
    employmentType, setEmploymentType,
    noticePeriod, setNoticePeriod,
    // Education Filters
    degree, setDegree,
    major, setMajor,
    grade, setGrade,
    institution, setInstitution,
    // Previous Actions
    hasNotes, setHasNotes,
    hasViews, setHasViews,
    hasTags, setHasTags,
    // CV Requirements
    hasContactInfo, setHasContactInfo,
    hasMobileConfirmed, setHasMobileConfirmed,
    hasPhoto, setHasPhoto,
    hasExperience, setHasExperience
}: any) {
    return (
        <div className="w-80 bg-slate-900/50 border-r border-slate-800 overflow-y-auto">
            {/* Tab Headers Side-by-Side */}
            <div className="flex border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'search'
                            ? 'bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-500'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    🔍 Search Database
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'scan'
                            ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    📧 Scan Gmail
                </button>
            </div>

            <div className="p-4">
                {/* SEARCH DATABASE TAB */}
                {activeTab === 'search' && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Name, email, role, CV ID..."
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Search
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); fetchCandidates(); }}
                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
                            >
                                Clear
                            </button>
                        )}

                        {/* Advanced Filters Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm flex items-center justify-between px-3"
                        >
                            <span>🔧 Filters</span>
                            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="space-y-2 border-t border-slate-700 pt-3">
                                {/* CV Freshness */}
                                <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white flex items-center justify-between py-2">
                                        <span>— CV Freshness</span>
                                    </summary>
                                    <div className="mt-2 space-y-1.5 pl-3">
                                        {['all', 'week', 'month', '3months', '6months'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="cvFreshness"
                                                    value={opt}
                                                    checked={cvFreshness === opt}
                                                    onChange={(e) => setCvFreshness(e.target.value)}
                                                    className="w-3.5 h-3.5"
                                                />
                                                <span>{opt === 'all' ? 'All' : opt === 'week' ? 'Within last week' : opt === 'month' ? 'Within last month' : `Within last ${opt.replace('months', ' months')}`}</span>
                                            </label>
                                        ))}
                                    </div>
                                </details>

                                {/* Past Experience */}
                                <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white flex items-center justify-between py-2">
                                        <span>+ Past Experience</span>
                                    </summary>
                                    <div className="mt-2 pl-3">
                                        <input
                                            type="text"
                                            placeholder="e.g., 5+ years"
                                            value={experienceYears}
                                            onChange={(e) => setExperienceYears(e.target.value)}
                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                        />
                                    </div>
                                </details>

                                {/* Education */}
                                <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white flex items-center justify-between py-2">
                                        <span>— Education</span>
                                    </summary>
                                    <div className="mt-2 pl-3">
                                        <label className="block text-xs text-slate-500 mb-1">Degree</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Bachelor's"
                                            value={educationDegree}
                                            onChange={(e) => setEducationDegree(e.target.value)}
                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                        />
                                    </div>
                                </details>

                                {/* Additional Information */}
                                <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white flex items-center justify-between py-2">
                                        <span>— Additional Information</span>
                                    </summary>
                                    <div className="mt-2 pl-3 space-y-2">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">CV Language</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., English"
                                                value={cvLanguage}
                                                onChange={(e) => setCvLanguage(e.target.value)}
                                                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                            />
                                        </div>
                                        
                                        {/* Personal Information Section */}
                                        <details className="group mt-3 pt-3 border-t border-slate-700">
                                            <summary className="cursor-pointer text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center justify-between py-2">
                                                <span>👤 Personal Information</span>
                                            </summary>
                                            <div className="mt-2 pl-3 space-y-2">
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Residence Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Dubai, UAE"
                                                        value={residenceLocation}
                                                        onChange={(e) => setResidenceLocation(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Nationality</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Indian"
                                                        value={nationality}
                                                        onChange={(e) => setNationality(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Gender</label>
                                                    <select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    >
                                                        <option value="">Any</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-slate-500 mb-1">Age Min</label>
                                                        <input
                                                            type="number"
                                                            placeholder="21"
                                                            value={ageMin}
                                                            onChange={(e) => setAgeMin(e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 mb-1">Age Max</label>
                                                        <input
                                                            type="number"
                                                            placeholder="45"
                                                            value={ageMax}
                                                            onChange={(e) => setAgeMax(e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Languages</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., English, Arabic"
                                                        value={languages}
                                                        onChange={(e) => setLanguages(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Marital Status</label>
                                                    <select
                                                        value={maritalStatus}
                                                        onChange={(e) => setMaritalStatus(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    >
                                                        <option value="">Any</option>
                                                        <option value="single">Single</option>
                                                        <option value="married">Married</option>
                                                        <option value="divorced">Divorced</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Special Needs</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Wheelchair accessible"
                                                        value={specialNeeds}
                                                        onChange={(e) => setSpecialNeeds(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </details>

                                        {/* Target Job Section */}
                                        <details className="group mt-3 pt-3 border-t border-slate-700">
                                            <summary className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center justify-between py-2">
                                                <span>💼 Target Job</span>
                                            </summary>
                                            <div className="mt-2 pl-3 space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-slate-500 mb-1">Min Salary</label>
                                                        <input
                                                            type="number"
                                                            placeholder="3000"
                                                            value={salaryMin}
                                                            onChange={(e) => setSalaryMin(e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 mb-1">Max Salary</label>
                                                        <input
                                                            type="number"
                                                            placeholder="10000"
                                                            value={salaryMax}
                                                            onChange={(e) => setSalaryMax(e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Career Level</label>
                                                    <select
                                                        value={careerLevel}
                                                        onChange={(e) => setCareerLevel(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    >
                                                        <option value="">Any</option>
                                                        <option value="entry">Entry Level</option>
                                                        <option value="mid">Mid Level</option>
                                                        <option value="senior">Senior</option>
                                                        <option value="executive">Executive</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Target Job Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Dubai, Abu Dhabi"
                                                        value={targetJobLocation}
                                                        onChange={(e) => setTargetJobLocation(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Employment Type</label>
                                                    <select
                                                        value={employmentType}
                                                        onChange={(e) => setEmploymentType(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    >
                                                        <option value="">Any</option>
                                                        <option value="full-time">Full Time</option>
                                                        <option value="part-time">Part Time</option>
                                                        <option value="contract">Contract</option>
                                                        <option value="freelance">Freelance</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Notice Period (days)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="30"
                                                        value={noticePeriod}
                                                        onChange={(e) => setNoticePeriod(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </details>

                                        {/* Education Details Section */}
                                        <details className="group mt-3 pt-3 border-t border-slate-700">
                                            <summary className="cursor-pointer text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center justify-between py-2">
                                                <span>🎓 Education Details</span>
                                            </summary>
                                            <div className="mt-2 pl-3 space-y-2">
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Degree</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Bachelor's, Master's"
                                                        value={degree}
                                                        onChange={(e) => setDegree(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Major/Field</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Computer Science"
                                                        value={major}
                                                        onChange={(e) => setMajor(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Grade/GPA</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., 3.5, First Class"
                                                        value={grade}
                                                        onChange={(e) => setGrade(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Institution</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., MIT, Oxford"
                                                        value={institution}
                                                        onChange={(e) => setInstitution(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </details>

                                        {/* Previous Actions Section */}
                                        <details className="group mt-3 pt-3 border-t border-slate-700">
                                            <summary className="cursor-pointer text-sm font-medium text-orange-400 hover:text-orange-300 flex items-center justify-between py-2">
                                                <span>📊 Previous Actions</span>
                                            </summary>
                                            <div className="mt-2 pl-3 space-y-2">
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasNotes}
                                                        onChange={(e) => setHasNotes(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Has Notes on CV</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasViews}
                                                        onChange={(e) => setHasViews(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Has Views on CV</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasTags}
                                                        onChange={(e) => setHasTags(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Has Tags on CV</span>
                                                </label>
                                            </div>
                                        </details>

                                        {/* CV Requirements Section */}
                                        <details className="group mt-3 pt-3 border-t border-slate-700">
                                            <summary className="cursor-pointer text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center justify-between py-2">
                                                <span>✅ Show Only CVs With</span>
                                            </summary>
                                            <div className="mt-2 pl-3 space-y-2">
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasContactInfo}
                                                        onChange={(e) => setHasContactInfo(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Contact Information</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasMobileConfirmed}
                                                        onChange={(e) => setHasMobileConfirmed(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Mobile Confirmed</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasPhoto}
                                                        onChange={(e) => setHasPhoto(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Photo Available</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasExperience}
                                                        onChange={(e) => setHasExperience(e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded"
                                                    />
                                                    <span>Experience Listed</span>
                                                </label>
                                            </div>
                                        </details>
                                    </div>
                                </details>
                                
                                {/* Apply Filters Button */}
                                <button
                                    onClick={handleSearch}
                                    className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* SCAN GMAIL TAB */}
                {activeTab === 'scan' && (
                    <div className="space-y-3">
                        {/* Email Type */}
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Email Type</label>
                            <select
                                value={selectedKeyword}
                                onChange={(e) => setSelectedKeyword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                                {keywordOptions.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {selectedKeyword === 'custom' && (
                            <div>
                                <input
                                    type="text"
                                    value={customKeyword}
                                    onChange={(e) => setCustomKeyword(e.target.value)}
                                    placeholder="Enter custom keywords..."
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500"
                                />
                            </div>
                        )}

                        {/* Time Range */}
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Time Range</label>
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                            >
                                {timeRangeOptions.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {selectedTimeRange === 'custom' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">From</label>
                                    <input
                                        type="date"
                                        value={customDateFrom}
                                        onChange={(e) => setCustomDateFrom(e.target.value)}
                                        className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">To</label>
                                    <input
                                        type="date"
                                        value={customDateTo}
                                        onChange={(e) => setCustomDateTo(e.target.value)}
                                        className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Attachment Filter */}
                        <div className="relative" ref={attachmentDropdownRef}>
                            <label className="text-xs text-slate-500 mb-1 block">Attachments</label>
                            <button
                                type="button"
                                onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm text-left flex items-center justify-between"
                            >
                                <span className={selectedAttachments.length > 0 ? 'text-white' : 'text-slate-400'}>
                                    {selectedAttachments.length === 0 
                                        ? 'Any attachment' 
                                        : `${selectedAttachments.length} selected`}
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${attachmentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {attachmentDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {attachmentOptions.map((opt: any) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2">
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
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-white">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Source Filter */}
                        <div className="relative" ref={sourceDropdownRef}>
                            <label className="text-xs text-slate-500 mb-1 block">Sources</label>
                            <button
                                type="button"
                                onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm text-left flex items-center justify-between"
                            >
                                <span className={selectedSources.length > 0 ? 'text-white' : 'text-slate-400'}>
                                    {selectedSources.length === 0 
                                        ? 'Any source' 
                                        : `${selectedSources.length} selected`}
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${sourceDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {sourceDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {sourceOptions.map((opt: any) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedSources.includes(opt.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSources([...selectedSources, opt.value])
                                                    } else {
                                                        setSelectedSources(selectedSources.filter((v: string) => v !== opt.value))
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-white">{opt.label}</span>
                                        </label>
                                    ))}
                                    <div className="p-2 border-t border-slate-700">
                                        <input
                                            type="text"
                                            value={customSourceEmail}
                                            onChange={(e) => setCustomSourceEmail(e.target.value)}
                                            placeholder="+ Custom email..."
                                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="relative" ref={statusDropdownRef}>
                            <label className="text-xs text-slate-500 mb-1 block">Email Status</label>
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm text-left flex items-center justify-between"
                            >
                                <span className={selectedStatuses.length > 0 ? 'text-white' : 'text-slate-400'}>
                                    {selectedStatuses.length === 0 
                                        ? 'Any status' 
                                        : `${selectedStatuses.length} selected`}
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {statusDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                                    {statusOptions.map((opt: any) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes(opt.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStatuses([...selectedStatuses, opt.value])
                                                    } else {
                                                        setSelectedStatuses(selectedStatuses.filter((v: string) => v !== opt.value))
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-white">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scan Button */}
                        <button
                            onClick={handleScan}
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Scanning...
                                </>
                            ) : (
                                <>📧 Scan Gmail</>
                            )}
                        </button>
                        <p className="text-xs text-slate-500">Auto-saves to database</p>

                        {/* Scan Progress */}
                        {scanProgress && (
                            <div className="p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {scanProgress.status !== 'complete' && scanProgress.status !== 'error' && (
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {scanProgress.status === 'complete' && <span className="text-green-400">✅</span>}
                                    {scanProgress.status === 'error' && <span className="text-red-400">❌</span>}
                                    <span className="text-xs text-white">
                                        {scanProgress.status === 'fetching' && 'Fetching...'}
                                        {scanProgress.status === 'processing' && `${scanProgress.processed_emails}/${scanProgress.total_emails}`}
                                        {scanProgress.status === 'complete' && `Saved ${scanProgress.candidates_added} candidates`}
                                        {scanProgress.status === 'error' && 'Error'}
                                    </span>
                                </div>
                                {scanProgress.total_emails > 0 && (
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${(scanProgress.processed_emails / scanProgress.total_emails) * 100}%` }}
                                        ></div>
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
