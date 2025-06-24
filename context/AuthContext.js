'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../components/loader'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Au chargement de l'application, on vérifie si une session existe déjà
  useEffect(() => {
    async function checkUserSession() {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Échec de la récupération de la session utilisateur", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUserSession()
  }, [])

  const login = async (email, password) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (response.ok) {
      setUser(data.user)
      router.push('/posts')
    } else {
      throw new Error(data.error || 'La connexion a échoué')
    }
  }

  const signup = async (name, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await response.json()
    if (response.ok) {
      setUser(data.user)
      router.push('/posts')
    } else {
      throw new Error(data.error || "L'inscription a échoué")
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error)
    } finally {
      setUser(null)
      router.push('/signin')
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  }

  // Affiche un loader global tant que nous ne savons pas si l'utilisateur est connecté
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l-intérieur d-un AuthProvider')
  }
  return context
} 