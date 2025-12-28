import { useState } from 'react'

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Como recuperar a minha palavra-passe?',
      answer:
        'Para recuperar a sua palavra-passe, clique em "Esqueci a minha palavra-passe" na página de início de sessão. Receberá um email com instruções para redefinir a sua palavra-passe. Certifique-se de verificar a sua caixa de entrada e pasta de spam.',
    },
    {
      question: 'É seguro guardar os meus dados?',
      answer:
        'Sim, absolutamente. Utilizamos criptografia de ponta (SSL/TLS) para proteger todos os seus dados. Além disso, seguimos as melhores práticas de segurança e nunca partilhamos as suas informações com terceiros sem a sua autorização explícita.',
    },
    {
      question: 'Posso alterar o meu email de acesso?',
      answer:
        'Sim, pode alterar o seu email de acesso a qualquer momento. Aceda às definições da sua conta e selecione "Alterar Email". Precisará de confirmar o novo email através de um link enviado para o novo endereço.',
    },
    {
      question: 'O que fazer se não conseguir aceder à conta?',
      answer:
        'Se não conseguir aceder à sua conta, primeiro tente usar a opção "Recuperar palavra-passe". Se o problema persistir, entre em contacto com o nosso suporte através do email suporte@financelog.com ou use o chat em direto. A nossa equipa está disponível 24/7 para ajudá-lo.',
    },
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-primary/5 transition-all duration-200 group"
          >
            <span className="font-semibold text-gray-900 pr-4 group-hover:text-primary transition-colors duration-200">
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-all duration-300 group-hover:text-primary ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 py-4 text-gray-600 leading-relaxed bg-white">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FAQAccordion

