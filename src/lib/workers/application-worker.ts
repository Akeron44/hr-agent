import '../config/env'
import { applicationQueue } from '../queue/application-queue'
import { updateApplicationStatus } from '../services/database-service'
import { ExtractionAgent } from '../agents/extraxtion-agent'
import { AnalysisAgent } from '../agents/analysis-agent'
import { DecisionAgent } from '../agents/decision-agent'
import { sendEmail, scheduleRejectionEmail, sendInterviewInvitation } from '../services/email-service'
import { CalendarService, ScheduledMeeting } from '../services/calendar-service'

const calendarService = new CalendarService()

applicationQueue.process('hr-application', async (job) => {
  const { submissionId, candidateName, candidateEmail, candidateDescription, files, jobPost } = job.data

  try {
    console.log(`🚀 Starting processing for ${candidateName} (${submissionId})`)
    
    await updateApplicationStatus(submissionId, 'PROCESSING')
    
    job.progress(20)
    
    console.log(`🤖 Running extraction agent...`)
    const extractionAgent = new ExtractionAgent()
    const candidateData = await extractionAgent.execute(candidateName, candidateDescription, files)
    job.progress(40)
    
    console.log(`🧠 Running analysis agent...`)
    const analysisAgent = new AnalysisAgent()
    const analysisResult = await analysisAgent.execute(candidateData, {
      requiredSkills: jobPost.requiredSkills,
      minimumExperience: jobPost.minimumExperience,
      preferredEducation: jobPost.preferredEducation || '',
      roleLevel: jobPost.roleLevel as 'junior' | 'mid' | 'senior',
      jobRequirements: jobPost.requirements || ''
    })
    job.progress(60)
    
    console.log(`💭 Running decision agent...`)
    const decisionAgent = new DecisionAgent()
    const decisionResult = await decisionAgent.execute(analysisResult, candidateName)
    job.progress(80)
    
    const processingResult = {
      candidateData,
      analysisResult,
      decisionResult,
      jobRequirements: {
        requiredSkills: jobPost.requiredSkills || [],
        minimumExperience: jobPost.minimumExperience || 0,
        preferredEducation: jobPost.preferredEducation || '',
        roleLevel: jobPost.roleLevel || ''
      },
      processedAt: new Date().toISOString(),
      scheduledMeeting: null as ScheduledMeeting | null
    }
    
    if (decisionResult.recommendation === 'REJECT' && decisionResult.confidence >= 8) {
      console.log(`❌ Auto-rejecting ${candidateName} (confidence: ${decisionResult.confidence})`)
      
      await scheduleRejectionEmail({
        email: candidateEmail,
        name: candidateName,
        companyName: jobPost?.companyName || '',
        jobPosition: jobPost?.title || '',
        delayMinutes: 2
      })
      await updateApplicationStatus(submissionId, 'AUTO_REJECTED', processingResult)
      
    } else if(decisionResult.recommendation === 'HIRE' && decisionResult.confidence >= 7) {
      console.log(`🎯 Strong candidate ${candidateName} - scheduling interview (confidence: ${decisionResult.confidence})`)
      
      try {
        const scheduledMeeting = await calendarService.scheduleInterview({
          candidateName,
          candidateEmail,
          jobTitle: jobPost?.title || 'Position',
          companyName: jobPost?.companyName || 'Company',
          duration: 30
        })
        
        processingResult.scheduledMeeting = scheduledMeeting
        
        console.log(`📅 Interview scheduled for ${candidateName}:`)
        console.log(`   📍 Time: ${scheduledMeeting.scheduledTime}`)
        
        const summary = createHRSummaryWithMeeting(candidateName, candidateEmail, processingResult, scheduledMeeting)
        await sendEmail(summary, candidateName, candidateEmail, jobPost?.title)
        
        await sendInterviewInvitation({
          candidateEmail,
          candidateName,
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          meetingLink: scheduledMeeting?.calendarLink || '',
          jobTitle: jobPost?.title || 'Position',
          companyName: jobPost?.companyName || 'Company',
          duration: 45
        })
        
        await updateApplicationStatus(submissionId, 'INTERVIEW_SCHEDULED', processingResult)
      } catch (calendarError) {
        console.error(`❌ Failed to schedule interview for ${candidateName}:`, calendarError)
        
        const summary = createHRSummary(candidateName, candidateEmail, processingResult)
        await sendEmail(summary, candidateName, candidateEmail, jobPost?.title)
        await updateApplicationStatus(submissionId, 'SENT_TO_HR', processingResult)
      }
    }  else {
      console.log(`📧 Sending ${candidateName} to HR for review (${decisionResult.recommendation}, confidence: ${decisionResult.confidence})`)
      
      const summary = createHRSummary(candidateName, candidateEmail, processingResult)
      await sendEmail(summary, candidateName, candidateEmail, jobPost?.title)
      await updateApplicationStatus(submissionId, 'SENT_TO_HR', processingResult)
    }
    
    job.progress(100)
    console.log(`✅ Completed processing for ${candidateName}`)
    
    return processingResult
    
  } catch (error) {
    console.error(`❌ Error processing application ${submissionId}:`, error)
    await updateApplicationStatus(submissionId, 'FAILED')
    throw error
  }
})

function createHRSummaryWithMeeting(candidateName: string, candidateEmail: string, result: { candidateData:  {
  yearsOfExperience: number,
  technicalSkills: string[],
  educationLevel: string,
  previousRoles: string[],
  redFlags: string[]
}, analysisResult: {
  technicalSkillsScore: number,
  experienceScore: number,
  educationScore: number,
  overallFit: number,
  strengths: string[],
  concerns: string[]
}, decisionResult: {
  recommendation: string,
  confidence: number,
  reasoning: string[],
  nextSteps: string[]
} }, meeting: ScheduledMeeting): string {
  const { candidateData, analysisResult, decisionResult } = result
  
  return `
🤖 HR AGENT ANALYSIS FOR ${candidateName.toUpperCase()}
Email: ${candidateEmail}

🎯 ⭐ STRONG CANDIDATE - INTERVIEW AUTO-SCHEDULED ⭐

📅 SCHEDULED INTERVIEW:
• Date & Time: ${new Date(meeting.scheduledTime).toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Stockholm'
  })}
• Calendar Event: ${meeting.calendarLink}
• Event ID: ${meeting.eventId}

📊 CANDIDATE PROFILE:
• Experience: ${candidateData.yearsOfExperience} years
• Skills: ${candidateData.technicalSkills.join(', ') || 'None specified'}
• Education: ${candidateData.educationLevel}
• Previous roles: ${candidateData.previousRoles.join(', ') || 'None specified'}

📈 ANALYSIS SCORES:
• Technical Skills: ${analysisResult.technicalSkillsScore}/10
• Experience Level: ${analysisResult.experienceScore}/10
• Education Fit: ${analysisResult.educationScore}/10
• Overall Fit: ${analysisResult.overallFit}/10

✅ STRENGTHS:
${analysisResult.strengths.length > 0 ? analysisResult.strengths.map((s: string) => `• ${s}`).join('\n') : '• None identified'}

⚠️ CONCERNS:
${analysisResult.concerns.length > 0 ? analysisResult.concerns.map((c: string) => `• ${c}`).join('\n') : '• None identified'}

🎯 FINAL RECOMMENDATION: ${decisionResult.recommendation}
Confidence: ${decisionResult.confidence}/10

📝 REASONING:
${decisionResult.reasoning.map((r: string) => `• ${r}`).join('\n')}

📋 NEXT STEPS:
${decisionResult.nextSteps.map((s: string) => `• ${s}`).join('\n')}

🤖 AI ACTIONS TAKEN:
• ✅ Complete analysis performed
• ✅ Interview automatically scheduled
• ✅ Calendar invites sent to candidate
• ✅ Reminders set (1 day, 1 hour, 15 minutes before)

Status: Ready for interview - no further action needed unless you want to reschedule.
`
}

function createHRSummary(candidateName: string, candidateEmail: string, result: { candidateData: {
  yearsOfExperience: number,
  technicalSkills: string[],
  educationLevel: string,
  previousRoles: string[],
  redFlags: string[]
}, analysisResult: {
  technicalSkillsScore: number,
  experienceScore: number,
  educationScore: number,
  overallFit: number,
  strengths: string[],
  concerns: string[]
}, decisionResult: {
  recommendation: string,
  confidence: number,
  reasoning: string[],
  nextSteps: string[]
} }): string {
  const { candidateData, analysisResult, decisionResult } = result
  
  return `
🤖 HR AGENT ANALYSIS FOR ${candidateName.toUpperCase()}
Email: ${candidateEmail}

📊 CANDIDATE PROFILE:
• Experience: ${candidateData.yearsOfExperience} years
• Skills: ${candidateData.technicalSkills.join(', ') || 'None specified'}
• Education: ${candidateData.educationLevel}
• Previous roles: ${candidateData.previousRoles.join(', ') || 'None specified'}

📈 ANALYSIS SCORES:
• Technical Skills: ${analysisResult.technicalSkillsScore}/10
• Experience Level: ${analysisResult.experienceScore}/10
• Education Fit: ${analysisResult.educationScore}/10
• Overall Fit: ${analysisResult.overallFit}/10

✅ STRENGTHS:
${analysisResult.strengths.length > 0 ? analysisResult.strengths.map((s: string) => `• ${s}`).join('\n') : '• None identified'}

⚠️ CONCERNS:
${analysisResult.concerns.length > 0 ? analysisResult.concerns.map((c: string) => `• ${c}`).join('\n') : '• None identified'}

🎯 FINAL RECOMMENDATION: ${decisionResult.recommendation}
Confidence: ${decisionResult.confidence}/10

📝 REASONING:
${decisionResult.reasoning.map((r: string) => `• ${r}`).join('\n')}

📋 NEXT STEPS:
${decisionResult.nextSteps.map((s: string) => `• ${s}`).join('\n')}

Status: Complete AI analysis with recommendation ready for manual review.
`
}

console.log('🚀 Background worker started and waiting for jobs...')