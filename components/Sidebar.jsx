'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HomeIcon, MagnifyingGlassIcon, BellIcon, EnvelopeIcon, UserIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
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
    <nav className="h-screen sticky top-0 flex flex-col justify-between bg-[#15202b] text-white w-20 sm:w-64 py-4 px-2 border-r border-gray-800">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center sm:justify-start mb-8">
          <span className="text-3xl font-bold text-blue-400">X</span>
        </div>
        {/* Menu */}
        <ul className="space-y-2">
          <li>
            <Link href="/posts" className="flex items-center gap-4 px-3 py-2 rounded-full hover:bg-blue-900 transition">
              <HomeIcon className="h-6 w-6" />
              <span className="hidden sm:inline text-lg font-semibold">Accueil</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-4 px-3 py-2 rounded-full hover:bg-blue-900 transition">
              <MagnifyingGlassIcon className="h-6 w-6" />
              <span className="hidden sm:inline text-lg">Explorer</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-4 px-3 py-2 rounded-full hover:bg-blue-900 transition">
              <BellIcon className="h-6 w-6" />
              <span className="hidden sm:inline text-lg">Notifications</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-4 px-3 py-2 rounded-full hover:bg-blue-900 transition">
              <EnvelopeIcon className="h-6 w-6" />
              <span className="hidden sm:inline text-lg">Messages</span>
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center gap-4 px-3 py-2 rounded-full hover:bg-blue-900 transition">
              <UserIcon className="h-6 w-6" />
              <span className="hidden sm:inline text-lg">Profil</span>
            </Link>
          </li>
        </ul>
        {/* Bouton Poster */}
        <button
          onClick={() => router.push('/posts')}
          className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-lg shadow"
        >
          <PlusCircleIcon className="h-6 w-6" />
          <span className="hidden sm:inline">Poster</span>
        </button>
      </div>
      {/* Profil utilisateur (optionnel) */}
      {/* <div className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-900 transition cursor-pointer">
        <img src="/avatar.png" alt="avatar" className="w-10 h-10 rounded-full" />
        <div className="hidden sm:block">
          <div className="font-semibold">Nom</div>
          <div className="text-gray-400 text-sm">@username</div>
        </div>
      </div> */}
    </nav>
  )
} 