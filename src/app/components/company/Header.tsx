'use client'

import { Edit3, Link, Sparkles } from 'lucide-react'

export type JobCreationMode = 'manual' | 'link'

export interface HeaderProps {
  activeMode: JobCreationMode
  onModeChange: (mode: JobCreationMode) => void
}

export function JobCreationHeader({ activeMode, onModeChange }: HeaderProps) {
  return (
    <div className="p-2 mb-2">
      <div className="flex items-center justify-center">
        <div className="relative flex bg-gray-100/50 rounded-3xl p-1 backdrop-blur-sm">
          
          <div 
            className={`
              absolute top-1 bottom-1 w-[calc(50%-2px)] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg
              transition-transform duration-300 ease-in-out
              ${activeMode === 'manual' ? 'translate-x-0' : 'translate-x-full'}
            `}
          />
          
          <button
            onClick={() => onModeChange('manual')}
            className={`
              relative z-10 flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-colors duration-500
              ${activeMode === 'manual' ? 'text-white' : 'text-gray-600'}
            `}
          >
            <Edit3 className="w-5 h-5" />
            <span>Manual</span>
          </button>

          <button
            onClick={() => onModeChange('link')}
            className={`
              relative z-10 flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-colors duration-500
              ${activeMode === 'link' ? 'text-white' : 'text-gray-600'}
            `}
          >
            <div className="relative">
              <Link className="w-5 h-5" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
            </div>
            <span>AI Extract</span>
          </button>
        </div>
      </div>
    </div>
  )
}