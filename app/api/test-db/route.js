import { NextResponse } from 'next/server'
import prisma from '../../utils/prisma'

export async function GET() {
  try {
    // Test la connexion
    await prisma.$connect()
    
    // Essayez de récupérer le nombre d'utilisateurs
    const count = await prisma.user.count()
    
    return NextResponse.json({ 
      message: 'Connexion à la base de données réussie',
      count: count
    })
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    return NextResponse.json(
      { 
        message: 'Erreur de connexion à la base de données',
        error: error.message
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 