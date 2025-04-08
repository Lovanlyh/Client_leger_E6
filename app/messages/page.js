'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../../components/loader'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages')
      const data = await response.json()
      
      if (response.ok) {
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (searchQuery.trim().length < 2) return

    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
    }
  }

  const startNewConversation = (userId) => {
    setShowNewMessageModal(false)
    router.push(`/messages/${userId}`)
  }

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  const getDisplayName = (user) => {
    return user.name || user.username || user.email.split('@')[0]
  }

  const getInitials = (user) => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase()
    }
    return user.email.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animation-delay-200"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animation-delay-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="flex items-center space-x-1 px-4 py-2 rounded-full text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouveau message</span>
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-8 text-center">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de conversations.</p>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Commencer une nouvelle conversation</span>
          </button>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] overflow-hidden">
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <div
                key={conversation.contact.id}
                onClick={() => router.push(`/messages/${conversation.contact.id}`)}
                className="flex items-center p-4 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-lg text-red-600 font-bold">
                    {getInitials(conversation.contact)}
                  </span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {getDisplayName(conversation.contact)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600 truncate pr-2">
                      {conversation.lastMessage.senderId === conversation.contact.id ? '' : 'Vous: '}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de nouveau message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nouveau message</h2>
              <button 
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher un utilisateur
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && searchUsers()}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nom, email ou username"
                />
                <button
                  onClick={searchUsers}
                  className="px-4 py-2 bg-red-600 text-white rounded-r-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery.length > 0 
                    ? 'Aucun utilisateur trouvé. Essayez une autre recherche.' 
                    : 'Saisissez un nom ou un email pour rechercher des utilisateurs.'}
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startNewConversation(user.id)}
                      className="flex items-center p-3 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-md text-red-600 font-bold">
                          {getInitials(user)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getDisplayName(user)}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 