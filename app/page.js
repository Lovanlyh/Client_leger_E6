'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-red-500 to-rose-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(239,_68,_68,_0.2)] p-8 space-y-8 mx-4 transform hover:scale-[1.01] transition-all duration-300">
        <h1 className="text-4xl font-bold text-center text-gray-900 tracking-tight">Bienvenue sur le projet Fil-Rouge</h1>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/signin')}
            className="w-full py-3 px-6 rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg font-semibold"
          >
            Se connecter
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="w-full py-3 px-6 rounded-xl border-2 border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg font-semibold"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  )
} 