import Queue from 'bull'
import { JobPostingRecord } from '../services/job-posting-service'

export interface ApplicationJobData {
  submissionId: string
  candidateName: string
  candidateEmail: string
  candidateDescription: string
  jobPost: JobPostingRecord
  files: Array<{
    name: string
    base64Data: string
  }>
  timestamp: Date
}

export const applicationQueue = new Queue<ApplicationJobData>(
  'hr-application-processing',
  {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }
)

export type JobStatus = 'SUBMITTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SENT_TO_HR' | 'AUTO_REJECTED'

applicationQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully for ${job.data.candidateName}`)
})

applicationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed for ${job.data.candidateName}:`, err.message)
})

applicationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled for ${job.data.candidateName}`)
})

console.log('🚀 Application queue initialized')