import { NextRequest, NextResponse } from 'next/server'
import { fetchJobPostById } from '@/lib/services/storage-service'


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params

    const jobPost = await fetchJobPostById(id)
    
    console.log('✅ Job post fetched:', jobPost)
    
    return NextResponse.json({
      success: true,
      data: jobPost,
      message: 'Job post fetched successfully'
    })
    
  } catch (error) {
    console.error('❌ Job post fetching error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch job post. Please try again.' },
      { status: 500 }
    )
  }
}