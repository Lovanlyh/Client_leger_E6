import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../../utils/prisma'

// Ajouter ou supprimer un like
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
    const { id } = params

    // Vérifier si le post existe
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur a déjà aimé ce post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: id
        }
      }
    })

    if (existingLike) {
      // Si le like existe, le supprimer
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      })
      return NextResponse.json({ liked: false })
    } else {
      // Sinon, créer un nouveau like
      await prisma.like.create({
        data: {
          userId: decoded.userId,
          postId: id
        }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
} 