import dotenv from 'dotenv'
import { CalendarService, MeetingDetails } from './lib/services/calendar-service'

dotenv.config({ path: '.env.local' })

async function testScheduleInterview() {
  console.log('🧪 Testing scheduleInterview function...\n')
  
  try {
    // Create calendar service instance
    const calendarService = new CalendarService()
    
    // Test data
    const testMeetingDetails: MeetingDetails = {
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Tech Corp',
      duration: 45, // 45 minutes
      // timeSlot: new Date(Date.now() + 24 * 60 * 60 * 1000) // Optional: tomorrow at current time
    }
    
    console.log('📋 Test Meeting Details:')
    console.log(JSON.stringify(testMeetingDetails, null, 2))
    console.log('\n⏳ Calling scheduleInterview...\n')
    
    // Call the function
    const result = await calendarService.scheduleInterview(testMeetingDetails);
    console.log('RESULT:', result)
    
    // console.log('✅ SUCCESS! Interview scheduled:')
    // console.log('📅 Event ID:', result.eventId)
    // console.log('🕐 Scheduled Time:', result.scheduledTime)
    // console.log('🔗 Calendar Link:', result.calendarLink)
    
    // Optionally clean up by cancelling the test event
    // console.log('\n🧹 Cleaning up test event...')
    // await calendarService.cancelInterview(result.eventId)
    // console.log('✅ Test event cancelled successfully')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', (error as Error).message)
  }
}

// Run the test
testScheduleInterview()