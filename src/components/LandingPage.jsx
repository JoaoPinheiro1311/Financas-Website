import Header from './Header'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import BenefitsSection from './BenefitsSection'
import AboutSection from './AboutSection'
import BackToTop from './BackToTop'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <AboutSection />
      <BackToTop />
      <footer id="contactos" className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-16 px-4 text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-400/15 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
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
            <h3 className="text-3xl font-bold mb-4">Contactos</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Tem alguma dúvida? Entre em contacto connosco!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 mb-10">
            <a href="mailto:suporte@financelog.com" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors text-lg group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>suporte@financelog.com</span>
            </a>
            <span className="hidden sm:inline text-blue-400/50 text-2xl">|</span>
            <a href="tel:+351123456789" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors text-lg group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+351 123 456 789</span>
            </a>
          </div>
          <div className="pt-8 border-t border-blue-700/50">
            <p className="text-blue-200 text-sm">
              © 2024 Finance Log. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

