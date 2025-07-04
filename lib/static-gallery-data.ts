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
 * 生成静态Gallery数据 - 无需API，纯静态展示
 * 参考Pinterest、Dribbble等网站的做法，预先准备好展示内容
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  console.log('📋 静态Gallery数据: 返回精选作品，无需API调用')
  
  // 使用构建时确定的精选作品，展示AIMAGICA的能力
  return [
    {
      id: 'static-1',
      url: '/images/gallery/04033a15-7dfc-4b96-8999-91e6915ac926-34c9105b.png',
      title: 'Cyberpunk Warrior',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 247,
      comments: 32,
      views: 1840,
      downloads: 89,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-15',
      prompt: 'A futuristic cyberpunk warrior in neon-lit city streets, digital art masterpiece',
      style: 'Cyberpunk',
      tags: ['cyberpunk', 'warrior', 'neon', 'futuristic'],
      size: 'large',
      rotation: -2
    },
    {
      id: 'static-2', 
      url: '/images/gallery/22ab8354-87e8-4a74-a37b-c3f08f1ced20-286738dd.png',
      title: 'Fantasy Dragon',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 389,
      comments: 45,
      views: 2156,
      downloads: 123,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-14',
      prompt: 'Majestic dragon soaring through mystical clouds, fantasy art with magical lighting',
      style: 'Fantasy',
      tags: ['dragon', 'fantasy', 'magical', 'clouds'],
      size: 'vertical',
      rotation: 1
    },
    {
      id: 'static-3',
      url: '/images/gallery/294ff75d-8579-4d3d-87ee-811b69b15a99-5479e3c7.png', 
      title: 'Zen Garden',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 156,
      comments: 18,
      views: 987,
      downloads: 67,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-13',
      prompt: 'Peaceful Japanese zen garden with cherry blossoms and traditional architecture',
      style: 'Minimalist',
      tags: ['zen', 'garden', 'peaceful', 'japanese'],
      size: 'horizontal',
      rotation: -1
    },
    {
      id: 'static-4',
      url: '/images/gallery/2afbdc00-d083-46bf-8167-28d81971226f-fb48974a.png',
      title: 'Space Explorer',
      author: 'AIMAGICA', 
      authorAvatar: '/images/aimagica-logo.png',
      likes: 298,
      comments: 27,
      views: 1456,
      downloads: 91,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-12',
      prompt: 'Astronaut exploring alien landscape with distant planets and cosmic phenomena',
      style: 'Sci-Fi',
      tags: ['space', 'astronaut', 'alien', 'cosmic'],
      size: 'medium',
      rotation: 0
    },
    {
      id: 'static-5',
      url: '/images/gallery/341851d0-7c3b-4119-b503-102c0aee0d8f-b4209676.png',
      title: 'Magical Forest',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png', 
      likes: 445,
      comments: 38,
      views: 2298,
      downloads: 167,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-11',
      prompt: 'Enchanted forest with glowing mushrooms and fairy lights, mystical atmosphere',
      style: 'Fantasy',
      tags: ['forest', 'magical', 'glowing', 'mystical'],
      size: 'large',
      rotation: 2
    },
    {
      id: 'static-6',
      url: '/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png',
      title: 'Digital Portrait',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 178,
      comments: 15,
      views: 892,
      downloads: 45,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-10',
      prompt: 'Stylized digital portrait with vibrant colors and artistic brush strokes',
      style: 'Digital Art',
      tags: ['portrait', 'digital', 'vibrant', 'artistic'],
      size: 'vertical',
      rotation: -1
    },
    {
      id: 'static-7',
      url: '/images/gallery/48a8804f-9028-4132-85dd-d5c4d807c75e-13630e73.jpeg',
      title: 'Ocean Sunset',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 267,
      comments: 22,
      views: 1567,
      downloads: 98,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-09',
      prompt: 'Breathtaking ocean sunset with warm golden light reflecting on calm waters',
      style: 'Realistic',
      tags: ['ocean', 'sunset', 'golden', 'peaceful'],
      size: 'horizontal',
      rotation: 1
    },
    {
      id: 'static-8',
      url: '/images/gallery/5abb0316-b1d9-4c3a-ac97-76fcbe63f52b-fbb64e00.png',
      title: 'Steampunk Airship',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 334,
      comments: 29,
      views: 1789,
      downloads: 112,
      isPremium: true,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-08',
      prompt: 'Victorian steampunk airship floating through cloudy skies with brass details',
      style: 'Steampunk',
      tags: ['steampunk', 'airship', 'victorian', 'brass'],
      size: 'medium',
      rotation: -2
    },
    {
      id: 'static-9',
      url: '/images/gallery/82db65f1-d54e-4f7f-a9c3-c3f5e902643b-d36a1d13.png',
      title: 'Abstract Dreams',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 189,
      comments: 12,
      views: 743,
      downloads: 34,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-07',
      prompt: 'Abstract composition with flowing shapes and dreamy color gradients',
      style: 'Abstract',
      tags: ['abstract', 'dreams', 'flowing', 'gradients'],
      size: 'small',
      rotation: 0
    },
    {
      id: 'static-10',
      url: '/images/gallery/9912c424-e6a2-4ac1-98de-77bac4200978-fbd736fa.jpeg',
      title: 'Mountain Vista',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 412,
      comments: 35,
      views: 2045,
      downloads: 189,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-06',
      prompt: 'Majestic mountain landscape with snow-capped peaks and dramatic lighting',
      style: 'Landscape',
      tags: ['mountain', 'landscape', 'snow', 'dramatic'],
      size: 'large',
      rotation: 1
    },
    {
      id: 'static-11',
      url: '/images/gallery/b3a47ac4-6386-41b1-8702-de4cf5ff03c1-38528305.png',
      title: 'Robot Companion',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 223,
      comments: 19,
      views: 1123,
      downloads: 76,
      isPremium: true,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-05',
      prompt: 'Friendly robot companion with sleek design and expressive LED eyes',
      style: 'Sci-Fi',
      tags: ['robot', 'companion', 'sleek', 'led'],
      size: 'vertical',
      rotation: -1
    }
  ]
}

export default getStaticGalleryData