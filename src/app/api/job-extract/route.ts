import { NextRequest, NextResponse } from 'next/server'
import { JobExtractionAgent } from '@/lib/agents/job-extraction-agent'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    
    if (!url?.trim()) {
      return NextResponse.json(
        { error: 'Job URL is required' },
        { status: 400 }
      )
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting job extraction for URL: ${url}`)
    
    const jobExtractionAgent = new JobExtractionAgent()
    const extractedData = await jobExtractionAgent.execute(url.trim())
    
    console.log(`✅ Job extraction completed for: ${extractedData.title}`)
    
    return NextResponse.json({
      success: true,
      data: extractedData,
      extractedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Job extraction error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to scrape')) {
        return NextResponse.json(
          { error: 'Unable to access the job posting URL. Please check if the URL is correct and publicly accessible.' },
          { status: 422 }
        )
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. The job posting page may be too slow to load.' },
          { status: 408 }
        )
      }
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment before trying again.' },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to extract job information. Please try again or contact support.' },
      { status: 500 }
    )
  }
} 