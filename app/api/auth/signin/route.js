import { NextResponse } from 'next/server'
import prisma from '../../../utils/prisma'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    console.log('Tentative de connexion...')
    const { email, password } = await request.json()
    console.log(`Email reçu: ${email}`)

    // Trouver l'utilisateur
    console.log('Recherche de l\'utilisateur dans la base de données...')
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('Utilisateur non trouvé')
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    console.log('Utilisateur trouvé, vérification du mot de passe...')
    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      console.log('Mot de passe incorrect')
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    console.log('Mot de passe correct, création du token...')
    // Créer le token JWT
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    console.log('Création de la réponse avec cookie...')
    // Créer une réponse JSON
    const response = NextResponse.json(
      { 
        message: 'Connexion réussie', 
        user: { 
          id: user.id,
          email: user.email
        },
        redirect: '/dashboard'
      },
      { status: 200 }
    )
    
    // Définir le cookie dans la réponse
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 24 heures
    })
    
    console.log('Cookie défini, envoi de la réponse')
    return response
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
} 