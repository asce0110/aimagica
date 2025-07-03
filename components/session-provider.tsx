"use client"

import React, { ReactNode, createContext, useContext } from "react"
import { ThemeProvider } from "@/components/theme-provider"

interface ProvidersProps {
  children: ReactNode
}

// 检测是否为静态导出环境
const isStaticExport = true // 强制使用静态导出模式

// Mock Session Context for static export
interface MockSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

interface MockSessionContextType {
  data: MockSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  update: () => Promise<MockSession | null>
}

const MockSessionContext = createContext<MockSessionContextType>({
  data: null,
  status: "unauthenticated",
  update: async () => null,
})

function MockSessionProvider({ children }: { children: ReactNode }) {
  const mockSession: MockSessionContextType = {
    data: null,
    status: "unauthenticated",
    update: async () => null,
  }

  return (
    <MockSessionContext.Provider value={mockSession}>
      {children}
    </MockSessionContext.Provider>
  )
}

// 导出兼容的 useSession hook
export function useSessionCompat(): MockSessionContextType {
  // 使用 useState 来确保组件状态的一致性
  const [defaultSession] = React.useState<MockSessionContextType>({
    data: null,
    status: "unauthenticated",
    update: async () => null,
  })

  // 在服务器端渲染或静态导出中，直接返回默认状态
  if (typeof window === 'undefined') {
    return defaultSession
  }

  // 在客户端，尝试使用 MockSessionContext
  try {
    const context = useContext(MockSessionContext)
    if (context) {
      return context
    }
  } catch (e) {
    console.debug('MockSessionContext not available:', e)
  }

  // 静态导出模式下不使用 next-auth

  // 返回默认状态
  return defaultSession
}

// 导出兼容的 signOut function
export async function signOutCompat(options?: any) {
  if (isStaticExport) {
    // 静态导出模式下，只做客户端重定向
    if (typeof window !== 'undefined') {
      window.location.href = options?.callbackUrl || '/'
    }
    return
  }
  
  // 静态导出模式下，直接重定向
  if (typeof window !== 'undefined') {
    window.location.href = options?.callbackUrl || '/'
  }
}

export default function Providers({ children }: ProvidersProps) {
  if (isStaticExport) {
    return (
      <MockSessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey={undefined} // 静态导出时禁用存储
        >
          {children}
        </ThemeProvider>
      </MockSessionProvider>
    )
  }

  // 在静态导出模式下，不应该到达这里，但提供备用实现
  return (
    <MockSessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="aimagica-theme"
      >
        {children}
      </ThemeProvider>
    </MockSessionProvider>
  )
} 