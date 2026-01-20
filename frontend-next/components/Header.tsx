type StatusType = 'ready' | 'scanning' | 'active' | 'live'

interface HeaderProps {
  status: StatusType
}

const statusConfig = {
  ready: { text: 'Ready', color: 'bg-indigo-500', animate: false },
  scanning: { text: 'Scanning', color: 'bg-amber-500', animate: true },
  active: { text: 'Active', color: 'bg-emerald-500', animate: false },
  live: { text: '🔴 LIVE', color: 'bg-red-500', animate: true }
}

export default function Header({ status }: HeaderProps) {
  const { text, color, animate } = statusConfig[status]

  return (
    <header className="mb-12 pb-6 border-b border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Candidate Automation
            </h1>
            <p className="text-slate-400 text-sm mt-1">Intelligent job application monitoring</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2 ${status === 'live' ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800/50 border-slate-700'} border rounded-xl backdrop-blur-sm`}>
          <span className={`w-2 h-2 rounded-full ${color} ${animate ? 'animate-pulse' : ''}`}></span>
          <span className={`text-sm font-medium ${status === 'live' ? 'text-red-400' : 'text-slate-200'}`}>{text}</span>
        </div>
      </div>
    </header>
  )
}
