import { NextResponse } from 'next/server'
import prisma from '../../utils/prisma'

export async function GET() {
  try {
    // Test complet de la connexion
    console.log('Tentative de connexion à la base de données...')
    await prisma.$connect()
    console.log('Connexion établie')
    
    // Test des opérations CRUD
    console.log('Test de lecture...')
    const userCount = await prisma.user.count()
    console.log(`Nombre d'utilisateurs: ${userCount}`)
    
    // Informations sur la base de données
    const url = process.env.DATABASE_URL || 'Non définie'
    const maskedUrl = url.replace(/:([^:@]+)@/, ':******@')
    
    return NextResponse.json({
      status: 'success',
      message: 'Connexion à la base de données réussie',
      info: {
        dbUrl: maskedUrl,
        userCount,
        prismaVersion: require('@prisma/client/package.json').version,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('ERREUR DE CONNEXION:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Erreur de connexion à la base de données',
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 