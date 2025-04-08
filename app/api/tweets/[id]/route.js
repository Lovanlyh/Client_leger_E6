import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../../utils/prisma'

// Récupérer un tweet spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params

    const tweet = await prisma.tweet.findUnique({
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

    if (!tweet) {
      return NextResponse.json(
        { message: 'Tweet non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tweet })
  } catch (error) {
    console.error('Erreur lors de la récupération du tweet:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du tweet' },
      { status: 500 }
    )
  }
}

// Supprimer un tweet
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
    const { id } = params

    const tweet = await prisma.tweet.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!tweet) {
      return NextResponse.json(
        { message: 'Tweet non trouvé' },
        { status: 404 }
      )
    }

    if (tweet.authorId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      )
    }

    await prisma.tweet.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tweet supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du tweet:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du tweet' },
      { status: 500 }
    )
  }
} 