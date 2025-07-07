import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'


export async function GET() {
    try {
    const prisma = new PrismaClient()
    const applications = await prisma.application.findMany({
        include: {
          jobPosting: true,
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}