import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const method = request.method;
  // Protéger uniquement les requêtes d'écriture
  const isProtectedApi = (
    (path.startsWith('/api/posts') || path.startsWith('/api/messages') || path.startsWith('/api/users')) &&
    (method === 'POST' || method === 'PUT' || method === 'DELETE')
  );
  if (!isProtectedApi) {
    return NextResponse.next();
  }
  // Authentification requise pour les requêtes protégées
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  try {
    verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/posts/:path*', '/api/messages/:path*', '/api/users/:path*'],
}; 