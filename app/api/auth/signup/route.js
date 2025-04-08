import { NextResponse } from 'next/server'
import prisma from '../../../utils/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur avec un ID généré automatiquement (uuid)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    // Retourner une réponse sans le mot de passe
    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription', error: error.message },
      { status: 500 }
    )
  }
} 