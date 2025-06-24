// Ce script permet de créer/réinitialiser un utilisateur test 
// avec un mot de passe connu pour faciliter les tests

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Connexion à la base de données...')
    await prisma.$connect()
    console.log('Connexion établie')

    // Supprimer l'utilisateur test s'il existe
    console.log('Suppression de l\'utilisateur test existant...')
    await prisma.user.deleteMany({
      where: {
        email: 'test@test.com'
      }
    })
    console.log('Utilisateur test supprimé si existant')

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('test123', 10)

    // Créer l'utilisateur test
    console.log('Création du nouvel utilisateur test...')
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Utilisateur Test',
        username: 'testuser'
      }
    })

    console.log('Utilisateur test créé avec succès:', {
      id: user.id,
      email: user.email,
      name: user.name
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 