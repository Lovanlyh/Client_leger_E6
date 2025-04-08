'use client'

import Navbar from '../../components/navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Barre de navigation latérale */}
          <div className="md:w-64 flex-shrink-0">
            <Navbar />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-grow">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 