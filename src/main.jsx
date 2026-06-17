import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Garantir que dark mode não fica activo de sessões anteriores
document.documentElement.classList.remove('dark')
localStorage.removeItem('financelog_dark')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

