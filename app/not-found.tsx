'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">页面未找到</h2>
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移除。
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              返回首页
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/text-to-image">
              开始创作
            </Link>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>如果您认为这是一个错误，请联系我们的支持团队。</p>
        </div>
      </div>
    </div>
  )
}