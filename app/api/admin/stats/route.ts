import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getUserByEmail } from '@/lib/database/users'
import { getImageStats } from '@/lib/database/images'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查是否为管理员
    const adminEmails = ['admin@aimagica.com', 'your-admin@gmail.com']
    if (!adminEmails.includes(session.user.email!)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const supabase = await createClient()

    // 获取用户统计
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, created_at')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
    }

    // 获取图片统计
    const imageStats = await getImageStats()

    // 计算用户统计
    const totalUsers = users.length
    const freeUsers = users.filter(u => u.subscription_tier === 'free').length
    const proUsers = users.filter(u => u.subscription_tier === 'pro').length
    const wizardUsers = users.filter(u => u.subscription_tier === 'wizard').length
    const activeUsers = users.filter(u => u.subscription_status === 'active').length

    // 计算本月新用户
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= thisMonth).length

    // 获取订阅收入统计
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('plan_price, status, current_period_start')
      .eq('status', 'active')

    let totalRevenue = 0
    let revenueThisMonth = 0
    if (!subscriptionsError && subscriptions) {
      totalRevenue = subscriptions.reduce((sum, sub) => sum + Number(sub.plan_price), 0)
      
      // 计算本月收入（简化计算）
      const monthlySubscriptions = subscriptions.filter(sub => 
        new Date(sub.current_period_start) >= thisMonth
      )
      revenueThisMonth = monthlySubscriptions.reduce((sum, sub) => sum + Number(sub.plan_price), 0)
    }

    // 生成月度统计数据（模拟数据，实际应从数据库查询）
    const chartData = [
      { name: 'Jan', users: Math.floor(totalUsers * 0.6), images: Math.floor(imageStats.total * 0.4), revenue: Math.floor(totalRevenue * 0.3) },
      { name: 'Feb', users: Math.floor(totalUsers * 0.7), images: Math.floor(imageStats.total * 0.5), revenue: Math.floor(totalRevenue * 0.4) },
      { name: 'Mar', users: Math.floor(totalUsers * 0.8), images: Math.floor(imageStats.total * 0.6), revenue: Math.floor(totalRevenue * 0.5) },
      { name: 'Apr', users: Math.floor(totalUsers * 0.85), images: Math.floor(imageStats.total * 0.7), revenue: Math.floor(totalRevenue * 0.6) },
      { name: 'May', users: Math.floor(totalUsers * 0.9), images: Math.floor(imageStats.total * 0.8), revenue: Math.floor(totalRevenue * 0.8) },
      { name: 'Jun', users: totalUsers, images: imageStats.total, revenue: Math.floor(totalRevenue) },
    ]

    const pieData = [
      { name: 'Free Users', value: freeUsers, color: '#8b7355' },
      { name: 'Pro Users', value: proUsers, color: '#d4a574' },
      { name: 'Wizard Users', value: wizardUsers, color: '#2d3e2d' },
    ]

    const userStats = {
      totalUsers,
      activeUsers,
      newUsers: newUsersThisMonth,
      premiumUsers: proUsers + wizardUsers,
      totalImages: imageStats.total,
      imagesThisMonth: Math.floor(imageStats.total * 0.1), // 假设本月占总数的10%
      revenue: totalRevenue,
      revenueGrowth: revenueThisMonth > 0 ? (revenueThisMonth / totalRevenue * 100) : 0
    }

    return NextResponse.json({
      userStats,
      chartData,
      pieData,
      imageStats
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 