'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Vérifier les messages non lus toutes les 30 secondes
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages/unread-count')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages non lus:', error)
      }
    }
    
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/signin')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }
  
  const isActive = (path) => pathname === path
  
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 h-full">
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-center text-red-600">SocialApp</h1>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                  : 'hover:bg-red-50 text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Accueil</span>
            </Link>
            
            <Link 
              href="/messages" 
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                isActive('/messages') 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                  : 'hover:bg-red-50 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="font-medium">Messages</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            
            <Link 
              href="/profile" 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive('/profile') 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                  : 'hover:bg-red-50 text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profil</span>
            </Link>
          </nav>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full mt-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
} 