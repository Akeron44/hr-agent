'use client'

import { useEffect, useState } from 'react'
import { Briefcase, MapPin, Clock, DollarSign, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { JobPostingRecord } from '@/lib/services/job-posting-service'
import Header from '../components/common/Header'
import { ApplicationRecord } from '@/lib/services/database-service'

export default function Home() {
  const [jobPosts, setJobPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [applications, setApplications] = useState([])

  const router = useRouter()
  useEffect(() => {
    setIsMounted(true)
    fetch('/api/job-posts')
      .then(res => res.json())
      .then(data => {
        setJobPosts(data.data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })

      fetch('/api/my-applications')
      .then(res => res.json())
      .then(data => {
        setApplications(data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  const formatEmploymentType = (type: string) => {
    return type?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || ''
  }

  const formatSalary = (salaryMin: number | null, salaryMax: number | null, currency: string) => {
    if (!salaryMin && !salaryMax) return null
    const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
    
    if (salaryMin && salaryMax) {
      return `${formatNumber(salaryMin)} - ${formatNumber(salaryMax)} ${currency}`
    } else if (salaryMin) {
      return `From ${formatNumber(salaryMin)} ${currency}`
    } else if (salaryMax) {
      return `Up to ${formatNumber(salaryMax)} ${currency}`
    }
    return null
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job posts...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
       <><Header /><div className="min-h-screen flex items-center justify-center rounded-3xl py-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Available Positions
            </h1>
            <p className="text-gray-600 text-lg">
              Discover exciting career opportunities with our team
            </p>
          </div>

          {jobPosts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No positions available</h3>
              <p className="text-gray-500">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobPosts.map((post: JobPostingRecord) => {
                const isApplied = applications.some((application: ApplicationRecord) => application.jobPostingId === post.id)
                const formattedSalary = formatSalary(post.salaryMin || null, post.salaryMax || null, post.salaryCurrency || '')

                return (
                  <div
                    key={post.id}
                    className="group bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          {post.department && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{post.department}</span>
                            </div>
                          )}
                          {post.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{post.location}</span>
                            </div>
                          )}
                          {post.employmentType && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatEmploymentType(post.employmentType)}</span>
                            </div>
                          )}
                          {formattedSalary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formattedSalary}</span>
                            </div>
                          )}
                        </div>

                        {post.description && (
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {post.description}
                          </p>
                        )}

                        {post.requiredSkills && post.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.requiredSkills.slice(0, 5).map((skill: string, skillIndex: number) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {post.requiredSkills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                +{post.requiredSkills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button disabled={isApplied} onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/job-posts/${post.id}`)
                      } } className={`ml-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${isApplied ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isApplied ? 'Alredy Applied' : 'Apply Now'}
                      </button>
                    </div>

                    {(post.postedAt || post.createdAt) && (
                      <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500">
                          Posted: {new Date(post.createdAt || post.postedAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t see the right fit? Send us your resume anyway - we&apos;re always looking for great talent!
            </p>
          </div>
        </div>
      </div>
    </div></>
  )
}