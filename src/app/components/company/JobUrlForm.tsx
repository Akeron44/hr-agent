'use client'

import { useState } from 'react'
import { Link, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

export interface JobUrlFormProps {
  onExtract: (url: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function JobUrlForm({ onExtract, isLoading, error }: JobUrlFormProps) {
  const [url, setUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return urlString.includes('linkedin.com') || 
             urlString.includes('indeed.com') || 
             urlString.includes('glassdoor.com') ||
             urlString.includes('jobs.') ||
             urlString.includes('/jobs/') ||
             urlString.includes('/careers/') ||
             urlString.includes('softup') ||
             urlString.includes('https')
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setIsValidUrl(validateUrl(newUrl))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidUrl || !url.trim()) {
      return
    }
    await onExtract(url.trim())
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl">
      
      {/* Header */}
      <div className="text-center mb-10 rounded-3xl">
        <div className="rounded-3xl inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 relative">
          <Link className="w-8 h-8 text-white" />
          <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          AI Job Extraction
        </h1>
        <p className="text-gray-600 text-lg">
          Paste a job posting URL and let AI extract the details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl">
        
        {error && (
          <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job Posting URL
          </label>
          <div className="relative">
            <Link className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              isValidUrl ? 'text-green-500' : 'text-gray-400 group-focus-within:text-indigo-500'
            }`} />
            
            {isValidUrl && (
              <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              required
              className={`w-full pl-12 pr-12 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 ${
                isValidUrl 
                  ? 'border-green-300 focus:ring-green-500' 
                  : 'border-gray-200 focus:ring-indigo-500'
              }`}
              placeholder="https://linkedin.com/jobs/view/123456789 or https://company.com/careers/position"
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            <p className="mb-2">✅ Supported platforms:</p>
            <div className="flex flex-wrap gap-2">
              {['LinkedIn', 'Indeed', 'Glassdoor', 'Company Career Pages'].map((platform) => (
                <span 
                  key={platform}
                  className="px-3 py-1 bg-indigo-100/60 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isValidUrl}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Extracting Job Details...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Extract with AI</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          AI extraction typically takes 10-30 seconds depending on the page complexity
        </p>
      </div>
    </div>
  )
}