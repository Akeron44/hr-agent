import { NextRequest, NextResponse } from 'next/server'
import { createJobPostingFromForm } from '@/lib/services/job-posting-service'
import { JobPostingFormData } from '@/app/components/company/JobPostingForm'

export async function POST(req: NextRequest) {
  try {
    const formData: JobPostingFormData = await req.json()
    
    if (!formData.title?.trim()) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    if (!formData.description?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    console.log('💼 Creating job posting:', formData.title)
    
    const jobPosting = await createJobPostingFromForm(formData, 'system')
    
    console.log('✅ Job posting created:', jobPosting.id)
    
    return NextResponse.json({
      success: true,
      data: jobPosting,
      message: 'Job posting created successfully'
    })
    
  } catch (error) {
    console.error('❌ Job posting creation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to create job posting. Please try again.' },
      { status: 500 }
    )
  }
}