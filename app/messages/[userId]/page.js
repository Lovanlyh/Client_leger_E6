'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../../../components/loader'

export default function Conversation({ params }) {
  const { userId } = params
  const [messages, setMessages] = useState([])
  const [contact, setContact] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  // Récupérer les données de l'utilisateur courant
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Récupérer les messages de la conversation
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/messages?withUserId=${userId}`)
        const data = await response.json()
        
        if (response.ok) {
          setMessages(data.messages || [])
          if (data.messages && data.messages.length > 0) {
            const otherUser = data.messages[0].senderId === userId 
              ? data.messages[0].sender 
              : data.messages[0].recipient
            setContact(otherUser)
          } else {
            // Si pas de messages, récupérer les infos de l'utilisateur
            const userResponse = await fetch(`/api/users/${userId}`)
            if (userResponse.ok) {
              const userData = await userResponse.json()
              setContact(userData.user)
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchMessages()
    }
  }, [userId])

  // Faire défiler jusqu'au dernier message
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    try {
      setSending(true)
      
      // Ajouter un message optimiste à l'UI
      const optimisticMessage = {
        id: 'temp-' + Date.now(),
        content: newMessage,
        senderId: currentUser.id,
        recipientId: userId,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: currentUser,
        isOptimistic: true
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
      
      // Envoyer le message au serveur
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          content: newMessage
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }
      
      // Récupérer les messages à jour
      const messagesResponse = await fetch(`/api/messages?withUserId=${userId}`)
      const messagesData = await messagesResponse.json()
      
      if (messagesResponse.ok) {
        setMessages(messagesData.messages || [])
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      
      // Supprimer le message optimiste en cas d'erreur
      setMessages(prev => prev.filter(msg => !msg.isOptimistic))
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleTimeString('fr-FR', options)
  }

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  const getDisplayName = (user) => {
    if (!user) return ''
    return user.name || user.username || user.email.split('@')[0]
  }

  // Regrouper les messages par date
  const groupMessagesByDate = () => {
    const groups = {}
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }))
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* En-tête de la conversation */}
      <div className="bg-white/90 backdrop-blur-xl rounded-t-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/messages')}
            className="mr-3 text-gray-500 hover:text-gray-700 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {contact && (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-lg text-red-600 font-bold">
                  {contact.name ? contact.name.charAt(0).toUpperCase() : contact.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{getDisplayName(contact)}</h2>
                <p className="text-xs text-gray-500">{contact.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Corps de la conversation */}
      <div className="flex-grow bg-white/90 backdrop-blur-xl overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Aucun message pour le moment.<br />
              Envoyez votre premier message ci-dessous !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupMessagesByDate().map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 text-xs text-gray-500 px-2">
                    {formatDate(new Date(group.date))}
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                {group.messages.map((message) => {
                  const isSentByMe = message.senderId === currentUser?.id
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isSentByMe
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="mb-1">{message.content}</p>
                        <p className={`text-xs ${isSentByMe ? 'text-red-100' : 'text-gray-500'} text-right`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Formulaire d'envoi de message */}
      <div className="bg-white/90 backdrop-blur-xl rounded-b-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 