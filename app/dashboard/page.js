'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Loader from '../../components/loader'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Récupérer les données utilisateur
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/user')
        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
          fetchPosts()
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

  // Récupérer tous les posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error)
    }
  }

  // Publier un nouveau post
  const handleSubmitPost = async (e) => {
    e.preventDefault()
    
    if (!newPost.trim()) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPost }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setNewPost('')
        fetchPosts()
      }
    } catch (error) {
      console.error('Erreur lors de la publication du post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Gérer les likes
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  // Supprimer un post
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error)
    }
  }

  // Formatage de la date
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
          <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-700">
              {user?.email}
            </div>
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
        </div>

        {/* Formulaire de post */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 mb-4">
          <form onSubmit={handleSubmitPost}>
            <div className="flex items-start mb-3">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 bg-red-200 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                <span className="text-red-600 font-bold">{user?.email?.charAt(0)?.toUpperCase()}</span>
              </div>
              <textarea
                className="flex-grow p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm"
                placeholder="Quoi de neuf ?"
                rows="3"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                maxLength={280}
              ></textarea>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {newPost.length}/280
              </div>
              <button
                type="submit"
                disabled={submitting || !newPost.trim()}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {submitting ? <Loader /> : 'Publier'}
              </button>
            </div>
          </form>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-8 text-center">
              <p className="text-gray-500">Aucun post pour le moment. Soyez le premier à publier !</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(239,_68,_68,_0.15)] p-4 transform hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 bg-red-200 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                    <span className="text-red-600 font-bold">{post.author.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className="font-bold text-gray-900 mr-2">{post.author.name || post.author.email.split('@')[0]}</span>
                      <span className="text-gray-500 text-sm">@{post.author.username || post.author.email.split('@')[0]}</span>
                      <span className="mx-1 text-gray-400">·</span>
                      <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center justify-between text-gray-500">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post._count?.likes || 0}</span>
                      </button>
                      
                      {post.author.id === user?.userId && (
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 