
import { BaseAgent } from './base-agent'
import { FileProcessorTool } from '../tools/file-processor-tool'

export interface CandidateData {
  yearsOfExperience: number
  technicalSkills: string[]
  educationLevel: string
  previousRoles: string[]
  redFlags: string[]
}

export class ExtractionAgent extends BaseAgent {
  constructor() {
    super()
    this.addTool(new FileProcessorTool())
  }

  async execute(name: string, description: string, files: Array<{ name: string; base64Data: string }>): Promise<CandidateData> {
    console.log('🤖🦷 Extraction Agent: Processing candidate data...')

    const documentsText = await this.useTool('file_processor', description, files)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a resume extraction specialist. Extract structured data from candidate applications.
        
        ALWAYS return a valid JSON object with this exact structure:
        {
          "yearsOfExperience": number,
          "technicalSkills": string[],
          "educationLevel": string,
          "previousRoles": string[],
          "redFlags": string[]
        }`
      }, {
        role: 'user',
        content: `Extract information from this candidate:
        
        Name: ${name}
        Description: ${description}
        Documents: ${documentsText}

        Focus on:
        - Years of professional experience (estimate if not explicit)
        - All technical skills, frameworks, languages mentioned
        - Highest education level
        - Job titles and companies
        - Any concerns (employment gaps, job hopping, etc.)`
      }],
      temperature: 0.1, 
    })

    try {
      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content)
      console.log('✅ Extraction Agent: Successfully extracted data')
      return parsed
    } catch (error) {
      console.error('❌ Extraction agent JSON parse error:', error)
      return {
        yearsOfExperience: 0,
        technicalSkills: [],
        educationLevel: 'Unknown',
        previousRoles: [],
        redFlags: ['Failed to parse candidate data']
      }
    }
  }
}