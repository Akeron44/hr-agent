import { prisma } from '../prisma'
import { ApplicationStatus, RecommendationType } from '@prisma/client'
import { Prisma } from '@prisma/client'

// ===== TYPES & INTERFACES =====

export interface ApplicationRecord {
  submissionId: string
  candidateName: string
  candidateEmail: string
  candidateDescription: string
  fileNames: string[]
  status: string
  submittedAt: Date
  processedAt?: Date
  result?: ProcessingResult
  jobPostingId?: string
}

export interface ProcessingResult {
  candidateData: {
    yearsOfExperience: number
    technicalSkills: string[]
    educationLevel: string
    previousRoles: string[]
    redFlags: string[]
  }
  analysisResult: {
    technicalSkillsScore: number
    experienceScore: number
    educationScore: number
    overallFit: number
    concerns: string[]
    strengths: string[]
  }
  decisionResult: {
    recommendation: string
    confidence: number
    reasoning: string[]
    nextSteps: string[]
  }
  jobRequirements: {
    requiredSkills: string[]
    minimumExperience: number
    preferredEducation: string
    roleLevel: string
  }
  processedAt: string
}

// ===== INPUT VALIDATION =====

function validateApplicationInput(application: Omit<ApplicationRecord, 'result'>): void {
  if (!application.submissionId?.trim()) {
    throw new Error('Submission ID is required')
  }
  if (!application.candidateName?.trim()) {
    throw new Error('Candidate name is required')
  }
  if (!application.candidateEmail?.trim()) {
    throw new Error('Candidate email is required')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.candidateEmail)) {
    throw new Error('Invalid email format')
  }
  if (!Array.isArray(application.fileNames)) {
    throw new Error('File names must be an array')
  }
}

// ===== MAIN FUNCTIONS =====

/**
 * Create a new application in the database
 */
export async function createApplication(application: ApplicationRecord): Promise<void> {
  try {
    validateApplicationInput(application)
    
    const existing = await prisma.application.findUnique({
      where: { submissionId: application.submissionId }
    })
    
    if (existing) {
      throw new Error(`Application with ID ${application.submissionId} already exists`)
    }

    await prisma.application.create({
      data: {
        submissionId: application.submissionId,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        candidateDescription: application.candidateDescription,
        fileNames: application.fileNames,
        status: mapStatusToEnum(application.status),
        submittedAt: application.submittedAt,
        processedAt: application.processedAt,
        jobPostingId: application.jobPostingId
      }
    })

    console.log(`💾 Saved application ${application.submissionId} to database`)
    
  } catch (error) {
    console.error(`❌ Error creating application ${application.submissionId}:`, error)
    throw error
  }
}

/**
 * Update application status and optionally store processing results
 */
export async function updateApplicationStatus(
  submissionId: string, 
  status: string, 
  result?: ProcessingResult
): Promise<void> {
  try {
    if (!submissionId?.trim()) {
      throw new Error('Submission ID is required')
    }

    await prisma.$transaction(async (tx) => {
      const application = await tx.application.update({
        where: { submissionId },
        data: {
          status: mapStatusToEnum(status),
          processedAt: new Date(),
        }
      })

      if (result) {
        await storeProcessingResults(tx, application.id, result)
      }
    })

    console.log(`📝 Updated application ${submissionId} status to ${status}`)
    
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error(`❌ Application ${submissionId} not found`)
      throw new Error(`Application ${submissionId} not found`)
    }
    console.error(`❌ Error updating application ${submissionId}:`, error)
    throw error
  }
}

/**
 * Get application by submission ID with all related data
 */
export async function getApplication(submissionId: string): Promise<ApplicationRecord | null> {
  try {
    if (!submissionId?.trim()) {
      throw new Error('Submission ID is required')
    }

    const application = await prisma.application.findUnique({
      where: { submissionId },
      include: {
        candidateProfile: true,
        analysisResult: true,
        decisionResult: true,
      }
    })

    if (!application) {
      return null
    }

    return transformDatabaseRecordToApplicationRecord(application)
    
  } catch (error) {
    console.error(`❌ Error getting application ${submissionId}:`, error)
    throw error
  }
}

/**
 * Get all applications with optional filtering
 */
export async function getAllApplications(options?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<ApplicationRecord[]> {
  try {
    const applications = await prisma.application.findMany({
      where: options?.status ? { status: mapStatusToEnum(options.status) } : undefined,
      include: {
        candidateProfile: true,
        analysisResult: true,
        decisionResult: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    })

    return applications.map(transformDatabaseRecordToApplicationRecord)
    
  } catch (error) {
    console.error('❌ Error getting all applications:', error)
    throw error
  }
}

/**
 * Get application statistics
 */
export async function getApplicationStats() {
  try {
    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const totalCount = await prisma.application.count()
    
    return {
      total: totalCount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>)
    }
    
  } catch (error) {
    console.error('❌ Error getting application stats:', error)
    throw error
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Store processing results in related tables
 */
async function storeProcessingResults(
  tx: Prisma.TransactionClient,
  applicationId: string,
  result: ProcessingResult
): Promise<void> {
  
  if (result.candidateData) {
    await tx.candidateProfile.upsert({
      where: { applicationId },
      create: {
        applicationId,
        yearsOfExperience: result.candidateData.yearsOfExperience,
        educationLevel: result.candidateData.educationLevel,
        technicalSkills: result.candidateData.technicalSkills,
        previousRoles: result.candidateData.previousRoles,
        redFlags: result.candidateData.redFlags,
        rawCvData: result.candidateData,
      },
      update: {
        yearsOfExperience: result.candidateData.yearsOfExperience,
        educationLevel: result.candidateData.educationLevel,
        technicalSkills: result.candidateData.technicalSkills,
        previousRoles: result.candidateData.previousRoles,
        redFlags: result.candidateData.redFlags,
        rawCvData: result.candidateData,
      }
    })
  }

  if (result.analysisResult) {
    await tx.analysisResult.upsert({
      where: { applicationId },
      create: {
        applicationId,
        technicalSkillsScore: result.analysisResult.technicalSkillsScore,
        experienceScore: result.analysisResult.experienceScore,
        educationScore: result.analysisResult.educationScore,
        overallFit: result.analysisResult.overallFit,
        concerns: result.analysisResult.concerns,
        strengths: result.analysisResult.strengths,
      },
      update: {
        technicalSkillsScore: result.analysisResult.technicalSkillsScore,
        experienceScore: result.analysisResult.experienceScore,
        educationScore: result.analysisResult.educationScore,
        overallFit: result.analysisResult.overallFit,
        concerns: result.analysisResult.concerns,
        strengths: result.analysisResult.strengths,
      }
    })
  }

  if (result.decisionResult) {
    await tx.decisionResult.upsert({
      where: { applicationId },
      create: {
        applicationId,
        recommendation: mapRecommendationToEnum(result.decisionResult.recommendation),
        confidence: result.decisionResult.confidence,
        reasoning: result.decisionResult.reasoning,
        nextSteps: result.decisionResult.nextSteps,
        jobRequirements: result.jobRequirements,
      },
      update: {
        recommendation: mapRecommendationToEnum(result.decisionResult.recommendation),
        confidence: result.decisionResult.confidence,
        reasoning: result.decisionResult.reasoning,
        nextSteps: result.decisionResult.nextSteps,
        jobRequirements: result.jobRequirements,
      }
    })
  }
}

/**
 * Transform database record to ApplicationRecord format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDatabaseRecordToApplicationRecord(dbRecord: any): ApplicationRecord {
  const record: ApplicationRecord = {
    submissionId: dbRecord.submissionId,
    candidateName: dbRecord.candidateName,
    candidateEmail: dbRecord.candidateEmail,
    candidateDescription: dbRecord.candidateDescription || '',
    fileNames: dbRecord.fileNames || [],
    status: dbRecord.status,
    submittedAt: dbRecord.submittedAt,
    processedAt: dbRecord.processedAt,
  }

  if (dbRecord.candidateProfile || dbRecord.analysisResult || dbRecord.decisionResult) {
    record.result = {
      candidateData: dbRecord.candidateProfile ? {
        yearsOfExperience: dbRecord.candidateProfile.yearsOfExperience || 0,
        technicalSkills: dbRecord.candidateProfile.technicalSkills || [],
        educationLevel: dbRecord.candidateProfile.educationLevel || '',
        previousRoles: dbRecord.candidateProfile.previousRoles || [],
        redFlags: dbRecord.candidateProfile.redFlags || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } : {} as any,
      
      analysisResult: dbRecord.analysisResult ? {
        technicalSkillsScore: dbRecord.analysisResult.technicalSkillsScore || 0,
        experienceScore: dbRecord.analysisResult.experienceScore || 0,
        educationScore: dbRecord.analysisResult.educationScore || 0,
        overallFit: dbRecord.analysisResult.overallFit || 0,
        concerns: dbRecord.analysisResult.concerns || [],
        strengths: dbRecord.analysisResult.strengths || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } : {} as any,
      
      decisionResult: dbRecord.decisionResult ? {
        recommendation: dbRecord.decisionResult.recommendation,
        confidence: dbRecord.decisionResult.confidence || 0,
        reasoning: dbRecord.decisionResult.reasoning || [],
        nextSteps: dbRecord.decisionResult.nextSteps || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } : {} as any,
      
      jobRequirements: dbRecord.decisionResult?.jobRequirements || {},
      processedAt: dbRecord.processedAt?.toISOString() || new Date().toISOString(),
    }
  }

  return record
}

/**
 * Map string status to ApplicationStatus enum
 */
function mapStatusToEnum(status: string): ApplicationStatus {
  const statusMap: Record<string, ApplicationStatus> = {
    'SUBMITTED': ApplicationStatus.PENDING,
    'PENDING': ApplicationStatus.PENDING,
    'PROCESSING': ApplicationStatus.PROCESSING,
    'FAILED': ApplicationStatus.FAILED,
    'SENT_TO_HR': ApplicationStatus.SENT_TO_HR,
    'AUTO_REJECTED': ApplicationStatus.REJECTED,
    'REVIEWED': ApplicationStatus.REVIEWED,
    'REJECTED': ApplicationStatus.REJECTED,
    'HIRED': ApplicationStatus.HIRED,
  }
  
  return statusMap[status] || ApplicationStatus.PENDING
}

/**
 * Map string recommendation to RecommendationType enum
 */
function mapRecommendationToEnum(recommendation: string): RecommendationType {
  const recMap: Record<string, RecommendationType> = {
    'HIRE': RecommendationType.HIRE,
    'NO_HIRE': RecommendationType.NO_HIRE,
    'REJECT': RecommendationType.NO_HIRE,
    'INTERVIEW': RecommendationType.INTERVIEW,
    'NEEDS_REVIEW': RecommendationType.NEEDS_REVIEW,
  }
  
  return recMap[recommendation] || RecommendationType.NEEDS_REVIEW
}

// ===== HEALTH CHECK =====

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}