import { useMemo, useState, useEffect } from 'react';

// 静态资源URL映射（由构建时生成）
let staticUrlMapping: Record<string, string> = {};
let isMapLoaded = false;

// 预加载映射表
if (typeof window !== 'undefined' && !isMapLoaded) {
  fetch('/static-urls.json')
    .then(response => response.json())
    .then(mapping => {
      staticUrlMapping = mapping;
      isMapLoaded = true;
      console.log('📦 Loaded static URL mapping:', Object.keys(mapping).length, 'files');
      // 触发重新渲染使用CDN URL的组件
      window.dispatchEvent(new Event('staticUrlsLoaded'));
    })
    .catch(() => {
      console.log('📦 No static URL mapping found, using local files');
      isMapLoaded = true;
    });
}

// 环境变量配置 - 静态导出模式兼容
const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('pages.dev');
const CDN_ENABLED = isProduction; // 在Cloudflare Pages上自动启用CDN
// 使用自定义域名
const CDN_BASE_URL = 'https://images.aimagica.ai';

/**
 * Hook for getting optimized static asset URLs
 * Automatically switches between local files and CDN based on environment
 */
export function useStaticUrl(localPath: string): string {
  const [mappingLoaded, setMappingLoaded] = useState(isMapLoaded);
  
  useEffect(() => {
    const handleMappingLoaded = () => {
      setMappingLoaded(true);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('staticUrlsLoaded', handleMappingLoaded);
      return () => window.removeEventListener('staticUrlsLoaded', handleMappingLoaded);
    }
  }, []);

  return useMemo(() => {
    // 规范化路径
    const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
    
    // 如果禁用CDN，直接返回本地路径
    if (!CDN_ENABLED) {
      console.log('🏠 CDN disabled, using local:', normalizedPath);
      return normalizedPath;
    }
    
    // 检查映射表中是否有对应的CDN URL
    const cdnUrl = staticUrlMapping[normalizedPath];
    if (cdnUrl) {
      console.log('📦 Using mapped CDN URL:', cdnUrl);
      return cdnUrl;
    }
    
    // 如果映射表还没加载，根据文件类型智能判断
    if (isStaticAsset(normalizedPath)) {
      const fileName = normalizedPath.replace('/', '');
      const fallbackUrl = `${CDN_BASE_URL}/${fileName}`;
      console.log('🔄 Using fallback CDN URL:', fallbackUrl);
      return fallbackUrl;
    }
    
    // 默认返回本地路径
    console.log('🏠 Fallback to local:', normalizedPath);
    return normalizedPath;
  }, [localPath, mappingLoaded]);
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