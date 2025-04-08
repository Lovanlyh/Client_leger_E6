import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../utils/prisma'

export async function GET() {
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
    const userId = decoded.userId
    
    // Compter les messages non lus
    const count = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    })
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error)
    return NextResponse.json(
      { message: 'Erreur lors du comptage des messages non lus', count: 0 },
      { status: 500 }
    )
  }
} 