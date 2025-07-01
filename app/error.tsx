'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center space-y-8 p-8 max-w-md mx-auto">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Something went wrong</h2>
          <p className="text-gray-600">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Need help?</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <span>•</span>
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 