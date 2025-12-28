import { useState, useEffect } from 'react'
import { useToast } from '../Toast'

function Profile({ userData }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    nome: userData?.display_name || 'Utilizador',
    email: userData?.email || 'user@example.com',
    pais: 'Portugal',
    moeda: 'EUR',
    idioma: 'pt-PT',
    preferencias: {
      tema: 'claro',
      privacidade: 'normal',
    }
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchUserSettings()
  }, [userData])

  const fetchUserSettings = async () => {
    if (!userData?.user_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/user/settings', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setProfileData(prev => ({
            ...prev,
            pais: data.settings.pais || 'Portugal',
            moeda: data.settings.moeda || 'EUR',
            idioma: data.settings.idioma || 'pt-PT',
            preferencias: {
              tema: data.settings.tema || 'claro',
              privacidade: data.settings.nivelPrivacidade || 'normal',
            }
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pais: profileData.pais,
          moeda: profileData.moeda,
          idioma: profileData.idioma,
          tema: profileData.preferencias.tema,
          nivelPrivacidade: profileData.preferencias.privacidade,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        showToast('Perfil atualizado com sucesso!', 'success')
      } else {
        showToast('Erro ao atualizar perfil', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      showToast('Erro ao atualizar perfil', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">Perfil</p>
          <h2 className="text-3xl font-black text-gray-900">Meu Perfil</h2>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e preferências</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Perfil</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              💾 Salvar Alterações
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Foto de Perfil */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 hover:border-primary/30 transition-all duration-300 text-center group">
            <div className="mb-6 relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-primary to-purple-500 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-300">
                {profileData.nome.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full text-white shadow-lg hover:bg-primary-dark transition-colors">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">{profileData.nome}</h3>
            <p className="text-sm text-gray-600 mb-4">{profileData.email}</p>
            <div className="flex flex-col space-y-2">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                ⭐ Membro desde 2024
              </span>
            </div>
          </div>

        </div>

        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900">Informações Pessoais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>📝</span>
                  <span>Nome Completo</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.nome}
                    onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-semibold"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold border-2 border-transparent">{profileData.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>✉️</span>
                  <span>Email</span>
                </label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-700 font-semibold border-2 border-transparent cursor-not-allowed">
                  {profileData.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">📌 Email não pode ser alterado</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>🌍</span>
                  <span>País</span>
                </label>
                {isEditing ? (
                  <select
                    value={profileData.pais}
                    onChange={(e) => setProfileData({ ...profileData, pais: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-semibold"
                  >
                    <option value="Portugal">Portugal</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Espanha">Espanha</option>
                    <option value="França">França</option>
                    <option value="Alemanha">Alemanha</option>
                    <option value="Outro">Outro</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold border-2 border-transparent">{profileData.pais}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900">Preferências</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>💰</span>
                  <span>Moeda</span>
                </label>
                {isEditing ? (
                  <select
                    value={profileData.moeda}
                    onChange={(e) => setProfileData({ ...profileData, moeda: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-semibold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BRL">BRL (R$)</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold border-2 border-transparent">{profileData.moeda}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>🗣️</span>
                  <span>Idioma</span>
                </label>
                {isEditing ? (
                  <select
                    value={profileData.idioma}
                    onChange={(e) => setProfileData({ ...profileData, idioma: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-semibold"
                  >
                    <option value="pt-PT">Português (Portugal)</option>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-semibold border-2 border-transparent">{profileData.idioma}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

