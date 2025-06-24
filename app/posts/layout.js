export default function PostsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

// Forcer le rendu dynamique de la page
export const dynamic = 'force-dynamic' 