export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    console.log('Route signin: Nouvelle tentative de connexion')
    const { email, password } = await request.json()

    // Validation des champs
    if (!email || !password) {
      console.log('Route signin: Données manquantes')
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('Route signin: Utilisateur non trouvé')
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérification du mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      console.log('Route signin: Mot de passe incorrect')
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Création du token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('Route signin: Connexion réussie')

    // Configuration du cookie et de la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Route signin: Erreur:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}