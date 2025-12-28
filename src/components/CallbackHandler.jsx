import { useEffect } from 'react'

function CallbackHandler() {
  useEffect(() => {
    // Callback é processado diretamente pela API Flask
    // Este componente é apenas um fallback
    // Em produção, o Google redireciona direto para /callback/google no Flask
    console.warn('Callback page - deve ser redirecionado pelo Flask')
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  )
}

export default CallbackHandler