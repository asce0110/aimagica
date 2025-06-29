import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Test API works',
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      nextauthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing'
    }
  })
} 