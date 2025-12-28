import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from './Header'
import BackToTop from './BackToTop'
import LoginButton from './LoginButton'

function LoginPage() {
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Verificar se há erro na URL (vindo do callback)
    const errorParam = searchParams.get('error')
    const detailsParam = searchParams.get('details')
    
    if (errorParam) {
      let errorMessage = 'Erro ao fazer login. Por favor, tente novamente.'
      
      // Mensagens de erro mais específicas
      switch (errorParam) {
        case 'no_code':
          errorMessage = 'Código de autorização não recebido. Tente novamente.'
          break
        case 'no_id_token':
          errorMessage = 'Token de autenticação não recebido. Tente novamente.'
          break
        case 'invalid_token':
          errorMessage = 'Token inválido. Tente fazer login novamente.'
          break
        case 'db_error':
          errorMessage = 'Erro ao conectar com a base de dados. Verifique as definições.'
          break
        case 'token_exchange_failed':
          errorMessage = 'Erro ao processar autenticação. Verifique as credenciais do Google.'
          break
        case 'config_error':
          errorMessage = 'Erro de configuração. Verifique o arquivo .env.'
          break
        case 'google_error':
          errorMessage = `Erro do Google: ${detailsParam || 'Tente novamente.'}`
          break
        case 'callback_error':
          errorMessage = 'Erro ao processar callback. Tente novamente.'
          break
        default:
          errorMessage = `Erro: ${errorParam}. ${detailsParam ? `Detalhes: ${detailsParam}` : ''}`
      }
      
      setError(errorMessage)
      console.error('Erro de login:', errorParam, detailsParam)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-300 border border-white/30 animate-slide-in-up">
            {/* Logo/Icon Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Bem-vindo!
              </h1>
              <p className="text-gray-600 text-lg">
                Entre com a sua conta Google para continuar
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <div className="space-y-6">
              <LoginButton />
              
              {/* Info Text */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Ao continuar, concorda com os nossos{' '}
                  <a href="#" className="text-primary hover:text-primary-dark font-medium hover:underline">
                    Termos de Serviço
                  </a>
                  {' '}e{' '}
                  <a href="#" className="text-primary hover:text-primary-dark font-medium hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </div>

            {/* Features/Benefits */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Acesso rápido e seguro</p>
                    <p className="text-xs text-gray-500 mt-0.5">Autenticação via Google OAuth</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Dados protegidos</p>
                    <p className="text-xs text-gray-500 mt-0.5">Os seus dados financeiros estão seguros</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Sincronização automática</p>
                    <p className="text-xs text-gray-500 mt-0.5">Os seus dados sempre atualizados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/90">
              Precisa de ajuda?{' '}
              <a href="#" className="text-white font-semibold hover:underline">
                Contacte-nos
              </a>
            </p>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

export default LoginPage

