import { useMemo, useState, useEffect } from 'react';

// 静态资源URL映射（由构建时生成）
let staticUrlMapping: Record<string, string> = {};
let isMapLoaded = false;

// 预加载映射表
if (typeof window !== 'undefined' && !isMapLoaded) {
  fetch('/static-urls.json')
    .then(response => {
      console.log('📦 Fetching static URLs mapping, status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(mapping => {
      staticUrlMapping = mapping;
      isMapLoaded = true;
      console.log('✅ Successfully loaded static URL mapping:', Object.keys(mapping).length, 'files');
      console.log('📋 Available mappings:', Object.keys(mapping));
      // 触发重新渲染使用CDN URL的组件
      window.dispatchEvent(new Event('staticUrlsLoaded'));
    })
    .catch(error => {
      console.warn('⚠️ Failed to load static URL mapping:', error.message);
      console.log('🏠 Fallback: using local files');
      isMapLoaded = true;
      // 仍然触发事件，让组件知道加载完成（即使失败）
      window.dispatchEvent(new Event('staticUrlsLoaded'));
    });
}

// 环境变量配置 - 静态导出模式兼容
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('local')
);

// 在非本地环境下启用CDN（包括Cloudflare Pages、自定义域名等）
const CDN_ENABLED = typeof window !== 'undefined' && !isLocalhost;
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
    
    console.log(`🔍 Processing path: "${normalizedPath}", CDN_ENABLED: ${CDN_ENABLED}, mappingLoaded: ${mappingLoaded}`);
    
    // 如果禁用CDN，直接返回本地路径
    if (!CDN_ENABLED) {
      console.log('🏠 CDN disabled, using local:', normalizedPath);
      return normalizedPath;
    }
    
    // 检查映射表中是否有对应的CDN URL
    const cdnUrl = staticUrlMapping[normalizedPath];
    if (cdnUrl) {
      console.log('✅ Found mapped CDN URL:', normalizedPath, '→', cdnUrl);
      return cdnUrl;
    }
    
    // 如果映射表还没加载完成，但是是静态资源，使用fallback
    if (isStaticAsset(normalizedPath)) {
      const fallbackUrl = `${CDN_BASE_URL}${normalizedPath}`;
      console.log('🔄 Using fallback CDN URL:', normalizedPath, '→', fallbackUrl);
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