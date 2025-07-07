import { BaseAgent } from './base-agent'
import { WebScraperTool } from '../tools/web-scraper-tool'

export interface JobPostingData {
  title: string
  department?: string
  location?: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  description: string
  requirements: string
  benefits?: string
  remoteAllowed: boolean
  minimumExperience: number
  preferredEducation?: string
  roleLevel: 'junior' | 'mid' | 'senior' | 'lead'
  requiredSkills: string[]
  preferredSkills: string[]
  companyName?: string
}

export class JobExtractionAgent extends BaseAgent {
  constructor() {
    super()
    this.addTool(new WebScraperTool())
  }

  async execute(url: string): Promise<JobPostingData> {
    console.log('🤖💼 Job Extraction Agent: Processing job posting URL...')

    const webContent = await this.useTool('web_scraper', url)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a job posting extraction specialist. Extract structured data from job postings on websites.
        
        ALWAYS return a valid JSON object with this exact structure (all fields required, use reasonable defaults if not found):
        {
          "title": string,
          "department": string | null,
          "location": string | null,
          "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE",
          "salaryMin": number | null,
          "salaryMax": number | null,
          "salaryCurrency": string | null,
          "description": string,
          "requirements": string,
          "benefits": string | null,
          "remoteAllowed": boolean,
          "minimumExperience": number,
          "preferredEducation": string | null,
          "roleLevel": "junior" | "mid" | "senior" | "lead",
          "requiredSkills": string[],
          "preferredSkills": string[],
          "companyName": string | null
        }

        Guidelines:
        - If salary is not mentioned, set salaryMin and salaryMax to null
        - For remoteAllowed, look for words like "remote", "work from home", "WFH", "hybrid"
        - Estimate roleLevel based on title and requirements (junior: 0-2 years, mid: 2-5 years, senior: 5+ years, lead: 8+ years)
        - Extract ALL technical skills, frameworks, languages, tools mentioned
        - Separate required vs preferred skills based on language like "must have" vs "nice to have"
        - For minimumExperience, extract years required or estimate based on role level
        - Clean up and format the description and requirements as readable text`
      }, {
        role: 'user',
        content: `Extract job posting information from this webpage content:

URL: ${url}

Content:
${webContent}

Focus on extracting:
- Job title and company name
- Department/team if mentioned
- Location and remote work policy
- Employment type and salary range
- Detailed job description and responsibilities
- Requirements and qualifications
- Technical skills (required vs preferred)
- Experience level needed
- Benefits and perks
- Education requirements`
      }],
      temperature: 0.1,
    })

    try {
      const content = response.choices[0]?.message?.content || '{}'
      console.log('🧠 Raw AI response:', content)
      
      const parsed = JSON.parse(content)
      
      const jobData: JobPostingData = {
        title: parsed.title || 'Job Title Not Found',
        department: parsed.department || undefined,
        location: parsed.location || 'Location Not Specified',
        employmentType: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'].includes(parsed.employmentType) 
          ? parsed.employmentType 
          : 'FULL_TIME',
        salaryMin: parsed.salaryMin ? Number(parsed.salaryMin) : undefined,
        salaryMax: parsed.salaryMax ? Number(parsed.salaryMax) : undefined,
        salaryCurrency: parsed.salaryCurrency || 'USD',
        description: parsed.description || 'Job description not available',
        requirements: parsed.requirements || 'Requirements not specified',
        benefits: parsed.benefits || undefined,
        remoteAllowed: Boolean(parsed.remoteAllowed),
        minimumExperience: Number(parsed.minimumExperience) || 0,
        preferredEducation: parsed.preferredEducation || undefined,
        roleLevel: ['junior', 'mid', 'senior', 'lead'].includes(parsed.roleLevel) 
          ? parsed.roleLevel 
          : 'mid',
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
        companyName: parsed.companyName || undefined
      }

      console.log('✅ Job Extraction Agent: Successfully extracted job data')
      console.log('📋 Extracted job:', {
        title: jobData.title,
        company: jobData.companyName,
        location: jobData.location,
        skills: jobData.requiredSkills.length,
        experience: jobData.minimumExperience
      })
      
      return jobData
      
    } catch (error) {
      console.error('❌ Job extraction JSON parse error:', error)
      console.error('Raw response content:', response.choices[0]?.message?.content)
      
      return {
        title: 'Failed to Extract Job Title',
        department: undefined,
        location: 'Unknown',
        employmentType: 'FULL_TIME',
        salaryMin: undefined,
        salaryMax: undefined,
        salaryCurrency: 'USD',
        description: 'Failed to extract job description. Please try again or contact support.',
        requirements: 'Failed to extract job requirements.',
        benefits: undefined,
        remoteAllowed: false,
        minimumExperience: 0,
        preferredEducation: undefined,
        roleLevel: 'mid',
        requiredSkills: [],
        preferredSkills: [],
        companyName: undefined
      }
    }
  }
} 