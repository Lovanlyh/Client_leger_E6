import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../utils/prisma'

export async function GET(request, { params }) {
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
    const { userId } = params
    
    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
} 