import { useEffect } from 'react'
import { apiFetch, API_BASE_URL } from '../config/api'
import { useSearchParams } from 'react-router-dom'

function CallbackHandler() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    // Se o callback chegou no React em vez do Flask, redirecionar para o Flask
    // Isso não deveria acontecer, mas serve como fallback
    if (code || error) {
      // Construir a URL do callback do Flask com os mesmos parâmetros
      const params = new URLSearchParams(window.location.search)
      const flaskCallbackUrl = `http://localhost:5000/callback/google?${params.toString()}`
      
      console.warn('Callback chegou no React em vez do Flask. Redirecionando...')
      window.location.href = flaskCallbackUrl
    }
  }, [code, error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  )
}

export default CallbackHandler

