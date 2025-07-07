'use client'

import { Briefcase, MapPin, Clock } from 'lucide-react'
import { JobPostingRecord } from '@/lib/services/job-posting-service'

interface JobInfoHeaderProps {
  jobPost: JobPostingRecord | null
}

export default function JobInfoHeader({ jobPost }: JobInfoHeaderProps) {
  const formatEmploymentType = (type: string) => {
    return type?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || ''
  }

  if (!jobPost) {
    return (
      <div className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 rounded-2xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/50 rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
        {jobPost.title}
      </h2>
      
      {jobPost.companyName && (
        <p className="text-gray-700 text-lg font-medium mb-4">
          {jobPost.companyName}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {jobPost.department && (
          <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{jobPost.department}</span>
          </div>
        )}
        {jobPost.location && (
          <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{jobPost.location}</span>
          </div>
        )}
        {jobPost.employmentType && (
          <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{formatEmploymentType(jobPost.employmentType)}</span>
          </div>
        )}
      </div>
    </div>
  )
} 