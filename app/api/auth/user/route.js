import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../utils/prisma'

export async function GET() {
  try {
    console.log('API User: Vérification du token...')
    const token = cookies().get('auth-token')

    if (!token) {
      console.log('API User: Pas de token trouvé')
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    console.log('API User: Décodage du token...')
    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    console.log(`API User: Token décodé pour l'utilisateur ID: ${decoded.userId}`)
    
    // Récupérer les données utilisateur depuis la base de données
    console.log('API User: Récupération des données utilisateur...')
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true,
        email: true,
        createdAt: true,
        name: true,
        username: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!user) {
      console.log('API User: Utilisateur non trouvé')
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log('API User: Utilisateur trouvé, envoi des données')
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        name: user.name || user.email.split('@')[0],
        username: user.username || user.email.split('@')[0],
        postsCount: user._count.posts
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { message: 'Non authentifié', error: error.message },
      { status: 401 }
    )
  }
} 