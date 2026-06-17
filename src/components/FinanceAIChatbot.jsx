import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '../config/api'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'financelog_chat_history'
const MAX_STORED = 20

// Função para renderizar texto com formatação Markdown básica
function formatMessage(text) {
  const lines = text.split('\n')
  return lines.map((line, lineIndex) => {
    if (line.trim().startsWith('* ')) {
      const content = line.trim().substring(2)
      return <li key={lineIndex} className="ml-4 mb-1">{formatInlineText(content)}</li>
    }
    if (line.trim() === '') return <br key={lineIndex} />
    return <div key={lineIndex}>{formatInlineText(line)}</div>
  })
}

function formatInlineText(text) {
  const parts = []
  let currentIndex = 0
  const boldRegex = /\*\*(.+?)\*\*/g
  let match
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > currentIndex) parts.push(text.substring(currentIndex, match.index))
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>)
    currentIndex = match.index + match[0].length
  }
  if (currentIndex < text.length) parts.push(text.substring(currentIndex))
  return parts.length > 0 ? parts : text
}

const QUICK_QUESTIONS = [
  'Como posso poupar mais este mês?',
  'Estou a gastar demasiado?',
  'Dá-me dicas para investir',
  'Como melhorar o meu score?',
]

export default function FinanceAIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Carregar histórico do localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      }
    } catch (e) { /* ignore */ }
    return [{
      id: 1,
      text: 'Olá! Sou o **Financial Sensei** 🧘‍♂️💰 — o teu guia para a prosperidade financeira.\n\nPosso ajudar-te com poupança, investimentos, análise de despesas e muito mais. Como posso guiar-te hoje?',
      sender: 'bot',
      timestamp: new Date(),
    }]
  })

  // Persistir histórico sempre que muda
  useEffect(() => {
    try {
      const toStore = messages.slice(-MAX_STORED).map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (e) { /* ignore */ }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, minimized])

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, minimized])

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      })

      const botText = response.ok
        ? (await response.json()).response
        : 'Desculpe, houve um erro ao processar a sua mensagem. Tente novamente.'

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      }])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro de ligação. Tente novamente mais tarde.',
        sender: 'bot',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const clearHistory = () => {
    const initial = [{
      id: Date.now(),
      text: 'Conversa reiniciada. Olá novamente! Como posso ajudar-te hoje? 🧘‍♂️',
      sender: 'bot',
      timestamp: new Date(),
    }]
    setMessages(initial)
  }

  // Floating button
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-2xl shadow-blue-500/30 z-40 flex items-center justify-center w-16 h-16 group"
        title="Assistente Financeiro"
      >
        <span className="text-2xl">🧘‍♂️</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-6 right-6 w-[420px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
      style={{ maxHeight: minimized ? 'auto' : '580px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-lg">🧘‍♂️</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Financial Sensei</p>
            <p className="text-[10px] text-slate-400">IA • Sempre disponível</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearHistory} title="Limpar conversa"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button onClick={() => setMinimized(!minimized)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={minimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          <button onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" style={{ minHeight: '300px', maxHeight: '420px' }}>
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🧘‍♂️</div>
                  )}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {message.sender === 'bot' ? formatMessage(message.text) : message.text}
                    </div>
                    <p className={`text-[10px] mt-1.5 ${message.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">🧘‍♂️</div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                  <div className="flex gap-1.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 pt-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-100 p-3 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunta ao teu Sensei..."
                className="flex-1 bg-slate-100 border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  )
}
