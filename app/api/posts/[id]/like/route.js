import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../../utils/prisma'

// POST /api/posts/[id]/like - Ajouter/Retirer un like
export async function POST(request, { params }) {
  try {
    const token = cookies().get('auth-token')
    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    const postId = params.id

    // Vérifier si le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur a déjà liké le post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: postId
        }
      }
    })

    if (existingLike) {
      // Si le like existe, on le supprime
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: decoded.userId,
            postId: postId
          }
        }
      })
      return NextResponse.json({ message: 'Like retiré' })
    } else {
      // Si le like n'existe pas, on le crée
      await prisma.like.create({
        data: {
          userId: decoded.userId,
          postId: postId
        }
      })
      return NextResponse.json({ message: 'Like ajouté' })
    }
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
} 