import { prisma } from '../prisma'
import { JobStatus, EmploymentType } from '@prisma/client'
import { JobPostingData } from '../agents/job-extraction-agent'
import { JobPostingFormData } from '../../app/components/company/JobPostingForm'

// ===== TYPES & INTERFACES =====

export interface CreateJobPostingInput {
  title: string
  department?: string
  location?: string
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  description: string
  requirements: string
  benefits?: string
  remoteAllowed: boolean
  minimumExperience: number
  preferredEducation?: string
  roleLevel: string
  requiredSkills: string[]
  preferredSkills: string[]
  
  companyName?: string
  sourceUrl?: string
  extractionMethod?: 'AI_EXTRACTED' | 'MANUAL'
  
  createdBy?: string
}

export interface JobPostingRecord {
  id: string
  title: string
  department?: string
  location?: string
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  description?: string
  requirements?: string
  benefits?: string
  remoteAllowed: boolean
  status: JobStatus
  minimumExperience: number
  preferredEducation?: string
  roleLevel?: string
  requiredSkills: string[]
  preferredSkills: string[]
  companyName?: string
  sourceUrl?: string
  extractedAt?: Date
  extractionMethod?: string
  createdAt: Date
  updatedAt: Date
  postedAt?: Date
  closesAt?: Date
  createdBy?: string
}

// ===== MAIN FUNCTIONS =====

/**
 * Create a new job posting from extracted data
 */
export async function createJobPostingFromExtraction(
  extractedData: JobPostingData,
  sourceUrl: string,
  createdBy?: string
): Promise<JobPostingRecord> {
  try {
    console.log('💼 Creating job posting from AI extraction...')
    
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title: extractedData.title,
        department: extractedData.department,
        location: extractedData.location,
        employmentType: mapEmploymentType(extractedData.employmentType),
        salaryMin: extractedData.salaryMin,
        salaryMax: extractedData.salaryMax,
        salaryCurrency: extractedData.salaryCurrency || 'USD',
        description: extractedData.description,
        requirements: extractedData.requirements,
        benefits: extractedData.benefits,
        remoteAllowed: extractedData.remoteAllowed,
        minimumExperience: extractedData.minimumExperience,
        preferredEducation: extractedData.preferredEducation,
        roleLevel: extractedData.roleLevel,
        requiredSkills: extractedData.requiredSkills,
        preferredSkills: extractedData.preferredSkills,
        companyName: extractedData.companyName,
        sourceUrl: sourceUrl,
        extractedAt: new Date(),
        extractionMethod: 'AI_EXTRACTED',
        status: JobStatus.DRAFT,
        createdBy: createdBy,
      }
    })

    console.log(`✅ Created job posting: ${jobPosting.title} (ID: ${jobPosting.id})`)
    return transformDatabaseRecordToJobPostingRecord(jobPosting)
    
  } catch (error) {
    console.error('❌ Error creating job posting from extraction:', error)
    throw error
  }
}

/**
 * Create a new job posting from manual form data
 */
export async function createJobPostingFromForm(
  formData: JobPostingFormData,
  createdBy?: string
): Promise<JobPostingRecord> {
  try {
    console.log('💼 Creating job posting from manual form...')
    
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title: formData.title,
        department: formData.department || undefined,
        location: formData.location || undefined,
        employmentType: mapEmploymentType(formData.employmentType),
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        salaryCurrency: 'USD', // Default for manual entries
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        remoteAllowed: formData.remoteAllowed,
        minimumExperience: formData.minimumExperience,
        preferredEducation: formData.preferredEducation,
        roleLevel: formData.roleLevel,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        extractionMethod: 'MANUAL',
        status: JobStatus.DRAFT,
        createdBy: createdBy,
      }
    })

    console.log(`✅ Created job posting: ${jobPosting.title} (ID: ${jobPosting.id})`)
    return transformDatabaseRecordToJobPostingRecord(jobPosting)
    
  } catch (error) {
    console.error('❌ Error creating job posting from form:', error)
    throw error
  }
}

/**
 * Update job posting status
 */
export async function updateJobPostingStatus(
  jobId: string,
  status: JobStatus
): Promise<JobPostingRecord> {
  try {
    const jobPosting = await prisma.jobPosting.update({
      where: { id: jobId },
      data: { 
        status,
        postedAt: status === JobStatus.ACTIVE ? new Date() : undefined
      }
    })

    console.log(`📝 Updated job posting ${jobId} status to ${status}`)
    return transformDatabaseRecordToJobPostingRecord(jobPosting)
    
  } catch (error) {
    console.error(`❌ Error updating job posting ${jobId}:`, error)
    throw error
  }
}

/**
 * Get job posting by ID
 */
export async function getJobPosting(jobId: string): Promise<JobPostingRecord | null> {
  try {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          select: {
            id: true,
            candidateName: true,
            status: true,
            submittedAt: true
          }
        }
      }
    })

    if (!jobPosting) {
      return null
    }

    return transformDatabaseRecordToJobPostingRecord(jobPosting)
    
  } catch (error) {
    console.error(`❌ Error getting job posting ${jobId}:`, error)
    throw error
  }
}

/**
 * Get all job postings with optional filtering
 */
export async function getAllJobPostings(options?: {
  status?: JobStatus
  limit?: number
  offset?: number
}): Promise<JobPostingRecord[]> {
  try {
    const jobPostings = await prisma.jobPosting.findMany({
      where: options?.status ? { status: options.status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
      include: {
        applications: {
          select: {
            id: true,
            candidateName: true,
            status: true,
            submittedAt: true
          }
        }
      }
    })

    return jobPostings.map(transformDatabaseRecordToJobPostingRecord)
    
  } catch (error) {
    console.error('❌ Error getting all job postings:', error)
    throw error
  }
}

/**
 * Get job posting statistics
 */
export async function getJobPostingStats() {
  try {
    const stats = await prisma.jobPosting.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const totalCount = await prisma.jobPosting.count()
    const extractedCount = await prisma.jobPosting.count({
      where: { extractionMethod: 'AI_EXTRACTED' }
    })
    
    return {
      total: totalCount,
      aiExtracted: extractedCount,
      manual: totalCount - extractedCount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>)
    }
    
  } catch (error) {
    console.error('❌ Error getting job posting stats:', error)
    throw error
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Transform database record to JobPostingRecord format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDatabaseRecordToJobPostingRecord(dbRecord: any): JobPostingRecord {
  return {
    id: dbRecord.id,
    title: dbRecord.title,
    department: dbRecord.department,
    location: dbRecord.location,
    employmentType: dbRecord.employmentType,
    salaryMin: dbRecord.salaryMin,
    salaryMax: dbRecord.salaryMax,
    salaryCurrency: dbRecord.salaryCurrency,
    description: dbRecord.description,
    requirements: dbRecord.requirements,
    benefits: dbRecord.benefits,
    remoteAllowed: dbRecord.remoteAllowed,
    status: dbRecord.status,
    minimumExperience: dbRecord.minimumExperience,
    preferredEducation: dbRecord.preferredEducation,
    roleLevel: dbRecord.roleLevel,
    requiredSkills: dbRecord.requiredSkills || [],
    preferredSkills: dbRecord.preferredSkills || [],
    companyName: dbRecord.companyName,
    sourceUrl: dbRecord.sourceUrl,
    extractedAt: dbRecord.extractedAt,
    extractionMethod: dbRecord.extractionMethod,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
    postedAt: dbRecord.postedAt,
    closesAt: dbRecord.closesAt,
    createdBy: dbRecord.createdBy,
  }
}

/**
 * Map employment type string to enum
 */
function mapEmploymentType(employmentType: string): EmploymentType {
  const typeMap: Record<string, EmploymentType> = {
    'FULL_TIME': EmploymentType.FULL_TIME,
    'PART_TIME': EmploymentType.PART_TIME,
    'CONTRACT': EmploymentType.CONTRACT,
    'INTERNSHIP': EmploymentType.INTERNSHIP,
    'FREELANCE': EmploymentType.FREELANCE,
  }
  
  return typeMap[employmentType] || EmploymentType.FULL_TIME
}