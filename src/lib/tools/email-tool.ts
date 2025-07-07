import { Tool } from "../agents/base-agent"
import { sendEmail, scheduleRejectionEmail } from "../services/email-service"

export interface EmailToolParams {
  summary: string
  candidateName: string
  candidateEmail: string
  delayMinutes?: number
  type: "rejection" | "acceptance"
}

export class EmailTool implements Tool {
  name = 'email'

  async execute({summary, candidateName, candidateEmail, delayMinutes, type}: EmailToolParams): Promise<void> {
    if (type === "rejection") {
      const delay = delayMinutes ?? 2
      await scheduleRejectionEmail({email: candidateEmail, name: candidateName, companyName: '', jobPosition: '', delayMinutes: delay})
    } else {
      await sendEmail(summary, candidateName, candidateEmail, '')
    }
  }
}