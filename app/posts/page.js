'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../../components/loader'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'

export default function Posts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [error, setError] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await fetch('/api/posts')
        if (!postsResponse.ok) {
          throw new Error('Erreur lors de la récupération des posts')
        }
        const postsData = await postsResponse.json()
        setPosts(postsData)
      } catch (error) {
        setError(error.message)
      }
    }
    fetchPosts()
  }, [])

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création du post')
      }
      const data = await response.json()
      setPosts(prevPosts => [data, ...prevPosts])
      setNewPost('')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim() || !replyingTo) return
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }
    try {
      const response = await fetch(`/api/posts/${replyingTo}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la réponse')
      }
      const data = await response.json()
      setPosts(prevPosts => {
        const updatedPosts = [...prevPosts]
        const parentIndex = updatedPosts.findIndex(p => p.id === replyingTo)
        if (parentIndex !== -1) {
          updatedPosts[parentIndex].replies = [
            ...(updatedPosts[parentIndex].replies || []),
            data
          ]
        }
        return updatedPosts
      })
      setReplyingTo(null)
      setReplyContent('')
    } catch (error) {
      setError(error.message)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#15202b] flex">
      {/* Sidebar gauche */}
      <Sidebar />
      {/* Fil de posts centré */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xl border-x border-gray-800 min-h-screen bg-[#15202b]">
          {/* Header fixe */}
          <header className="w-full bg-[#15202b] sticky top-0 z-10 flex items-center justify-center h-16 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Accueil</h1>
          </header>
          <main className="px-0 sm:px-4 py-4">
            {/* Formulaire de création de post */}
            <div className="bg-[#192734] rounded-xl shadow p-4 mb-6 flex gap-3">
              {/* Avatar fictif ou initiale */}
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-xl font-bold text-blue-400">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <form onSubmit={handleSubmitPost} className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={isAuthenticated ? "Quoi de neuf ?" : "Connectez-vous pour publier un post"}
                  className="w-full p-3 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#22303c] text-white"
                  rows="2"
                  disabled={!isAuthenticated}
                />
                <div className="mt-2 flex justify-end">
                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={!newPost.trim()}
                      className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Poster
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push('/signin')}
                      className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Se connecter pour publier
                    </button>
                  )}
                </div>
              </form>
            </div>
            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            {/* Liste des posts */}
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <div key={post.id} className="bg-[#192734] rounded-xl shadow p-5 flex gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-blue-400">
                    {post.author?.name?.charAt(0)?.toUpperCase() || post.author?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{post.author?.name}</span>
                      <span className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-200 mb-2 whitespace-pre-line">{post.content}</p>
                    <div className="flex gap-4 text-gray-400 text-sm">
                      {/* Action répondre */}
                      {isAuthenticated ? (
                        <button
                          onClick={() => setReplyingTo(post.id)}
                          className="hover:text-blue-400 font-medium"
                        >
                          Répondre
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/signin')}
                          className="hover:text-blue-400 font-medium"
                        >
                          Connectez-vous pour répondre
                        </button>
                      )}
                      {/* Like (à améliorer si tu veux) */}
                      <span>❤️ {post.likes?.length || 0}</span>
                    </div>
                    {/* Formulaire de réponse */}
                    {replyingTo === post.id && (
                      <form onSubmit={handleReply} className="mt-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Votre réponse..."
                          className="w-full p-3 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#22303c] text-white"
                          rows="2"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={!replyContent.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            Répondre
                          </button>
                        </div>
                      </form>
                    )}
                    {/* Affichage des réponses */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 border-l-2 border-gray-800 pl-4 space-y-2">
                        {post.replies.map(reply => (
                          <div key={reply.id} className="flex gap-2 items-start">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-blue-300">
                              {reply.author?.name?.charAt(0)?.toUpperCase() || reply.author?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-blue-200 text-xs">{reply.author?.name}</span>
                              <span className="text-gray-500 text-xs ml-2">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              <p className="text-gray-300 text-sm whitespace-pre-line">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
      {/* Sidebar droite (optionnelle, vide pour l'instant) */}
      <div className="hidden xl:block w-[350px] bg-[#15202b] border-l border-gray-800"></div>
    </div>
  )
} 