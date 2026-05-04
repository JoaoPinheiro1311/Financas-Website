import { useState, useEffect } from 'react'

const SERVICES = [
  { name: 'Identity Service', port: '8001', endpoint: '/api/health', prodPath: '/api/v1/auth/api/health' },
  { name: 'Finance Service', port: '8002', endpoint: '/api/health', prodPath: '/api/v1/api/health' },
  { name: 'Investment Service', port: '8003', endpoint: '/api/health', prodPath: '/api/v1/investments/api/health' },
  { name: 'Goals Service', port: '8004', endpoint: '/api/health', prodPath: '/api/v1/goals/api/health' },
  { name: 'Notification Service', port: '8005', endpoint: '/api/health', prodPath: '/api/v1/notifications/api/health' },
]

export default function ServiceHealth() {
  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(true)

  const checkHealth = async () => {
    const isLocal = window.location.hostname === 'localhost'
    const results = {}
    
    for (const service of SERVICES) {
      try {
        const start = Date.now()
        const url = isLocal 
          ? `http://localhost:${service.port}${service.endpoint}`
          : `${window.location.origin}${service.prodPath}`
          
        const resp = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        })
        const duration = Date.now() - start
        results[service.name] = {
          online: resp.ok,
          latency: duration,
          error: resp.ok ? null : `Status ${resp.status}`
        }
      } catch (e) {
        results[service.name] = { online: false, latency: 0, error: 'Offline' }
      }
    }
    setStatus(results)
    setLoading(false)
  }


  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Verificar a cada 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Estado do Sistema (Microserviços)</h3>
        <button 
          onClick={() => { setLoading(true); checkHealth(); }}
          className="text-primary hover:text-primary-dark text-xs font-medium flex items-center"
        >
          <svg className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      <div className="space-y-3">
        {SERVICES.map((service) => {
          const s = status[service.name]
          return (
            <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${s?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{service.name}</p>
                  <p className="text-[10px] text-gray-400">Porta {service.port}</p>
                </div>
              </div>
              <div className="text-right">
                {s?.online ? (
                  <span className="text-[11px] font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    {s.latency}ms
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Offline
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center italic">
          Arquitetura Centralizada via API Gateway Simulada no Antigravity apiFetch.
        </p>
      </div>
    </div>
  )
}
