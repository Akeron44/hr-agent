import { NextRequest, NextResponse } from 'next/server'
import { getApplication } from '@/lib/services/database-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params
    
    if (!submissionId?.trim()) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    const application = await getApplication(submissionId)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      submissionId: application.submissionId,
      candidateName: application.candidateName,
      status: application.status,
      submittedAt: application.submittedAt,
      processedAt: application.processedAt,
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Error checking application status' },
      { status: 500 }
    )
  }
}
