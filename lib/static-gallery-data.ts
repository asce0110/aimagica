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
 * 生成静态Gallery数据 - 参考Midjourney/DALL-E最佳实践
 * 使用轻量级缩略图策略，确保极速首屏加载
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  // 🎯 参考主流AI画廊：先用轻量级缩略图占位，后台加载高清图
  // 这样既保证了快速加载，又有真实内容显示
  const thumbGalleryImages: StaticGalleryImage[] = [
    {
      id: '04033a15-7dfc-4b96-8999-91e6915ac926',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY2IDAlLCAjNDQ0IDEwMCUpIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkN5YmVycHVuayBXYXJyaW9yPC90ZXh0Pgo8L3N2Zz4=',
      title: '赛博朋克女战士',
      author: 'CyberArtist',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1567,
      comments: 103,
      views: 6789,
      downloads: 543,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '5 days ago',
      prompt: 'Cyberpunk female warrior with neon armor in futuristic city',
      style: 'Cyberpunk',
      tags: ['cyberpunk', 'warrior', 'female', 'neon', 'futuristic'],
      size: 'vertical',
      rotation: -1.2
    },
    {
      id: '22ab8354-87e8-4a74-a37b-c3f08f1ced20',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNDQ4IDAlLCAjMjI2IDEwMCUpIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkZvcmVzdCBFbGY8L3RleHQ+Cjwvc3ZnPg==',
      title: '魔法森林精灵',
      author: 'ForestMage',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2134,
      comments: 156,
      views: 8901,
      downloads: 721,
      isPremium: true,
      isFeatured: true,
      isLiked: true,
      createdAt: '3 days ago',
      prompt: 'Mystical forest elf with glowing magic and ancient trees',
      style: 'Fantasy',
      tags: ['fantasy', 'elf', 'forest', 'magic', 'mystical'],
      size: 'medium',
      rotation: 0.8
    },
    {
      id: '294ff75d-8579-4d3d-87ee-811b69b15a99',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMjIyIDAlLCAjMDAwIDEwMCUpIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPlNwYWNlIEV4cGxvcmVyPC90ZXh0Pgo8L3N2Zz4=',
      title: '太空探索者',
      author: 'StarGazer',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 987,
      comments: 67,
      views: 5432,
      downloads: 398,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '1 week ago',
      prompt: 'Astronaut explorer discovering alien worlds with cosmic background',
      style: 'Sci-Fi',
      tags: ['sci-fi', 'astronaut', 'space', 'alien', 'exploration'],
      size: 'horizontal',
      rotation: -0.5
    }
  ]

  console.log(`📋 缩略图Gallery数据生成: ${thumbGalleryImages.length}张轻量级占位图`)
  return thumbGalleryImages
}

export default getStaticGalleryData