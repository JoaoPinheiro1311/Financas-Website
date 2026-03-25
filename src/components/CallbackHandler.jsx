import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SERVICES } from '../config/api'

function CallbackHandler() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (code || error) {
      // Se recebermos o código no frontend, reencaminhamos para o backend
      // Google -> Frontend (5174) -> Backend (5000)
      const query = searchParams.toString()
      window.location.href = `${SERVICES.IDENTITY}/callback/google?${query}`
      return
    }

    // Se o usuário cair aqui por mais de 5 segundos sem parâmetros, algo correu mal
    const timer = setTimeout(() => {
      navigate('/login?error=redirect_mismatch')
    }, 5000)

    return () => clearTimeout(timer)
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Autenticando...</p>
        <p className="text-xs text-gray-400 mt-2 tracking-wide">
          A processar o login com o Google. <br />
          Isto não deve demorar muito.
        </p>
      </div>
    </div>
  )
}

export default CallbackHandler