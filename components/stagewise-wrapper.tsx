'use client'

import { useEffect, useState } from 'react'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import ErrorBoundary from './error-boundary'

const stagewiseConfig = {
  plugins: [],
  // 减少重连尝试以降低错误频率
  autoReconnect: true,
  maxReconnectAttempts: 2,
  reconnectInterval: 10000,
}

export default function StagewiseWrapper() {
  const [showToolbar, setShowToolbar] = useState(false)

  useEffect(() => {
    // 只在开发环境显示
    if (process.env.NODE_ENV === 'development') {
      setShowToolbar(true)
    }

    // 捕获WebSocket连接错误但不阻止应用运行
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('Max reconnection attempts reached') ||
          message.includes('stagewise')) {
        // 静默处理stagewise连接错误
        console.warn('🔧 Stagewise:', message)
        return
      }
      // 其他错误正常显示
      originalConsoleError.apply(console, args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  // 如果不是开发环境，不渲染
  if (!showToolbar) {
    return null
  }

  return (
    <ErrorBoundary>
      <StagewiseToolbar config={stagewiseConfig} />
    </ErrorBoundary>
  )
} 