'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react'

export default function Login() {
  const [role, setRole] = useState('Company');

  const router = useRouter()

  const handleLogin = () => {
    localStorage.setItem('userRole', role)
    if (role === 'Company') {
        router.push('/job-posting')
      } else if (role === 'Job Seeker') {
        router.push('/job-posts')
      }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Login
      </h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="Company">Company</option>
        <option value="Job Seeker">Job Seeker</option>
      </select>
      <button
        onClick={handleLogin}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 px-4 w-full rounded-lg transition-all duration-300"
      >
        Log In
      </button>
    </div>
  )
}