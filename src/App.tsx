import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Rail from './components/Rail'
import Topbar from './components/Topbar'
import Dashboard from './screens/Dashboard'
import SourceHealth from './screens/SourceHealth'
import CommunityPulse from './screens/CommunityPulse'

function AppShell() {
  return (
    <div className="app">
      <Rail />
      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/source-health" element={<SourceHealth />} />
          <Route path="/community-pulse" element={<CommunityPulse />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
