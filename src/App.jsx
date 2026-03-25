import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'
import CallbackHandler from './components/CallbackHandler'

function App() {
  return (
    <ToastProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/callback/google" element={<CallbackHandler />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App

