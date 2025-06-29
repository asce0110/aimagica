// API 配置 - 静态导出模式
export const API_CONFIG = {
  // 在静态导出模式下，API路由不可用
  // 需要使用外部API或Cloudflare Functions
  
  // 基础URL配置
  BASE_URL: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://aimagica.pages.dev',
  
  // API端点配置
  ENDPOINTS: {
    // 如果需要API功能，可以考虑：
    // 1. 使用 Cloudflare Functions
    // 2. 使用 Vercel Functions 
    // 3. 使用独立的 API 服务
    
    // 暂时禁用的API端点
    GENERATE_IMAGE: '/api/generate/image', // 暂时不可用
    SAVE_IMAGE: '/api/images/save',        // 暂时不可用
    USER_AUTH: '/api/auth',                // 暂时不可用
    STYLES: '/api/styles',                 // 暂时不可用
  },
  
  // 功能状态标记
  FEATURES: {
    IMAGE_GENERATION: false,  // API依赖，暂时禁用
    USER_AUTH: false,         // API依赖，暂时禁用
    SAVE_IMAGES: false,       // API依赖，暂时禁用
    ADMIN_PANEL: false,       // API依赖，暂时禁用
    PAYMENTS: false,          // API依赖，暂时禁用
    
    // 静态功能保留
    GALLERY_VIEW: true,       // 静态展示
    STYLE_PREVIEW: true,      // 静态展示
    LANDING_PAGE: true,       // 静态页面
  }
}

// 检查功能是否可用
export function isFeatureEnabled(feature: keyof typeof API_CONFIG.FEATURES): boolean {
  return API_CONFIG.FEATURES[feature]
}

// 获取API端点（如果可用）
export function getApiEndpoint(endpoint: keyof typeof API_CONFIG.ENDPOINTS): string | null {
  if (typeof window === 'undefined') {
    // 服务端不支持API调用
    return null
  }
  
  return API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint]
}

// API调用封装
export async function callApi(endpoint: string, options?: RequestInit) {
  if (!isFeatureEnabled('IMAGE_GENERATION')) {
    throw new Error('API功能暂时不可用，请等待Cloudflare Functions实现')
  }
  
  const url = getApiEndpoint(endpoint as any)
  if (!url) {
    throw new Error('API端点不可用')
  }
  
  return fetch(url, options)
} 