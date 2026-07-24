import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Rail from './components/Rail'
import Topbar from './components/Topbar'
import Dashboard from './screens/Dashboard'
import SourceHealth from './screens/SourceHealth'
import CommunityPulse from './screens/CommunityPulse'
import PressHealth from './screens/PressHealth'
import Account from './screens/Account'
import Login from './screens/Login'
import AuthCallback from './screens/AuthCallback'

function AppShell() {
  return (
    <div className="app">
      <Rail />
      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/press-sources" element={<PressHealth />} />
          <Route path="/source-health" element={<SourceHealth />} />
          <Route path="/community-pulse" element={<CommunityPulse />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
