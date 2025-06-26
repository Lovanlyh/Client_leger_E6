export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../utils/prisma'

// GET /api/posts - Public
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { parentId: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        likes: true,
        replies: {
          include: {
            author: { select: { id: true, name: true, email: true } },
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Protégé
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    console.log('TOKEN reçu:', token)
    console.log('JWT_SECRET:', process.env.JWT_SECRET)
    if (!token) {
      console.log('Aucun token trouvé dans les cookies')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    let decoded = null
    try {
      decoded = verify(token, process.env.JWT_SECRET)
      console.log('Token décodé:', decoded)
    } catch (err) {
      console.log('Erreur lors du décodage du token:', err)
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
    if (!decoded) {
      console.log('Token décodé null ou undefined')
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
    const { content } = await request.json()
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu ne peut pas être vide' },
        { status: 400 }
      )
    }
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: decoded.userId
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        likes: true,
        replies: true
      }
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error('Erreur lors de la création du post (catch global):', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du post', details: error.message },
      { status: 500 }
    )
  }
} 