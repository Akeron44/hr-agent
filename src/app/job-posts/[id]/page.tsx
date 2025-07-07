'use client'

import Header from '@/app/components/common/Header'
import UploadForm from '../../components/UploadForm'

export default function Home() {
  return (
    <><Header />
    <div className="min-h-screen flex items-center justify-center rounded-3xl py-2">
      <main className="max-w-2xl mx-auto mt-12">
        <UploadForm />
      </main>
    </div>
    </>
  )
}
