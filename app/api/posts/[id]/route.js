export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../utils/prisma'

// Récupérer un post spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params

    const post = await prisma.post.findUnique({
      where: { id },
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
      }
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du post' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Supprimer un post
export async function DELETE(request, { params }) {
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

    // Vérifier si le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json(
        { message: 'Post non trouvé' },
        { status: 404 }
      )
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer le post
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Post supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du post' },
      { status: 500 }
    )
  }
} 