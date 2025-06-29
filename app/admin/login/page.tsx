"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Sparkles, 
  Shield, 
  ChevronLeft,
  Crown,
  Wand2,
  Star,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
    // If user is already logged in, check admin status and redirect
    if (session?.user?.email) {
      console.log('🔍 检查已登录用户权限:', session.user.email)
      // Check admin status via API
      fetch('/api/admin/check')
        .then(res => res.json())
        .then(data => {
          console.log('🔍 管理员权限检查结果:', data)
          if (data.isAdmin) {
            console.log('✅ 管理员用户，重定向到 dashboard')
            router.push('/admin/dashboard')
          } else {
            console.log('❌ 非管理员用户，重定向到首页')
            router.push('/')
          }
        })
        .catch(error => {
          console.error("❌ 检查管理员权限失败:", error)
          // Fallback to homepage if check fails
          router.push('/')
        })
    } else {
      console.log('🔍 用户未登录，停留在登录页面')
    }
  }, [session, router])

  // Generate fixed decorative elements to avoid hydration issues
  const [magicElements] = useState(() => {
    return Array.from({ length:12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 30 + 15,
      rotation: Math.random() * 360,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    }))
  })

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setAlertMessage(null)
      
      console.log("🔐 Starting Google login...")
      
      const result = await signIn('google', {
        callbackUrl: '/admin/dashboard',
        redirect: true // Set to true, let NextAuth handle redirect
      })
      
      console.log("🔐 Login result:", result)
      
          } catch (error) {
        console.error("❌ Google login error:", error)
        setAlertMessage({ type: 'error', message: 'Google login failed, please try again!' })
        setIsLoading(false)
      }
  }

  // Don't show content during server-side rendering
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#e8dfc7] to-[#d4a574] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8b7355] mx-auto"></div>
          <p className="mt-4 text-[#8b7355] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#e8dfc7] to-[#d4a574] relative overflow-hidden">
      {/* Magical background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large background circles */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#2d3e2d]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#d4a574]/20 rounded-full blur-xl"></div>
        
        {/* Floating magical elements */}
        {isMounted && magicElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-[#d4a574]/40 to-[#8b7355]/40 rounded-full backdrop-blur-sm"
              style={{ transform: `rotate(${element.rotation}deg)` }}
            />
          </motion.div>
        ))}

        {/* Twinkling stars */}
        {isMounted && Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          >
            <Star className="text-[#d4a574]/60" />
          </motion.div>
        ))}
      </div>

      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-[#8b7355] hover:text-[#2d3e2d] hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Title area */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#2d3e2d] mb-2">
              AIMAGICA
            </h1>
            <p className="text-[#8b7355] text-lg font-medium mb-1">
              AI Art Platform
            </p>
            <p className="text-[#8b7355]/80 text-sm">
              Sign in with Google to start your creative journey
            </p>
          </motion.div>

          <Card className="bg-white/90 backdrop-blur-md border-[#d4a574]/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-[#8b7355]" />
                Secure Login
              </CardTitle>
              <CardDescription className="text-[#8b7355]">
                We use Google OAuth to ensure your account security
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error/success alerts */}
              {alertMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4"
                >
                  <Alert className={`border ${
                    alertMessage.type === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    {alertMessage.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={
                      alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }>
                      {alertMessage.message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Google login button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm transition-all duration-300 font-medium text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* Login instructions */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-4 text-sm text-[#8b7355]">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wand2 className="w-4 h-4" />
                    <span>Fast</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#8b7355]/80 leading-relaxed">
                  By signing in, you agree to our Terms of Service and Privacy Policy<br/>
                  We never store your Google password information
                </p>
              </div>

              {/* Feature preview */}
              <div className="border-t border-[#d4a574]/20 pt-4">
                <p className="text-sm font-medium text-[#2d3e2d] mb-3 text-center">
                  After login you can:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#8b7355]">
                    <div className="w-2 h-2 bg-[#d4a574] rounded-full"></div>
                    <span>AI Art Generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b7355]">
                    <div className="w-2 h-2 bg-[#d4a574] rounded-full"></div>
                    <span>Cloud Save Artworks</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b7355]">
                    <div className="w-2 h-2 bg-[#d4a574] rounded-full"></div>
                    <span>Community Sharing</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b7355]">
                    <div className="w-2 h-2 bg-[#d4a574] rounded-full"></div>
                    <span>Premium Benefits</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom tips */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-sm text-[#8b7355]/80">
              Don't have a Google account yet?
              <a 
                href="https://accounts.google.com/signup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-[#8b7355] hover:text-[#2d3e2d] font-medium underline transition-colors"
              >
                Sign up here
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}