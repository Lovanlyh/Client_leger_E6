'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../../components/loader'
import { useAuth } from '../../context/AuthContext'

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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Formulaire de création de post */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={isAuthenticated ? "Quoi de neuf ?" : "Connectez-vous pour publier un post"}
              className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="3"
              disabled={!isAuthenticated}
            />
            <div className="mt-4 flex justify-end">
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={!newPost.trim()}
                  className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Poster
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/signin')}
                  className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Se connecter pour publier
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des posts */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{post.author?.name}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-4">{post.content}</p>
                  {/* Bouton pour répondre */}
                  {isAuthenticated ? (
                    <button
                      onClick={() => setReplyingTo(post.id)}
                      className="text-gray-500 hover:text-red-500 text-sm"
                    >
                      Répondre
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/signin')}
                      className="text-gray-400 text-sm cursor-pointer hover:text-red-500"
                    >
                      Connectez-vous pour répondre
                    </button>
                  )}
                  {/* Formulaire de réponse */}
                  {replyingTo === post.id && isAuthenticated && (
                    <form onSubmit={handleReply} className="mt-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Votre réponse..."
                        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="2"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={!replyContent.trim()}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Répondre
                        </button>
                      </div>
                    </form>
                  )}
                  {/* Afficher les réponses */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      {post.replies.map(reply => (
                        <div key={reply.id} className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{reply.author?.name}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-900">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 