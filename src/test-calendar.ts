// import dotenv from 'dotenv'
// const { google } = require('googleapis')


// dotenv.config({ path: '.env.local' })

// async function testCalendarAccess() {
//   try {
//     const auth = new google.auth.GoogleAuth({
//       keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
//       scopes: ['https://www.googleapis.com/auth/calendar']
//     })
    
//     const calendar = google.calendar({ version: 'v3', auth })
    
//     console.log('🎯 Testing access to your personal calendar...')
    
//     // Access your specific calendar directly
//     const yourCalendarId = 'oniakeron@gmail.com' // Your Gmail address
    
//     try {
//       // Try to list events from your calendar
//       const events = await calendar.events.list({
//         calendarId: yourCalendarId,
//         maxResults: 5,
//         timeMin: new Date().toISOString()
//       })
      
//       console.log('✅ SUCCESS: Can access your personal calendar!')
//       console.log('📅 Upcoming events:', events.data.items?.length || 0)
//       // console.log('📅 Upcoming events:', events.data.items || 'No events found')
      
//       // Try to create a test event
//       console.log('🧪 Testing event creation...')
//       const testEvent = await calendar.events.insert({
//         calendarId: yourCalendarId,
//         resource: {
//           summary: 'Testing',
//           start: {
//             dateTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
//             timeZone: 'Europe/Stockholm'
//           },
//           end: {
//             dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
//             timeZone: 'Europe/Stockholm'
//           }
//         }
//       })
      
//       console.log('✅ SUCCESS: Test event created!')
//       console.log('Event ID:', testEvent.data.id)
//       console.log('Event link:', testEvent.data.htmlLink)
      
//       // Clean up - delete the test event
//       // await calendar.events.delete({
//       //   calendarId: yourCalendarId,
//       //   eventId: testEvent.data.id!
//       // })
//       console.log('🧹 Test event cleaned up')
      
//     } catch (error) {
//       console.error('❌ Cannot access your personal calendar:', (error as Error).message)
//       console.log('💡 Make sure you shared your calendar with the service account!')
//     }
    
//   } catch (error) {
//     console.error('❌ Calendar API connection failed:', error)
//   }
// }


// testCalendarAccess()