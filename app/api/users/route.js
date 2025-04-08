import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../utils/prisma'

// Récupérer la liste des utilisateurs
export async function GET(request) {
  try {
    // Vérifier l'authentification
    const token = cookies().get('auth-token')
    
    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    const currentUserId = decoded.userId

    // Paramètres de recherche (filtre par email ou nom)
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search') || ''

    // Rechercher les utilisateurs, en excluant l'utilisateur actuel
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { username: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limiter à 20 résultats
    })

    return NextResponse.json({ users })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
} 