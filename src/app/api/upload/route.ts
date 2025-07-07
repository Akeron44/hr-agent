import { NextRequest, NextResponse } from 'next/server'
import { applicationQueue } from '@/lib/queue/application-queue'
import { nanoid } from 'nanoid'
import { createApplication } from '@/lib/services/database-service'
import { JobPostingRecord } from '@/lib/services/job-posting-service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const candidateName = formData.get('name') as string
    const candidateEmail = formData.get('email') as string
    const candidateDescription = formData.get('description') as string
    const jobPost: JobPostingRecord = JSON.parse(formData.get('jobPost') as string)
    const files = formData.getAll('files') as File[];

    if (!candidateName?.trim()) {
      return NextResponse.json(
        { error: 'Candidate name is required' },
        { status: 400 }
      )
    }

    if (!candidateEmail?.trim()) {
      return NextResponse.json(
        { error: 'Candidate email is required' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      )
    }
    
    const submissionId = nanoid()
    
    console.log(`📥 New application from ${candidateName} (${submissionId})`)
    
    const fileData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        base64Data: Buffer.from(await file.arrayBuffer()).toString('base64')
      }))
    )

    await createApplication({
      submissionId,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      candidateDescription: candidateDescription?.trim() || '',
      fileNames: files.map(f => f.name),
      status: 'SUBMITTED',
      submittedAt: new Date(),
      jobPostingId: jobPost.id
    })
    
    const job = await applicationQueue.add('hr-application', {
      submissionId,
      candidateName,
      candidateEmail,
      candidateDescription,
      files: fileData, 
      timestamp: new Date(),
      jobPost: jobPost
    }, {
      delay: 2000,
      priority: 1,
    })
    
    console.log(`🎯 Queued job application ${job.id} for ${candidateName}`)
    
    return NextResponse.json({ 
      message: 'Application submitted successfully! We will review it and get back to you soon.',
      submissionId,
      status: 'submitted'
    })
    
  } catch (error) {
    console.error('❌ Submission Error:', error)
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This application has already been submitted' },
          { status: 409 }
        )
      }
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error processing application. Please try again.' },
      { status: 500 }
    )
  }
}
