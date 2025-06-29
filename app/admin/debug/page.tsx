'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDebugPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runAdminTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-check')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: 'Failed to run test', details: error })
    } finally {
      setLoading(false)
    }
  }

  const runRegularCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setTestResults({ ...testResults, regularCheck: data })
    } catch (error) {
      setTestResults({ ...testResults, regularCheckError: error })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      runAdminTest()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#e8dcc0] to-[#d4a574] p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-white border-4 border-[#2d3e2d] rounded-2xl shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#2d3e2d]" style={{ fontFamily: "Comic Sans MS, cursive" }}>
              🔍 Admin Debug Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Info */}
            <div>
              <h3 className="text-lg font-bold text-[#2d3e2d] mb-2">Session Information:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify({
                  status,
                  hasSession: !!session,
                  email: session?.user?.email,
                  name: session?.user?.name,
                  image: session?.user?.image
                }, null, 2)}
              </pre>
            </div>

            {/* Test Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={runAdminTest}
                disabled={loading}
                className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white"
              >
                {loading ? 'Testing...' : 'Run Admin Test'}
              </Button>
              <Button 
                onClick={runRegularCheck}
                disabled={loading}
                className="bg-[#8b7355] hover:bg-[#6d5a42] text-white"
              >
                Run Regular Check
              </Button>
            </div>

            {/* Test Results */}
            {testResults && (
              <div>
                <h3 className="text-lg font-bold text-[#2d3e2d] mb-2">Test Results:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                <li>Check if your email is in the admin_config table in Supabase</li>
                <li>Verify environment variables are set correctly</li>
                <li>Check browser console for any errors</li>
                <li>Ensure you're logged in with the correct Google account</li>
                <li>Try logging out and logging back in</li>
              </ol>
            </div>

            {/* Quick Fix */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Quick Fix:</h3>
              <p className="text-blue-700 mb-2">
                If you need to add yourself as an admin manually, you can run this SQL in Supabase:
              </p>
              <pre className="bg-blue-100 p-2 rounded text-sm">
{`INSERT INTO admin_config (email, role) 
VALUES ('your-email@gmail.com', 'admin') 
ON CONFLICT (email) DO UPDATE SET role = 'admin';`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 