// services/calendar-service.ts
import dotenv from 'dotenv'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { google } = require('googleapis')


dotenv.config({ path: '.env.local' })

export interface MeetingDetails {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName: string
  duration?: number 
  timeSlot?: Date 
}

export interface ScheduledMeeting {
  eventId: string
  scheduledTime: Date
  calendarLink: string
}

export class CalendarService {
  private calendar
  private calendarId: string

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
    })
    
    this.calendar = google.calendar({ version: 'v3', auth })
    this.calendarId = process.env.GOOGLE_CALENDAR_ID === 'primary' 
      ? process.env.HR_EMAIL! 
      : process.env.GOOGLE_CALENDAR_ID!
  }

  async scheduleInterview(details: MeetingDetails): Promise<ScheduledMeeting> {
    console.log('DETAILS OF SCHEDULE INTERVIEW FROM CALENDAR SERVICE:', details)
    const {
      candidateName,
      candidateEmail,
      jobTitle,
      companyName,
      duration = 30,
      timeSlot
    } = details

    const scheduledTime = timeSlot || await this.findNextAvailableSlot(duration)
    const endTime = new Date(scheduledTime.getTime() + duration * 60 * 1000)

    try {
      console.log(`📅 Scheduling interview for ${candidateName} at ${new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}`)

      const event = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: {
          summary: `Interview: ${candidateName} - ${jobTitle} for ${companyName}`,
          description: `
            🤖 AI-Scheduled Interview

              Candidate: ${candidateName}
              Email: ${candidateEmail}
              Position: ${jobTitle}
              Company: ${companyName}

              This interview was automatically scheduled based on AI analysis showing this candidate as a strong fit.

            Please review the candidate's analysis before the meeting.
          `.trim(),
          start: {
            dateTime: scheduledTime.toISOString(),
            timeZone: 'Europe/Stockholm'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Stockholm'
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'email', minutes: 60 },
              { method: 'popup', minutes: 15 }
            ]
          },
          visibility: 'public'
        }
      })

      console.log('✅ Interview scheduled successfully!')

      return {
        eventId: event.data.id!,
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        calendarLink: event.data.htmlLink || ''
      }

    } catch (error) {
      console.error('❌ Failed to schedule interview:', error)
      throw new Error(`Failed to schedule interview: ${(error as Error).message}`)
    }
  }

  private async findNextAvailableSlot(durationMinutes: number): Promise<Date> {
    try {
      const now = new Date()
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const busyTimes = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: now.toISOString(),
        timeMax: oneWeekFromNow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      })

      const existingEvents = busyTimes.data.items || []

      const candidateTime = new Date()
      
      candidateTime.setMinutes(0, 0, 0)
      candidateTime.setHours(candidateTime.getHours() + 1)

      while (candidateTime < oneWeekFromNow) {
        const dayOfWeek = candidateTime.getDay()
        const hour = candidateTime.getHours()

        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17) {
          const slotEnd = new Date(candidateTime.getTime() + durationMinutes * 60 * 1000)
          
          const hasConflict = existingEvents.some((event: { start: { dateTime: string | number | Date; }; end: { dateTime: string | number | Date; }; }) => {
            if (!event.start?.dateTime || !event.end?.dateTime) return false
            
            const eventStart = new Date(event.start.dateTime)
            const eventEnd = new Date(event.end.dateTime)
            
            return (candidateTime < eventEnd && slotEnd > eventStart)
          })

          if (!hasConflict) {
            return candidateTime
          }
        }

        candidateTime.setHours(candidateTime.getHours() + 1)
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      return tomorrow

    } catch (error) {
      console.error('❌ Error finding available slot:', error)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      return tomorrow
    }
  }

  async cancelInterview(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId
      })
      console.log(`✅ Interview ${eventId} cancelled successfully`)
    } catch (error) {
      console.error('❌ Failed to cancel interview:', error)
      throw new Error(`Failed to cancel interview: ${(error as Error).message}`)
    }
  }

  async rescheduleInterview(eventId: string, newTime: Date, duration: number = 30): Promise<ScheduledMeeting> {
    try {
      const endTime = new Date(newTime.getTime() + duration * 60 * 1000)

      const event = await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId: eventId,
        resource: {
          start: {
            dateTime: newTime.toISOString(),
            timeZone: 'Europe/Stockholm'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Stockholm'
          }
        }
      })

      console.log(`✅ Interview ${eventId} rescheduled successfully`)

      return {
        eventId: event.data.id!,
        scheduledTime: newTime,
        calendarLink: event.data.htmlLink || ''
      }

    } catch (error) {
      console.error('❌ Failed to reschedule interview:', error)
      throw new Error(`Failed to reschedule interview: ${(error as Error).message}`)
    }
  }
}