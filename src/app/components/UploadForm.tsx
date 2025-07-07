'use client'

import { useEffect, useState } from 'react'
import { Upload, User, Mail, FileText, Send, CheckCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { JobPostingRecord } from '@/lib/services/job-posting-service'
import JobInfoHeader from './JobInfoHeader'

export default function UploadForm() {
  const [formData, setFormData] = useState({ name: '', email: '', description: '' })
  const [files, setFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [jobPost, setJobPost] = useState<JobPostingRecord | null>(null)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    fetch(`/api/job-posts/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('data', data.data)
        setJobPost(data.data)
      })
      .catch(err => console.error(err))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('description', formData.description)
    data.append('jobPost', JSON.stringify(jobPost))
    if (files) {
      Array.from(files).forEach(file => data.append('files', file))
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })
      const result = await res.json()
      setIsSuccess(true)
      return result
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center rounded-3xl">
        <div className="w-full max-w-2xl rounded-3xl">
          <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
            <div className="w-full inline-flex items-center justify-center text-center mb-5">
              <CheckCircle className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 text-center">
              Application Submitted
            </h1>
            <p className="text-gray-600 text-lg text-center">
              Thank you for submitting your application. We will review it and get back to you shortly.
            </p>
            <button
              onClick={() => router.push('/job-posts')}
              className="w-full mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              View Job Posts
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center rounded-3xl">
      <div className="w-full max-w-2xl rounded-3xl">
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
          <JobInfoHeader jobPost={jobPost} />

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Submit Your Application
            </h1>
            <p className="text-gray-600 text-lg">
              Share your details and let us know more about you
            </p>
          </div>

          <div className="space-y-8">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tell Us About Yourself
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-6 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <textarea
                  placeholder="Share your background, interests, and what makes you unique..."
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Documents
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : files && files.length > 0
                    ? 'border-green-400 bg-green-50/50'
                    : 'border-gray-300 bg-gray-50/30 hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  required
                  onChange={e => setFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  {files && files.length > 0 ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  ) : (
                    <Upload className={`w-12 h-12 mx-auto transition-colors ${
                      isDragOver ? 'text-indigo-500' : 'text-gray-400'
                    }`} />
                  )}
                  <div>
                    {files && files.length > 0 ? (
                      <div>
                        <p className="text-green-600 font-semibold">
                          {files.length} file{files.length > 1 ? 's' : ''} selected
                        </p>
                        <div className="mt-2 space-y-1">
                          {Array.from(files).map((file, index) => (
                            <p key={index} className="text-sm text-gray-600">
                              {file.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 font-medium">
                          Drag & drop your files here, or click to browse
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          PDF, DOC, DOCX, and images are supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Submit Application</span>
                </div>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Your information is secure and will be handled with care
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
