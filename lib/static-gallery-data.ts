/**
 * 静态Gallery数据 - 使用下载到本地的真实Gallery图片
 * 这些图片都是从API下载的真实用户作品，保证在任何网络环境下都能加载
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
 * 使用下载的真实Gallery图片，确保100%可用性
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  // 真实Gallery图片数据（从API下载到本地）
  const realGalleryImages: StaticGalleryImage[] = [
    {
      id: '386628e0-61b1-4966-8575-2c2f2f162e3a',
      url: '/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png',
      title: 'Japanese Anime Style',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1243,
      comments: 89,
      views: 5678,
      downloads: 432,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '6/26/2025',
      prompt: 'Japanese Anime Style',
      style: 'Anime',
      tags: ['anime', 'japanese', 'style'],
      size: 'medium',
      rotation: 2.5
    },
    {
      id: '48a8804f-9028-4132-85dd-d5c4d807c75e',
      url: '/images/gallery/48a8804f-9028-4132-85dd-d5c4d807c75e-13630e73.jpeg',
      title: 'Cyberpunk City with Neon Lights',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 982,
      comments: 56,
      views: 4321,
      downloads: 321,
      isPremium: true,
      isFeatured: false,
      isLiked: true,
      createdAt: '6/25/2025',
      prompt: 'A cyberpunk city with neon lights reflecting in the rain',
      style: 'Chibi Diorama',
      tags: ['cyberpunk', 'city', 'neon', 'rain'],
      size: 'horizontal',
      rotation: -1.2
    },
    {
      id: '9912c424-e6a2-4ac1-98de-77bac4200978',
      url: '/images/gallery/9912c424-e6a2-4ac1-98de-77bac4200978-fbd736fa.jpeg',
      title: 'Peaceful Zen Garden',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 756,
      comments: 42,
      views: 3210,
      downloads: 198,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '6/24/2025',
      prompt: 'A peaceful zen garden with cherry blossoms',
      style: 'Photography',
      tags: ['zen', 'garden', 'peace', 'nature'],
      size: 'vertical',
      rotation: 1.8
    },
    {
      id: '294ff75d-8579-4d3d-87ee-811b69b15a99',
      url: '/images/gallery/294ff75d-8579-4d3d-87ee-811b69b15a99-5479e3c7.png',
      title: 'Digital Art Creation',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1567,
      comments: 103,
      views: 6789,
      downloads: 543,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '6/23/2025',
      prompt: 'Beautiful digital artwork with vibrant colors',
      style: 'Digital Art',
      tags: ['digital', 'art', 'vibrant', 'colors'],
      size: 'medium',
      rotation: -2.1
    },
    {
      id: '5abb0316-b1d9-4c3a-ac97-76fcbe63f52b',
      url: '/images/gallery/5abb0316-b1d9-4c3a-ac97-76fcbe63f52b-fbb64e00.png',
      title: 'Fantasy Landscape',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2134,
      comments: 167,
      views: 8765,
      downloads: 876,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '6/22/2025',
      prompt: 'Mystical fantasy landscape with mountains',
      style: 'Fantasy',
      tags: ['fantasy', 'landscape', 'mountains', 'mystical'],
      size: 'large',
      rotation: 0.8
    },
    {
      id: '2afbdc00-d083-46bf-8167-28d81971226f',
      url: '/images/gallery/2afbdc00-d083-46bf-8167-28d81971226f-fb48974a.png',
      title: 'Abstract Composition',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1876,
      comments: 92,
      views: 7654,
      downloads: 654,
      isPremium: false,
      isFeatured: false,
      isLiked: true,
      createdAt: '6/21/2025',
      prompt: 'Modern abstract art composition',
      style: 'Abstract',
      tags: ['abstract', 'modern', 'composition'],
      size: 'small',
      rotation: -1.5
    },
    {
      id: '04033a15-7dfc-4b96-8999-91e6915ac926',
      url: '/images/gallery/04033a15-7dfc-4b96-8999-91e6915ac926-34c9105b.png',
      title: 'Portrait Study',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1432,
      comments: 78,
      views: 5432,
      downloads: 432,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '6/20/2025',
      prompt: 'Detailed portrait artwork',
      style: 'Portrait',
      tags: ['portrait', 'study', 'detailed'],
      size: 'vertical',
      rotation: 1.2
    },
    {
      id: 'b3a47ac4-6386-41b1-8702-de4cf5ff03c1',
      url: '/images/gallery/b3a47ac4-6386-41b1-8702-de4cf5ff03c1-38528305.png',
      title: 'Nature Scene',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2345,
      comments: 145,
      views: 9876,
      downloads: 765,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '6/19/2025',
      prompt: 'Beautiful nature landscape scene',
      style: 'Nature',
      tags: ['nature', 'landscape', 'beautiful'],
      size: 'horizontal',
      rotation: -0.9
    },
    {
      id: '82db65f1-d54e-4f7f-a9c3-c3f5e902643b',
      url: '/images/gallery/82db65f1-d54e-4f7f-a9c3-c3f5e902643b-d36a1d13.png',
      title: 'Character Design',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 876,
      comments: 56,
      views: 3456,
      downloads: 234,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '6/18/2025',
      prompt: 'Creative character design artwork',
      style: 'Character',
      tags: ['character', 'design', 'creative'],
      size: 'medium',
      rotation: 2.3
    },
    {
      id: '22ab8354-87e8-4a74-a37b-c3f08f1ced20',
      url: '/images/gallery/22ab8354-87e8-4a74-a37b-c3f08f1ced20-286738dd.png',
      title: 'AI Generated Artwork',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1654,
      comments: 87,
      views: 6543,
      downloads: 543,
      isPremium: true,
      isFeatured: false,
      isLiked: true,
      createdAt: '6/17/2025',
      prompt: 'AI Generated Artwork',
      style: 'AI Art',
      tags: ['ai', 'generated', 'artwork'],
      size: 'large',
      rotation: -1.7
    },
    {
      id: '341851d0-7c3b-4119-b503-102c0aee0d8f',
      url: '/images/gallery/341851d0-7c3b-4119-b503-102c0aee0d8f-b4209676.png',
      title: 'Creative Design',
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2876,
      comments: 198,
      views: 9432,
      downloads: 876,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '6/16/2025',
      prompt: 'Innovative creative design piece',
      style: 'Design',
      tags: ['creative', 'design', 'innovative'],
      size: 'small',
      rotation: 1.6
    }
  ]

  return realGalleryImages
}

/**
 * 按样式筛选图片
 */
export function getImagesByStyle(style: string): StaticGalleryImage[] {
  const allImages = getStaticGalleryData()
  if (style === 'all') return allImages
  return allImages.filter(img => img.style.toLowerCase() === style.toLowerCase())
}

/**
 * 搜索图片
 */
export function searchImages(query: string): StaticGalleryImage[] {
  const allImages = getStaticGalleryData()
  const lowerQuery = query.toLowerCase()
  return allImages.filter(img => 
    img.title.toLowerCase().includes(lowerQuery) ||
    img.author.toLowerCase().includes(lowerQuery) ||
    img.prompt.toLowerCase().includes(lowerQuery) ||
    img.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}