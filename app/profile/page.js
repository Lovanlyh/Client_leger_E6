'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Loader from '../../components/loader'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/user')
        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
          fetchUserPosts(data.user.id)
        } else {
          router.push('/signin')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const fetchUserPosts = async (userId) => {
    try {
      const response = await fetch(`/api/posts?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error)
    }
  }

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(239,_68,_68,_0.2)] p-8">
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animation-delay-200"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animation-delay-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* En-tête */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <button
            onClick={async () => {
              await fetch('/api/auth/signout', { method: 'POST' })
              router.push('/signin')
            }}
            className="px-3 py-1 rounded-full text-sm text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300"
          >
            Déconnexion
          </button>
        </div>

        {/* Informations du profil */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-6 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-red-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-red-600 font-bold">
                {user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-gray-600">@{user?.username || user?.email?.split('@')[0]}</p>
              <p className="text-gray-500 text-sm mt-1">
                Membre depuis {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Posts de l'utilisateur */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes posts</h3>
          {posts.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-8 text-center">
              <p className="text-gray-500">Vous n'avez pas encore publié de posts.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4">
                <p className="text-gray-800 mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post._count?.likes || 0} likes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 