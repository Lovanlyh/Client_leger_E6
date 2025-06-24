'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  return (
    <header className="w-full bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link href="/posts" className="text-xl font-bold text-red-600">Fil Rouge</Link>
      <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user?.name || user?.email}</span>
            <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">Déconnexion</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/signin" className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">Se connecter</Link>
            <Link href="/signup" className="px-4 py-2 border border-red-500 text-red-600 rounded-full hover:bg-red-50 transition-colors">S'inscrire</Link>
          </div>
        )}
      </div>
    </header>
  )
} 