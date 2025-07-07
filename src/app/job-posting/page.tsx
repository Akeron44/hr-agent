'use client'

import { useState } from 'react'
import { JobCreationHeader, JobCreationMode } from '../components/company/Header'
import { JobPostingForm, JobPostingFormData } from '../components/company/JobPostingForm'
import { JobUrlForm } from '../components/company/JobUrlForm'
import  Header from '../components/common/Header'
import { useRouter } from 'next/navigation'

export default function JobPosting() {
  const [mode, setMode] = useState<JobCreationMode>('manual')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [extractedData, setExtractedData] = useState<Partial<JobPostingFormData> | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayMode, setDisplayMode] = useState<JobCreationMode>('manual')
  const router = useRouter()

  const handleModeChange = (newMode: JobCreationMode, preserveData: boolean = false) => {
    if (newMode === mode) return
    
    setIsTransitioning(true)
    setError('')
    
    setTimeout(() => {
      setMode(newMode)
      setDisplayMode(newMode)
      
      if (newMode === 'manual' && !preserveData) {
        setExtractedData(null)
      }
      
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 150)
  }

  const handleUrlExtraction = async (url: string) => {
    setIsLoading(true)
    setError('')
    console.log('🔍 Starting job extraction for URL:', url)
    
    try {
      const response = await fetch('/api/job-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract job information')
      }

      if (!result.success || !result.data) {
        throw new Error('Invalid response format from extraction service')
      }

      console.log('result.data', result.data)
      const extractedJobData = result.data
      const formData: Partial<JobPostingFormData> = {
        title: extractedJobData.title,
        department: extractedJobData.department || '',
        location: extractedJobData.location || '',
        employmentType: extractedJobData.employmentType === 'FREELANCE' ? 'CONTRACT' : extractedJobData.employmentType,
        description: extractedJobData.description,
        requirements: extractedJobData.requirements,
        benefits: extractedJobData.benefits || undefined,
        remoteAllowed: extractedJobData.remoteAllowed,
        minimumExperience: extractedJobData.minimumExperience,
        preferredEducation: extractedJobData.preferredEducation || undefined,
        roleLevel: extractedJobData.roleLevel,
        requiredSkills: extractedJobData.requiredSkills,
        preferredSkills: extractedJobData.preferredSkills,
        companyName: extractedJobData.companyName,
      }
      
      console.log('✅ Job extraction successful:', {
        title: formData.title,
        company: extractedJobData.companyName,
        skills: formData.requiredSkills?.length || 0
      })
      
      setExtractedData(formData)
      handleModeChange('manual', true)
      
    } catch (err) {
      console.error('❌ Job extraction error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while extracting job information')
    } finally {
      setIsLoading(false)
    }
  }


  console.log('extractedData', extractedData)

const handleManualSubmit = async (formData: JobPostingFormData) => {
  setIsLoading(true)
  setError('')
  
  try {
    console.log('💼 Creating job posting:', formData)
    const response = await fetch('/api/job-posting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create job posting')
    }

    console.log('✅ Job posting created successfully:', result.data)
    
    setExtractedData(null)
    router.push('/my-posts')
    
  } catch (err) {
    console.error('❌ Job creation error:', err)
    setError(err instanceof Error ? err.message : 'An error occurred while creating the job posting')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <><Header />
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto pt-8">
        
        <JobCreationHeader 
          activeMode={mode} 
          onModeChange={handleModeChange}
        />

        <div className="relative overflow-hidden">
          <div 
            className={`
              transition-all duration-300 ease-in-out transform
              ${isTransitioning 
                ? 'opacity-0 translate-y-4 scale-[0.98]' 
                : 'opacity-100 translate-y-0 scale-100'
              }
            `}
          >
            {displayMode === 'manual' ? (
              <JobPostingForm
                initialData={extractedData || undefined}
                onSubmit={handleManualSubmit}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <JobUrlForm
                onExtract={handleUrlExtraction}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </main>
    </>
  )
}