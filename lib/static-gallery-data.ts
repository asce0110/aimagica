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
 * 生成静态Gallery数据
 * 使用轻量级示例图片，确保极速加载
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  // 使用轻量级SVG示例图片，确保快速加载
  const fastGalleryImages: StaticGalleryImage[] = [
    {
      id: 'fast-cat-wizard',
      url: '/images/examples/cat-wizard.svg',
      title: '魔法师小猫',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1567,
      comments: 103,
      views: 6789,
      downloads: 543,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '5 days ago',
      prompt: 'Cute cat wearing wizard hat and casting colorful magic spells with a wand',
      style: 'Fantasy',
      tags: ['cat', 'wizard', 'cute', 'magic', 'spells'],
      size: 'medium',
      rotation: -2
    },
    {
      id: 'fast-cyber-city',
      url: '/images/examples/cyber-city.svg',
      title: '赛博东京2099',
      author: 'CyberArtist',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 982,
      comments: 56,
      views: 4321,
      downloads: 321,
      isPremium: true,
      isFeatured: false,
      isLiked: true,
      createdAt: '1 week ago',
      prompt: 'Futuristic cyberpunk cityscape with neon lights, flying cars, and holographic advertisements',
      style: 'Cyberpunk',
      tags: ['cyberpunk', 'city', 'future', 'neon', 'scifi'],
      size: 'horizontal',
      rotation: -1
    },
    {
      id: 'fast-magic-forest',
      url: '/images/examples/magic-forest.svg',
      title: '魔法森林',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1243,
      comments: 89,
      views: 5678,
      downloads: 432,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '2 days ago',
      prompt: 'A magical forest with glowing mushrooms, fairy lights, and mystical creatures hiding among ancient trees',
      style: 'Fantasy',
      tags: ['forest', 'magic', 'fantasy', 'glow', 'mystical'],
      size: 'vertical',
      rotation: 2
    },
    {
      id: 'fast-space-art',
      url: '/images/examples/space-art.svg',
      title: '太空探索者',
      author: 'StarGazer',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 756,
      comments: 42,
      views: 3210,
      downloads: 198,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '3 days ago',
      prompt: 'Astronaut exploring an alien planet with strange flora and multiple moons in the sky',
      style: 'Sci-Fi',
      tags: ['space', 'astronaut', 'alien', 'planet', 'exploration'],
      size: 'small',
      rotation: 1.5
    },
    // 创建更多变体，重复使用相同的轻量SVG
    {
      id: 'fast-cat-wizard-2',
      url: '/images/examples/cat-wizard.svg',
      title: '魔法师小猫 - 午夜版',
      author: 'AIMAGICA Pro',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 892,
      comments: 67,
      views: 4123,
      downloads: 234,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '1 day ago',
      prompt: 'Magical cat wizard casting spells under moonlight with glowing orbs',
      style: 'Fantasy',
      tags: ['cat', 'wizard', 'moonlight', 'magic', 'night'],
      size: 'large',
      rotation: 1.2
    },
    {
      id: 'fast-cyber-city-2',
      url: '/images/examples/cyber-city.svg',
      title: '霓虹街区',
      author: 'NeonArtist',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1456,
      comments: 78,
      views: 5643,
      downloads: 445,
      isPremium: true,
      isFeatured: true,
      isLiked: true,
      createdAt: '4 days ago',
      prompt: 'Vibrant neon-lit streets with holographic displays and futuristic architecture',
      style: 'Cyberpunk',
      tags: ['neon', 'street', 'hologram', 'future', 'city'],
      size: 'vertical',
      rotation: -1.8
    },
    {
      id: 'fast-magic-forest-2',
      url: '/images/examples/magic-forest.svg',
      title: '精灵之森',
      author: 'ForestKeeper',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 723,
      comments: 34,
      views: 2897,
      downloads: 156,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '6 days ago',
      prompt: 'Enchanted forest realm with fairy creatures and glowing magical plants',
      style: 'Fantasy',
      tags: ['forest', 'fairy', 'enchanted', 'magic', 'nature'],
      size: 'horizontal',
      rotation: 0.8
    },
    {
      id: 'fast-space-art-2',
      url: '/images/examples/space-art.svg',
      title: '星际旅行',
      author: 'CosmicDreamer',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1034,
      comments: 91,
      views: 4576,
      downloads: 378,
      isPremium: true,
      isFeatured: false,
      isLiked: false,
      createdAt: '1 week ago',
      prompt: 'Interstellar journey through colorful nebulae with spaceship and cosmic wonders',
      style: 'Sci-Fi',
      tags: ['space', 'nebula', 'journey', 'cosmic', 'stars'],
      size: 'medium',
      rotation: -0.5
    },
    // 添加更多变体创建丰富的Gallery内容
    {
      id: 'fast-cat-wizard-3',
      url: '/images/examples/cat-wizard.svg',
      title: '魔法工坊',
      author: 'MagicCrafter',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 634,
      comments: 28,
      views: 2145,
      downloads: 89,
      isPremium: false,
      isFeatured: false,
      isLiked: true,
      createdAt: '2 weeks ago',
      prompt: 'Cat wizard in magical workshop surrounded by potions and spell books',
      style: 'Fantasy',
      tags: ['workshop', 'potion', 'magic', 'books', 'craft'],
      size: 'small',
      rotation: 0.3
    },
    {
      id: 'fast-cyber-city-3',
      url: '/images/examples/cyber-city.svg',
      title: '数字化都市',
      author: 'DigitalVision',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 789,
      comments: 45,
      views: 3456,
      downloads: 267,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '3 weeks ago',
      prompt: 'Digital metropolis with data streams and virtual reality interfaces',
      style: 'Cyberpunk',
      tags: ['digital', 'data', 'virtual', 'interface', 'tech'],
      size: 'horizontal',
      rotation: 1.1
    },
    {
      id: 'fast-magic-forest-3',
      url: '/images/examples/magic-forest.svg',
      title: '古老圣地',
      author: 'AncientWisdom',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 445,
      comments: 19,
      views: 1876,
      downloads: 78,
      isPremium: true,
      isFeatured: false,
      isLiked: false,
      createdAt: '1 month ago',
      prompt: 'Ancient sacred grove with mystical runes and ethereal lighting',
      style: 'Fantasy',
      tags: ['ancient', 'sacred', 'runes', 'ethereal', 'grove'],
      size: 'vertical',
      rotation: -1.3
    },
    {
      id: 'fast-space-art-3',
      url: '/images/examples/space-art.svg',
      title: '银河边缘',
      author: 'GalacticExplorer',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1123,
      comments: 67,
      views: 4987,
      downloads: 389,
      isPremium: true,
      isFeatured: true,
      isLiked: true,
      createdAt: '2 weeks ago',
      prompt: 'Edge of the galaxy with swirling cosmic dust and distant star clusters',
      style: 'Sci-Fi',
      tags: ['galaxy', 'cosmic', 'dust', 'stars', 'edge'],
      size: 'large',
      rotation: 0.7
    }
  ]

  console.log(`📋 静态Gallery数据生成: ${fastGalleryImages.length}张轻量级图片`)
  return fastGalleryImages
}

export default getStaticGalleryData