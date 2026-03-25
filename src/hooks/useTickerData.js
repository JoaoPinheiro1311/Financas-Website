import { useState, useEffect } from 'react'

export const useTickerData = () => {
  const [tickerData, setTickerData] = useState([
    { symbol: 'BTC', price: '64,231.50', change: '+2.4%' },
    { symbol: 'ETH', price: '3,452.10', change: '+1.8%' },
    { symbol: 'EUR/USD', price: '1.0842', change: '-0.1%' },
    { symbol: 'TSLA', price: '165.20', change: '-1.2%' }
  ])

  useEffect(() => {
    // Se já falhou nesta sessão, não tentamos mais para manter a consola limpa
    if (sessionStorage.getItem('ticker_live_failed')) {
      simulateFluctuation()
      const interval = setInterval(simulateFluctuation, 10000)
      return () => clearInterval(interval)
    }

    const fetchRealData = async () => {
      try {
        // Tentar Binance primeiro (mais estável globalmente)
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
          signal: AbortSignal.timeout(3000)
        }).catch(() => null)

        if (response && response.ok) {
          const data = await response.json()
          setTickerData(prev => prev.map(item => {
            if (item.symbol === 'BTC') {
              return { ...item, price: parseFloat(data.price).toLocaleString('pt-PT', { minimumFractionDigits: 2 }), change: '+---' }
            }
            return item
          }))
          return
        }

        // Tentar CoinCap como segunda opção
        const response2 = await fetch('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum', {
          signal: AbortSignal.timeout(3000)
        }).catch(() => null)

        if (response2 && response2.ok) {
          const result = await response2.json()
          const btc = result.data.find(d => d.id === 'bitcoin')
          const eth = result.data.find(d => d.id === 'ethereum')
          if (btc && eth) {
             setTickerData(prev => [
                { symbol: 'BTC', price: parseFloat(btc.priceUsd).toLocaleString('pt-PT', { minimumFractionDigits: 2 }), change: (btc.changePercent24Hr > 0 ? '+' : '') + parseFloat(btc.changePercent24Hr).toFixed(2) + '%' },
                { symbol: 'ETH', price: parseFloat(eth.priceUsd).toLocaleString('pt-PT', { minimumFractionDigits: 2 }), change: (eth.changePercent24Hr > 0 ? '+' : '') + parseFloat(eth.changePercent24Hr).toFixed(2) + '%' },
                { ...prev[2] },
                { ...prev[3] }
              ])
              return
          }
        }
        
        throw new Error('All APIs unreachable')
      } catch (err) {
        // Marcar como falha na sessão para não tentar mais e manter a consola limpa
        sessionStorage.setItem('ticker_live_failed', 'true')
        simulateFluctuation()
      }
    }

    function simulateFluctuation() {
      setTickerData(prev => prev.map(item => {
        const flux = (Math.random() * 0.001 - 0.0005)
        const current = parseFloat(item.price.replace(/\./g, '').replace(',', '.'))
        return { ...item, price: (current * (1 + flux)).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) }
      }))
    }

    fetchRealData()
    const interval = setInterval(fetchRealData, 45000)
    return () => clearInterval(interval)
  }, [])

  return tickerData
}
