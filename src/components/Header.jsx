import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isDashboardPage = location.pathname === '/dashboard'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault()
    const element = document.querySelector(targetId)
    if (element) {
      const headerHeight = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isDashboardPage ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 md:h-20 ${isDashboardPage ? 'justify-center' : ''}`}>
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">Finance Log</span>
          </Link>

          {!isDashboardPage && (
            <>
              {/* Desktop Nav */}
              {!isLoginPage && (
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="#inicio" onClick={(e) => handleSmoothScroll(e, '#inicio')} className="text-gray-700 hover:text-primary font-medium">Início</a>
                  <a href="#funcionalidades" onClick={(e) => handleSmoothScroll(e, '#funcionalidades')} className="text-gray-700 hover:text-primary font-medium">Funcionalidades</a>
                  <a href="#sobre" onClick={(e) => handleSmoothScroll(e, '#sobre')} className="text-gray-700 hover:text-primary font-medium">Sobre</a>
                </nav>
              )}

              {/* Action Button */}
              <div className="hidden md:block">
                {isLoginPage ? (
                  <Link to="/" className="text-gray-600 font-bold hover:text-primary transition-colors">Voltar</Link>
                ) : (
                  <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">Começar</Link>
                )}
              </div>

              {/* Mobile Toggle */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && !isDashboardPage && (
          <div className="md:hidden pb-6 border-t border-gray-100 bg-white absolute left-0 right-0 px-6 shadow-xl">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-bold">Início</Link>
              {!isLoginPage && <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-primary text-white py-3 rounded-xl text-center font-bold">Entrar</Link>}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
