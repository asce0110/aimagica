/**
 * 静态Gallery数据 - 使用轻量级图片确保极速加载
 * 优先使用SVG示例图片，确保在任何网络环境下都能快速加载
 */

export interface StaticGalleryImage {
  id: string | number
  url: string
  title: string
  author: string
  authorAvatar: string
  likes: number
  comments: number
  views: number
  downloads: number
  isPremium: boolean
  isFeatured: boolean
  isLiked: boolean
  createdAt: string
  prompt: string
  style: string
  tags: string[]
  size: 'small' | 'medium' | 'large' | 'vertical' | 'horizontal'
  rotation: number
}

/**
 * 生成静态Gallery数据 - 完全移除假数据，纯API驱动
 * 不使用任何占位图片或示例数据
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  // 🚫 完全不使用任何假数据、示例图片或占位符
  // 让Gallery页面立即显示空状态，完全依赖真实API数据
  console.log('📋 静态Gallery数据: 返回空数组，完全使用真实API数据')
  return []
}

export default getStaticGalleryData