import { useState, Component } from 'react'
import { useApp } from './store/AppContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TrackerPage from './pages/TrackerPage'

class TrackerErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('Tracker crashed:', error, info) }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-sm text-gray-500">Something went wrong loading this tracker.</p>
        <p className="text-xs text-red-400 font-mono">{this.state.error.message}</p>
        <button onClick={this.props.onBack}
          className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
          Go back to trackers
        </button>
      </div>
    )
    return this.props.children
  }
}

export default function App() {
  const { currentUser } = useApp()
  const [activeTrackerId, setActiveTrackerId] = useState(null)

  if (!currentUser) return <AuthPage />
  if (activeTrackerId) return (
    <TrackerErrorBoundary onBack={() => setActiveTrackerId(null)}>
      <TrackerPage trackerId={activeTrackerId} onBack={() => setActiveTrackerId(null)} />
    </TrackerErrorBoundary>
  )
  return <DashboardPage onOpenTracker={setActiveTrackerId} />
}
