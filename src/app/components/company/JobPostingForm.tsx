'use client'

import { useState } from 'react'
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Code, 
  FileText, 
  Users, 
  Plus,
  X,
  Send,
  User
} from 'lucide-react'

export type JobPostingFormData = {
  title: string
  department: string
  location: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  salaryMin?: number
  salaryMax?: number
  description: string
  requirements: string
  benefits?: string
  remoteAllowed: boolean
  minimumExperience: number
  preferredEducation?: string
  roleLevel: 'junior' | 'mid' | 'senior' | 'lead'
  requiredSkills: string[]
  preferredSkills: string[]
  companyName: string
}

export type JobPostingFormProps = {
  initialData?: Partial<JobPostingFormData>
  onSubmit: (data: JobPostingFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function JobPostingForm({ initialData, onSubmit, isLoading, error }: JobPostingFormProps) {
  const [formData, setFormData] = useState<JobPostingFormData>({
    title: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    description: '',
    requirements: '',
    remoteAllowed: false,
    minimumExperience: 0,
    roleLevel: 'mid',
    requiredSkills: [],
    preferredSkills: [],
    companyName: '',
    ...initialData
  })

  const [skillInput, setSkillInput] = useState('')
  const [preferredSkillInput, setPreferredSkillInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Job title is required')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Job description is required')
      return
    }

    await onSubmit(formData)
  }

  const addSkill = (skill: string, type: 'required' | 'preferred') => {
    const trimmed = skill.trim()
    if (!trimmed) return

    if (type === 'required') {
      if (!formData.requiredSkills.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, trimmed]
        }))
      }
      setSkillInput('')
    } else {
      if (!formData.preferredSkills.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          preferredSkills: [...prev.preferredSkills, trimmed]
        }))
      }
      setPreferredSkillInput('')
    }
  }

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    if (type === 'required') {
      setFormData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.filter(s => s !== skill)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        preferredSkills: prev.preferredSkills.filter(s => s !== skill)
      }))
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Create Job Posting
            </h1>
            <p className="text-gray-600 text-lg">
              Share the details of your open position
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
                {error}
              </div>
            )}

            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Job Title *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., Engineering"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., Remote, New York, NY"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Employment Type
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        employmentType: e.target.value as JobPostingFormData['employmentType']
                      }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>
              </div>

                <div className="group mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value as JobPostingFormData['companyName'] }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., Google"
                    />
                  </div>
                </div>

              <div className="mt-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.remoteAllowed}
                    onChange={(e) => setFormData(prev => ({ ...prev, remoteAllowed: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                  />
                  <span className="ml-3 text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">
                    Remote work allowed
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                Requirements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Experience (years)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumExperience}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        minimumExperience: parseInt(e.target.value) || 0 
                      }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Role Level
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      value={formData.roleLevel}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        roleLevel: e.target.value as JobPostingFormData['roleLevel']
                      }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800"
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preferred Education
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.preferredEducation || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredEducation: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="e.g., Bachelor's degree in Computer Science"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <Code className="w-5 h-5 mr-2 text-indigo-600" />
                Skills
              </h3>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'required')}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill(skillInput, 'required')
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., React, TypeScript, Node.js"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput, 'required')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preferred Skills (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'preferred')}
                        className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={preferredSkillInput}
                      onChange={(e) => setPreferredSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill(preferredSkillInput, 'preferred')
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="e.g., GraphQL, Docker, AWS"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addSkill(preferredSkillInput, 'preferred')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Job Details
              </h3>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Job Description *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-6 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none"
                      placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Benefits & Perks (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-6 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <textarea
                      rows={3}
                      value={formData.benefits || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none"
                      placeholder="Health insurance, flexible hours, remote work, professional development..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Job...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Create Job Posting</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Your job posting will be reviewed and published within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}