import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../../utils/prisma'

export async function POST(request, { params }) {
  try {
    const token = cookies().get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier le token
    const decoded = verify(token, process.env.JWT_SECRET)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    const { content } = await request.json()
    const postId = params.id

    // Vérifier si le post parent existe
    const parentPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!parentPost) {
      return NextResponse.json(
        { error: 'Post parent non trouvé' },
        { status: 404 }
      )
    }

    // Créer la réponse
    const reply = await prisma.post.create({
      data: {
        content,
        authorId: decoded.userId,
        parentId: postId,
        replyAuthorId: decoded.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likes: true
      }
    })

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Erreur lors de la création de la réponse:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réponse' },
      { status: 500 }
    )
  }
} 