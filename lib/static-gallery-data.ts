/**
 * 静态Gallery数据 - 完全本地化，不依赖任何外部API
 * 这些图片都是本地SVG文件，保证在任何网络环境下都能加载
 */

export interface StaticGalleryImage {
  id: string
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
 * 生成静态Gallery数据
 * 使用本地SVG文件，确保100%可用性
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  const baseImages = [
    {
      id: 'static-cat-wizard',
      url: '/images/examples/cat-wizard.svg',
      title: '魔法师小猫',
      author: '魔法大师',
      prompt: 'A cute cat wearing a wizard hat, casting colorful magic spells with a magical wand in an enchanted setting',
      style: 'Fantasy Magic',
      tags: ['cat', 'wizard', 'magic', 'cute', 'fantasy'],
      isPremium: true,
      isFeatured: true,
    },
    {
      id: 'static-cyber-city',
      url: '/images/examples/cyber-city.svg',
      title: '赛博东京2099',
      author: '未来艺术家',
      prompt: 'Futuristic cyberpunk cityscape with neon lights, flying cars, and holographic advertisements in neo-tokyo style',
      style: 'Cyberpunk Future',
      tags: ['cyberpunk', 'city', 'future', 'neon', 'sci-fi'],
      isPremium: true,
      isFeatured: false,
    },
    {
      id: 'static-magic-forest',
      url: '/images/examples/magic-forest.svg',
      title: '魔法森林',
      author: '自然守护者',
      prompt: 'A magical enchanted forest with glowing mushrooms, fairy lights, and mystical creatures among ancient trees',
      style: 'Fantasy Nature',
      tags: ['forest', 'magic', 'fantasy', 'nature', 'mystical'],
      isPremium: false,
      isFeatured: true,
    },
    {
      id: 'static-space-art',
      url: '/images/examples/space-art.svg',
      title: '太空探索者',
      author: '星空漫步者',
      prompt: 'An astronaut exploring alien planet with strange flora and multiple moons in the cosmic sky',
      style: 'Sci-Fi Space',
      tags: ['space', 'astronaut', 'alien', 'planet', 'exploration'],
      isPremium: false,
      isFeatured: false,
    }
  ]

  // 生成更多变体来填充Gallery
  const expandedImages: StaticGalleryImage[] = []
  
  baseImages.forEach((baseImage, baseIndex) => {
    // 为每个基础图片生成3-4个变体
    const variants = [
      { suffix: '', likes: Math.floor(Math.random() * 2000) + 500 },
      { suffix: ' V2', likes: Math.floor(Math.random() * 1500) + 300 },
      { suffix: ' Enhanced', likes: Math.floor(Math.random() * 2500) + 800 },
      { suffix: ' Master', likes: Math.floor(Math.random() * 3000) + 1000 }
    ]

    variants.forEach((variant, variantIndex) => {
      const id = `${baseImage.id}-${variantIndex}`
      const likes = variant.likes
      const views = likes * (2 + Math.random() * 3) // 2-5倍观看
      const comments = Math.floor(likes * (0.03 + Math.random() * 0.07)) // 3-10%评论率
      const downloads = Math.floor(likes * (0.1 + Math.random() * 0.2)) // 10-30%下载率
      
      const sizes = ['small', 'medium', 'large', 'vertical', 'horizontal'] as const
      const dates = [
        '1 hour ago', '3 hours ago', '1 day ago', '2 days ago', '3 days ago',
        '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'
      ]

      expandedImages.push({
        id,
        url: baseImage.url,
        title: `${baseImage.title}${variant.suffix}`,
        author: baseImage.author,
        authorAvatar: '/images/aimagica-logo.png',
        likes,
        comments,
        views: Math.floor(views),
        downloads: Math.floor(downloads),
        isPremium: baseImage.isPremium || Math.random() > 0.7,
        isFeatured: baseImage.isFeatured || (likes > 1500 && Math.random() > 0.5),
        isLiked: Math.random() > 0.8, // 20%的图片被"喜欢"
        createdAt: dates[Math.floor(Math.random() * dates.length)],
        prompt: baseImage.prompt,
        style: baseImage.style,
        tags: baseImage.tags,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        rotation: (Math.random() - 0.5) * 6 // -3到3度的随机旋转
      })
    })
  })

  // 随机打乱顺序
  return expandedImages.sort(() => Math.random() - 0.5)
}

/**
 * 获取推荐的Hero区域图片（前4张最佳图片）
 */
export function getHeroFeaturedImages(): StaticGalleryImage[] {
  return getStaticGalleryData()
    .filter(img => img.isFeatured)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4)
}

/**
 * 按样式过滤图片
 */
export function getImagesByStyle(style?: string): StaticGalleryImage[] {
  const allImages = getStaticGalleryData()
  
  if (!style || style === 'all') {
    return allImages
  }
  
  return allImages.filter(img => 
    img.style.toLowerCase().includes(style.toLowerCase()) ||
    img.tags.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
  )
}

/**
 * 搜索图片
 */
export function searchImages(query: string): StaticGalleryImage[] {
  if (!query.trim()) {
    return getStaticGalleryData()
  }
  
  const searchTerm = query.toLowerCase()
  return getStaticGalleryData().filter(img =>
    img.title.toLowerCase().includes(searchTerm) ||
    img.prompt.toLowerCase().includes(searchTerm) ||
    img.style.toLowerCase().includes(searchTerm) ||
    img.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    img.author.toLowerCase().includes(searchTerm)
  )
}