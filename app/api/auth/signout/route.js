import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    console.log('Route signout: Tentative de déconnexion')
    
    const cookieStore = cookies()
    cookieStore.delete('token')
    
    console.log('Route signout: Déconnexion réussie')
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Route signout: Erreur:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    )
  }
} 