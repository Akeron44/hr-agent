import { NextResponse } from 'next/server'
import { fetchJobPosts } from '@/lib/services/storage-service'


export async function GET() {
  try {

    const jobPosts = await fetchJobPosts()
    
    console.log('✅ Job posts fetched:', jobPosts)
    
    return NextResponse.json({
      success: true,
      data: jobPosts,
      message: 'Job posts fetched successfully'
    })
    
  } catch (error) {
    console.error('❌ Job posting creation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to create job posting. Please try again.' },
      { status: 500 }
    )
  }
}