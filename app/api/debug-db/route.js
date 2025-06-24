import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    console.log('Test de connexion à la base de données...')
    console.log('URL de la base de données:', process.env.DATABASE_URL)
    
    // Test de connexion
    await prisma.$connect()
    console.log('Connexion établie avec succès')
    
    // Test de requête simple
    const userCount = await prisma.user.count()
    console.log('Nombre d\'utilisateurs:', userCount)
    
    // Test de création d'utilisateur
    const testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@test.com`,
        password: 'test123',
      }
    })
    console.log('Utilisateur test créé:', testUser.id)
    
    // Suppression de l'utilisateur test
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('Utilisateur test supprimé')
    
    return NextResponse.json({
      status: 'success',
      message: 'Tests de base de données réussis',
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:\/\/\s]*@/, ':****@')
    })
    
  } catch (error) {
    console.error('Erreur détaillée:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Erreur de connexion à la base de données',
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        clientVersion: prisma._engineConfig.generator.config.version,
        details: error.stack
      }
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
} 