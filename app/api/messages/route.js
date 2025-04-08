import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from '../../utils/prisma'

// Obtenir tous les messages (conversations) de l'utilisateur connecté
export async function GET(request) {
  try {
    // Récupérer et vérifier le token d'authentification
    const token = cookies().get('auth-token')
    
    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    const userId = decoded.userId
    
    // Récupérer le paramètre de requête pour filtrer par conversation
    const { searchParams } = new URL(request.url)
    const withUserId = searchParams.get('withUserId')
    
    if (withUserId) {
      // Si un ID utilisateur est spécifié, récupérer la conversation avec cet utilisateur
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: withUserId },
            { senderId: withUserId, recipientId: userId }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              avatar: true
            }
          },
          recipient: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        }
      })
      
      // Marquer tous les messages non lus comme lus
      await prisma.message.updateMany({
        where: {
          recipientId: userId,
          senderId: withUserId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
      
      return NextResponse.json({ messages })
    } else {
      // Récupérer la liste des utilisateurs avec qui l'utilisateur courant a échangé des messages
      const sentMessagesQuery = prisma.message.findMany({
        where: { senderId: userId },
        select: { recipientId: true, createdAt: true }
      })
      
      const receivedMessagesQuery = prisma.message.findMany({
        where: { recipientId: userId },
        select: { senderId: true, createdAt: true }
      })
      
      const [sentMessages, receivedMessages] = await Promise.all([
        sentMessagesQuery, receivedMessagesQuery
      ])
      
      // Combiner les utilisateurs uniques avec qui l'utilisateur courant a échangé des messages
      const contactIdsSet = new Set()
      
      sentMessages.forEach(msg => contactIdsSet.add(msg.recipientId))
      receivedMessages.forEach(msg => contactIdsSet.add(msg.senderId))
      
      const contactIds = Array.from(contactIdsSet)
      
      // Récupérer les détails des contacts et le dernier message pour chaque conversation
      const conversations = await Promise.all(
        contactIds.map(async (contactId) => {
          const contact = await prisma.user.findUnique({
            where: { id: contactId },
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              avatar: true
            }
          })
          
          const lastMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, recipientId: contactId },
                { senderId: contactId, recipientId: userId }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              isRead: true
            }
          })
          
          const unreadCount = await prisma.message.count({
            where: {
              senderId: contactId,
              recipientId: userId,
              isRead: false
            }
          })
          
          return {
            contact,
            lastMessage,
            unreadCount
          }
        })
      )
      
      // Trier les conversations par date du dernier message
      conversations.sort((a, b) => {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      })
      
      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

// Envoyer un nouveau message
export async function POST(request) {
  try {
    // Récupérer et vérifier le token d'authentification
    const token = cookies().get('auth-token')
    
    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key')
    const senderId = decoded.userId
    
    // Récupérer les données du message
    const { recipientId, content } = await request.json()
    
    // Vérifier que le destinataire existe
    const recipientExists = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true }
    })
    
    if (!recipientExists) {
      return NextResponse.json(
        { message: 'Destinataire introuvable' },
        { status: 404 }
      )
    }
    
    // Vérifier que le contenu n'est pas vide
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Le contenu du message ne peut pas être vide' },
        { status: 400 }
      )
    }
    
    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        recipientId
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    })
    
    return NextResponse.json(
      { message: 'Message envoyé avec succès', data: message },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
} 