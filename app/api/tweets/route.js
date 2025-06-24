export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../utils/prisma'

// Récupérer tous les tweets
export async function GET() {
  try {
    const tweets = await prisma.tweet.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            avatar: true,
          }
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tweets })
  } catch (error) {
    console.error('Erreur lors de la récupération des tweets:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des tweets' },
      { status: 500 }
    )
  }
}

// Créer un nouveau tweet
export async function POST(request) {
  try {
    const token = cookies().get('auth-token')

    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    const { content, imageUrl } = await request.json()

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Le contenu du tweet ne peut pas être vide' },
        { status: 400 }
      )
    }

    const tweet = await prisma.tweet.create({
      data: {
        content,
        imageUrl,
        authorId: decoded.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({ tweet }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du tweet:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création du tweet' },
      { status: 500 }
    )
  }
} 