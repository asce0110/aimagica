import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center space-y-8 p-8 max-w-md mx-auto">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              Return Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/gallery">
              Browse Gallery
            </Link>
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Link href="/text-to-image" className="text-blue-600 hover:underline">
              Text to Image
            </Link>
            <span>•</span>
            <Link href="/image-to-image" className="text-blue-600 hover:underline">
              Image to Image
            </Link>
            <span>•</span>
            <Link href="/help" className="text-blue-600 hover:underline">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 