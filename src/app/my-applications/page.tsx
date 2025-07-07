'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/common/Header'
import { Briefcase, Users } from 'lucide-react'

interface JobPosting {
  title: string
  companyName: string
}

interface Application {
  id: string
  jobPosting: JobPosting
  status: string
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/my-applications')
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error('Error fetching applications:', error)
      }
    }

    fetchApplications()
  }, [])

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="w-full max-w-2xl rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              My Applications
            </h1>
            <p className="text-gray-600 text-lg">
              Track your job application status
            </p>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No applications yet, start applying!</h3>
              <button
                onClick={() => router.push('/job-posts')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                View Job Posts
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {applications.map(application => (
                <li key={application.id} className="group bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 transform hover:scale-[1.02]">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{application.jobPosting.title}</h2>
                  <p className="text-gray-600">{application.jobPosting.companyName}</p>
                  <p
                      className={`w-30 text-sm font-medium px-3 py-1 rounded-2xl ${
                        application.status === 'ACCEPTED'
                          ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                          : application.status === 'REJECTED'
                          ? 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                          : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                      }`}
                    >
                      {application.status}
                </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}