import { useMemo } from 'react';

// 静态资源URL映射（由构建时生成）
let staticUrlMapping: Record<string, string> = {};

// 在客户端加载URL映射
if (typeof window !== 'undefined') {
  try {
    // 尝试加载静态URL映射文件
    fetch('/static-urls.json')
      .then(response => response.json())
      .then(mapping => {
        staticUrlMapping = mapping;
        console.log('📦 Loaded static URL mapping:', Object.keys(mapping).length, 'files');
      })
      .catch(() => {
        console.log('📦 No static URL mapping found, using local files');
      });
  } catch (error) {
    console.log('📦 Using local static files (no CDN mapping)');
  }
}

// 环境变量配置 - 静态导出模式兼容
const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('pages.dev');
const CDN_ENABLED = isProduction; // 在Cloudflare Pages上自动启用CDN
// 临时使用直接的R2 URL，而不是自定义域名
const CDN_BASE_URL = 'https://9a54200354c496d0e610009d7ab97c17.r2.cloudflarestorage.com/ai-sketch';

/**
 * Hook for getting optimized static asset URLs
 * Automatically switches between local files and CDN based on environment
 */
export function useStaticUrl(localPath: string): string {
  return useMemo(() => {
    // 规范化路径
    const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
    
    // 如果禁用CDN，直接返回本地路径
    if (!CDN_ENABLED) {
      return normalizedPath;
    }
    
    // 检查映射表中是否有对应的CDN URL
    const cdnUrl = staticUrlMapping[normalizedPath];
    if (cdnUrl) {
      return cdnUrl;
    }
    
    // 如果映射表还没加载，根据文件类型智能判断
    if (isStaticAsset(normalizedPath)) {
      const fileName = normalizedPath.replace('/', '');
      return `${CDN_BASE_URL}/${fileName}`;
    }
    
    // 默认返回本地路径
    return normalizedPath;
  }, [localPath]);
}

/**
 * 判断是否为静态资源文件
 */
function isStaticAsset(path: string): boolean {
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.gif'];
  const staticDirs = ['/images/', '/backgrounds/', '/examples/'];
  
  // 检查文件扩展名
  const hasStaticExtension = staticExtensions.some(ext => 
    path.toLowerCase().endsWith(ext)
  );
  
  // 检查是否在静态目录中
  const inStaticDir = staticDirs.some(dir => 
    path.includes(dir)
  );
  
  return hasStaticExtension || inStaticDir;
}

/**
 * 直接获取CDN URL（不使用Hook，可在组件外使用）
 */
export function getStaticUrl(localPath: string): string {
  const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  
  if (!CDN_ENABLED) {
    return normalizedPath;
  }
  
  const cdnUrl = staticUrlMapping[normalizedPath];
  if (cdnUrl) {
    return cdnUrl;
  }
  
  if (isStaticAsset(normalizedPath)) {
    const fileName = normalizedPath.replace('/', '');
    return `${CDN_BASE_URL}/${fileName}`;
  }
  
  return normalizedPath;
}

export default useStaticUrl; 