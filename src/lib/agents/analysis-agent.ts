import { BaseAgent } from './base-agent'
import { CandidateData } from './extraxtion-agent'

export interface JobRequirements {
  requiredSkills: string[]
  minimumExperience: number
  preferredEducation: string
  roleLevel: 'junior' | 'mid' | 'senior',
  jobRequirements: string
}

export interface AnalysisResult {
  technicalSkillsScore: number
  experienceScore: number
  educationScore: number
  overallFit: number
  concerns: string[]
  strengths: string[]
}

export class AnalysisAgent extends BaseAgent {
  async execute(candidateData: CandidateData, jobRequirements: JobRequirements): Promise<AnalysisResult> {
    console.log('🤖🧠 Analysis Agent: Analyzing fit against requirements...', jobRequirements)
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a technical hiring analyst. Score candidates against job requirements.

ALWAYS return valid JSON with this structure:
{
  "technicalSkillsScore": number (1-10),
  "experienceScore": number (1-10),
  "educationScore": number (1-10),
  "overallFit": number (1-10),
  "concerns": string[],
  "strengths": string[]
}

Scoring guidelines:
- Technical Skills: How well do their skills match the required ones?
- Experience: Is their experience level appropriate for the role?
- Education: Does their education meet preferences?
- Overall Fit: Weighted average considering role importance`
      }, {
        role: 'user',
        content: `Analyze this candidate against job requirements:

CANDIDATE DATA:
- Experience: ${candidateData.yearsOfExperience} years
- Skills: ${candidateData.technicalSkills.join(', ') || 'None specified'}
- Education: ${candidateData.educationLevel}
- Previous roles: ${candidateData.previousRoles.join(', ') || 'None specified'}
- Red flags: ${candidateData.redFlags.join(', ') || 'None'}

JOB REQUIREMENTS:
- Required skills: ${jobRequirements.requiredSkills.join(', ')}
- Minimum experience: ${jobRequirements.minimumExperience} years
- Preferred education: ${jobRequirements.preferredEducation}
- Role level: ${jobRequirements.roleLevel}
- Job requirements: ${jobRequirements.jobRequirements}`
}],
temperature: 0.2,
})

try {
    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)
    console.log('✅ Analysis Agent: Successfully analyzed candidate')
    return parsed
} catch (error) {
    console.error('❌ Analysis agent JSON parse error:', error)
    return {
        technicalSkillsScore: 5,
        experienceScore: 5,
        educationScore: 5,
        overallFit: 5,
        concerns: ['Failed to analyze candidate properly'],
        strengths: []
    }
}
}
}
