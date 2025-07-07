'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-6 md:p-8 rounded-3xl mb-8">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Agent {userRole === 'Company' ? 'Hiring' : 'JobSeeking'}
        </h1>
        <nav className="flex space-x-4">
          {userRole === 'Company' && (
            <>
              <Link href="/my-posts" className="text-indigo-600 hover:underline">
                Posts
              </Link>
              <Link href="/job-posting" className="text-indigo-600 hover:underline">
                Publish
              </Link>
            </>
          )}
          {userRole === 'Job Seeker' && (
            <>
              <Link href="/my-applications" className="text-indigo-600 hover:underline">
                My Applications
              </Link>
              <Link href="/job-posts" className="text-indigo-600 hover:underline">
                Job Posts
              </Link>
            </>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Log Out
        </button>
      </div>
    </header>
  )
}