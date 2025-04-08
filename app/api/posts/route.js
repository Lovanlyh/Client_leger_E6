import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../utils/prisma'

// Récupérer tous les posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where = userId ? { authorId: userId } : {}

    const posts = await prisma.post.findMany({
      where,
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

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    )
  }
}

// Créer un nouveau post
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
        { message: 'Le contenu du post ne peut pas être vide' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
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

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création du post' },
      { status: 500 }
    )
  }
} 