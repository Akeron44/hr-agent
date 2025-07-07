import fs from 'fs/promises'
import path from 'path'
import { JobStatus } from '../queue/application-queue'
import { JobPostingRecord } from './job-posting-service'
import { prisma } from '../prisma'

export interface ApplicationRecord {
  submissionId: string
  candidateName: string
  candidateEmail: string
  candidateDescription: string
  fileNames: string[]
  status: JobStatus
  submittedAt: Date
  processedAt?: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
}

const DATA_DIR = path.join(process.cwd(), 'data')
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // handle error
  }
}

async function loadApplications(): Promise<ApplicationRecord[]> {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function fetchJobPosts(): Promise<JobPostingRecord[]> {
  const jobPosts = await prisma.jobPosting.findMany()
  return jobPosts as JobPostingRecord[]
}

export async function fetchJobPostById(id: string): Promise<JobPostingRecord | null> {
  const jobPost = await prisma.jobPosting.findUnique({
    where: { id }
  })
  return jobPost as JobPostingRecord | null
}

async function saveApplications(applications: ApplicationRecord[]) {
  await ensureDataDir()
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2))
}

export async function createApplication(application: ApplicationRecord): Promise<void> {
  const applications = await loadApplications()
  applications.push(application)
  await saveApplications(applications)
  console.log(`💾 Saved application ${application.submissionId} to storage`)
}

export async function updateApplicationStatus(
  submissionId: string, 
  status: JobStatus, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
): Promise<void> {
  const applications = await loadApplications()
  const app = applications.find(a => a.submissionId === submissionId)
  
  if (app) {
    app.status = status
    app.processedAt = new Date()
    if (result) app.result = result
    
    await saveApplications(applications)
    console.log(`📝 Updated application ${submissionId} status to ${status}`)
  }
}

export async function getApplication(submissionId: string): Promise<ApplicationRecord | null> {
  const applications = await loadApplications()
  return applications.find(a => a.submissionId === submissionId) || null
}

console.log('🔑 Application storage service loaded')