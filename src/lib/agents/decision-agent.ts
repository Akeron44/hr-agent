import { BaseAgent } from './base-agent'
import { AnalysisResult } from './analysis-agent'

export interface DecisionResult {
  recommendation: 'HIRE' | 'REJECT' | 'MAYBE'
  confidence: number
  reasoning: string[]
  nextSteps: string[]
}

export class DecisionAgent extends BaseAgent {
  async execute(analysisResult: AnalysisResult, candidateName: string): Promise<DecisionResult> {
    console.log('🤖💭 Decision Agent: Making final recommendation...')
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a hiring decision maker. Make final recommendations based on candidate analysis.

Decision criteria:
- HIRE: Overall fit >= 7, no major red flags, strong technical skills
- REJECT: Overall fit < 5 or major concerns that can't be overlooked
- MAYBE: Overall fit 5-7, needs more information or has mixed signals

ALWAYS return valid JSON with this structure:
{
  "recommendation": "HIRE" | "REJECT" | "MAYBE",
  "confidence": number (1-10),
  "reasoning": string[],
  "nextSteps": string[]
}

Next steps should be specific actionable items like:
- "Schedule technical interview"
- "Request portfolio review"
- "Send rejection email"
- "Ask for references"`
      }, {
        role: 'user',
        content: `Make hiring decision for ${candidateName}:

ANALYSIS RESULTS:
- Technical skills: ${analysisResult.technicalSkillsScore}/10
- Experience: ${analysisResult.experienceScore}/10
- Education: ${analysisResult.educationScore}/10
- Overall fit: ${analysisResult.overallFit}/10

STRENGTHS:
${analysisResult.strengths.length > 0 ? analysisResult.strengths.map(s => `- ${s}`).join('\n') : '- None identified'}

CONCERNS:
${analysisResult.concerns.length > 0 ? analysisResult.concerns.map(c => `- ${c}`).join('\n') : '- None identified'}

Provide a clear recommendation with confidence level, reasoning, and specific next steps.`
      }],
      temperature: 0.3,
    })

    try {
      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content);
      console.log('🤖💭 Decision Agent: Successfully made recommendation', parsed)
      console.log('✅ Decision Agent: Successfully made recommendation')
      return parsed
    } catch (error) {
      console.error('❌ Decision agent JSON parse error:', error)
      return {
        recommendation: 'MAYBE',
        confidence: 5,
        reasoning: ['Failed to make proper decision - requires manual review'],
        nextSteps: ['Manual review required', 'Check agent logs for errors']
      }
    }
  }
}