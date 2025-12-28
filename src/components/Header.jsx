import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isDashboardPage = location.pathname === '/dashboard'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault()
    const element = document.querySelector(targetId)
    if (element) {
      const headerHeight = 80 // altura aproximada do header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    setIsMenuOpen(false)
  }

  const headerRowClass = isDashboardPage
    ? 'flex items-center justify-center h-16 md:h-20'
    : 'flex items-center justify-between h-16 md:h-20'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={headerRowClass}>
          {/* Logo */}
          <a
            href="/"
            className={`flex items-center space-x-2 hover:opacity-80 transition-opacity ${
              isDashboardPage ? 'mx-auto' : ''
            }`}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              Finance Log
            </span>
          </a>

          {/* Desktop Navigation */}
          {!isLoginPage && !isDashboardPage && (
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#inicio"
                onClick={(e) => handleSmoothScroll(e, '#inicio')}
                className="text-gray-700 hover:text-primary transition-colors duration-200 relative group"
              >
                Início
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#funcionalidades"
                onClick={(e) => handleSmoothScroll(e, '#funcionalidades')}
                className="text-gray-700 hover:text-primary transition-colors duration-200 relative group"
              >
                Funcionalidades
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#sobre"
                onClick={(e) => handleSmoothScroll(e, '#sobre')}
                className="text-gray-700 hover:text-primary transition-colors duration-200 relative group"
              >
                Sobre Nós
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#contactos"
                onClick={(e) => handleSmoothScroll(e, '#contactos')}
                className="text-gray-700 hover:text-primary transition-colors duration-200 relative group"
              >
                Contactos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>
          )}

          {/* Desktop CTA Button */}
          {!isDashboardPage && (
            <div className="hidden md:block">
              {isLoginPage ? (
                <a
                  href="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 inline-block"
                >
                  Voltar
                </a>
              ) : (
                <a
                  href="/login"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 inline-block transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Começar Agora
                </a>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 mt-4">
              {!isLoginPage && !isDashboardPage && (
                <>
                  <a
                    href="/#inicio"
                    className="text-gray-700 hover:text-primary transition-colors duration-200 px-2 py-2 hover:bg-gray-50 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Início
                  </a>
                  <a
                    href="/#funcionalidades"
                    className="text-gray-700 hover:text-primary transition-colors duration-200 px-2 py-2 hover:bg-gray-50 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Funcionalidades
                  </a>
                  <a
                    href="/#sobre"
                    className="text-gray-700 hover:text-primary transition-colors duration-200 px-2 py-2 hover:bg-gray-50 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sobre Nós
                  </a>
                  <a
                    href="/#contactos"
                    className="text-gray-700 hover:text-primary transition-colors duration-200 px-2 py-2 hover:bg-gray-50 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contactos
                  </a>
                  <a
                    href="/login"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 mt-2 w-full text-center block transform hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Começar Agora
                  </a>
                </>
              )}
              {(isLoginPage || isDashboardPage) && (
                <a
                  href="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 mt-2 w-full text-center block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Voltar
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

