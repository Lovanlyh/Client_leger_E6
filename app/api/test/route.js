import { NextResponse } from 'next/server'
import prisma from '@/app/utils/prisma'

export async function GET() {
  try {
    const testConnection = await prisma.$connect()
    return NextResponse.json({ status: 'Connected to database' })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ status: 'Error', message: error.message })
  } finally {
    await prisma.$disconnect()
  }
} 