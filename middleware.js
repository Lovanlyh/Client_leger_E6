import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function middleware(request) {
  console.log(`Middleware: URL demandée = ${request.nextUrl.pathname}`)
  
  // Obtenir le cookie d'authentification depuis la requête
  const authCookie = request.cookies.get('auth-token')
  console.log(`Middleware: Token présent = ${!!authCookie}`)
  
  // Routes protégées
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/messages',
    '/api/posts',
    '/api/messages',
    '/api/users'
  ]
  
  // Vérifie si l'URL actuelle commence par l'un des chemins protégés
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  console.log(`Middleware: Route protégée = ${isProtectedPath}`)

  // Si c'est une route protégée
  if (isProtectedPath) {
    // Si pas de token, rediriger vers la page de connexion
    if (!authCookie) {
      console.log('Middleware: Redirection vers /signin (pas de token)')
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    try {
      // Vérifier le token
      console.log('Middleware: Vérification du token...')
      const decoded = verify(authCookie.value, process.env.JWT_SECRET || 'your-secret-key')
      console.log(`Middleware: Token valide pour l'utilisateur ${decoded.email}`)
      return NextResponse.next()
    } catch (error) {
      // Si le token est invalide, rediriger vers la page de connexion
      console.log('Middleware: Token invalide, redirection vers /signin')
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  // Si c'est une route publique (signin, signup) et qu'un token valide existe
  if (authCookie && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
    try {
      console.log('Middleware: Vérification du token sur route publique...')
      const decoded = verify(authCookie.value, process.env.JWT_SECRET || 'your-secret-key')
      console.log(`Middleware: Token valide sur route publique, redirection vers /dashboard pour ${decoded.email}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      // Si le token est invalide, continuer
      console.log('Middleware: Token invalide sur route publique')
      return NextResponse.next()
    }
  }

  console.log('Middleware: Continuer sans redirection')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/messages/:path*',
    '/api/posts/:path*',
    '/api/messages/:path*',
    '/api/users/:path*',
    '/signin',
    '/signup'
  ]
} 