import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import LoginButton from './LoginButton'
import bgImage from '../assets/login_bg.png'

function LoginPage() {
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const detailsParam = searchParams.get('details')
    
    if (errorParam) {
      let errorMessage = 'Erro ao fazer login. Por favor, tente novamente.'
      switch (errorParam) {
        case 'db_error': errorMessage = 'Erro ao conectar com a base de dados.'; break
        case 'google_error': errorMessage = `Erro do Google: ${detailsParam || 'Tente novamente.'}`; break
        default: errorMessage = `Erro: ${errorParam}. ${detailsParam || ''}`
      }
      setError(errorMessage)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden relative">
      {/* 1. Left Side: Immersive Visuals (Hidden on Mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 hover:scale-100 transition-transform duration-[10000ms]"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Floating Wisdom */}
        <div className="absolute bottom-20 left-12 right-12 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🧘‍♂️</span>
              <div className="h-0.5 w-12 bg-primary" />
              <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Sensei Wisdom</span>
            </div>
            <p className="text-2xl font-medium text-white italic leading-relaxed">
              "A verdadeira riqueza não é ter muito, mas sim saber gerir com sabedoria o que o destino te concede."
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. Right Side: Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 relative z-10">
        {/* Decorative circle for mobile bg */}
        <div className="md:hidden absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Brand/Logo */}
          <div className="mb-12 text-center md:text-left">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-8 shadow-2xl shadow-primary/30"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
              Começa a tua <span className="text-primary italic">Jornada.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Faz login para acederes ao teu dashboard personalizado e insights do Sensei.
            </p>
          </div>

          {/* Login Actions */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-all" />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-2xl flex items-center gap-3"
              >
                <span className="text-xl">⚠️</span> {error}
              </motion.div>
            )}

            <div className="space-y-6">
              <LoginButton />
            </div>
          </div>

          <p className="mt-10 text-center text-slate-500 text-sm">
            Ao continuar, aceitas os nossos <a href="#" className="text-white hover:text-primary transition-colors font-bold">Termos</a> e <a href="#" className="text-white hover:text-primary transition-colors font-bold">Privacidade</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
