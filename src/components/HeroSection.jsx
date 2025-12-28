function HeroSection() {
  return (
    <section id="inicio" className="relative mt-16 md:mt-20 min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          alt="Mulher asiática sorridente segurando um tablet com gráficos, em um escritório moderno"
          className="w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-blue-900/85 to-gray-900/90"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Seu Futuro Financeiro{' '}
          <span className="text-blue-400">Começa Aqui.</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto">
          Planejamento inteligente, investimentos seguros, e total controlo.
          Tudo em um só lugar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Começar Agora
          </a>
          <a
            href="#funcionalidades"
            onClick={(e) => {
              e.preventDefault()
              const element = document.querySelector('#funcionalidades')
              if (element) {
                const headerHeight = 80
                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                })
              }
            }}
            className="inline-block bg-white hover:bg-gray-50 text-primary border-2 border-white px-10 py-5 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explorar Soluções
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

