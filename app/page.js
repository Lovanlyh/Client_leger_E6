'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Bienvenue</h1>
      <div className="space-x-4">
        <button
          onClick={() => router.push('/signin')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Se connecter
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          S'inscrire
        </button>
      </div>
    </div>
  )
} 