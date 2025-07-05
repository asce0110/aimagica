import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { upsertUser } from '@/lib/database/users'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { user } = session
    
    // Sync user data with Supabase
    const syncedUser = await upsertUser({
      email: user.email!,
      display_name: user.name || undefined,
      avatar_url: user.image || undefined,
      google_id: user.id || undefined
    })

    if (!syncedUser) {
      return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      user: syncedUser 
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 