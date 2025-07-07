
import { config } from 'dotenv'
import path from 'path'

config({ path: path.join(process.cwd(), '.env.local') })

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration Loaded:')
  console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Found' : 'Missing')
  console.log('🔑 Convert API Token:', process.env.CONVERT_API_TOKEN ? 'Found' : 'Missing')
  console.log('🔑 Email User:', process.env.EMAIL_USER ? 'Found' : 'Missing')
  console.log('🔑 Redis Host:', process.env.REDIS_HOST || 'localhost')
  console.log('🔑 Redis Port:', process.env.REDIS_PORT || '6379')
}

export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  CONVERT_API_TOKEN: process.env.CONVERT_API_TOKEN!,
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
} as const

const requiredEnvVars = ['OPENAI_API_KEY', 'CONVERT_API_TOKEN', 'EMAIL_USER', 'EMAIL_PASS']
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars)
  console.error('Please check your .env.local file')

  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
}