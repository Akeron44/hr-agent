'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './components/common/Header'
import Login from './components/auth/Login'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole === 'Company') {
      router.push('/job-posting')
    } else if (userRole === 'Job Seeker') {
      router.push('/job-posts')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Header />
      <main className="max-w-2xl mx-auto mt-12 p-4">
        <Login />
      </main>
    </div>
  )
}