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
  // 使用真实的Gallery图片，确保快速显示
  const realGalleryImages: StaticGalleryImage[] = [
    {
      id: '04033a15-7dfc-4b96-8999-91e6915ac926',
      url: '/images/gallery/04033a15-7dfc-4b96-8999-91e6915ac926-34c9105b.png',
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
      url: '/images/gallery/22ab8354-87e8-4a74-a37b-c3f08f1ced20-286738dd.png',
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
      url: '/images/gallery/294ff75d-8579-4d3d-87ee-811b69b15a99-5479e3c7.png',
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
    },
    {
      id: '2afbdc00-d083-46bf-8167-28d81971226f',
      url: '/images/gallery/2afbdc00-d083-46bf-8167-28d81971226f-fb48974a.png',
      title: '机械天使',
      author: 'TechArtist',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1432,
      comments: 89,
      views: 7234,
      downloads: 556,
      isPremium: true,
      isFeatured: false,
      isLiked: false,
      createdAt: '4 days ago',
      prompt: 'Mechanical angel with cybernetic wings and ethereal lighting',
      style: 'Cyberpunk',
      tags: ['cyberpunk', 'angel', 'mechanical', 'wings', 'ethereal'],
      size: 'vertical',
      rotation: 1.5
    },
    {
      id: '341851d0-7c3b-4119-b503-102c0aee0d8f',
      url: '/images/gallery/341851d0-7c3b-4119-b503-102c0aee0d8f-b4209676.png',
      title: '古老神庙',
      author: 'TempleKeeper',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 876,
      comments: 43,
      views: 4567,
      downloads: 234,
      isPremium: false,
      isFeatured: true,
      isLiked: true,
      createdAt: '6 days ago',
      prompt: 'Ancient temple with mystical architecture and golden light',
      style: 'Fantasy',
      tags: ['fantasy', 'temple', 'ancient', 'mystical', 'golden'],
      size: 'large',
      rotation: -0.8
    },
    {
      id: '386628e0-61b1-4966-8575-2c2f2f162e3a',
      url: '/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png',
      title: '龙族传说',
      author: 'DragonMaster',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2567,
      comments: 198,
      views: 12345,
      downloads: 967,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2 days ago',
      prompt: 'Majestic dragon in epic fantasy landscape with magical elements',
      style: 'Fantasy',
      tags: ['fantasy', 'dragon', 'epic', 'majestic', 'magical'],
      size: 'horizontal',
      rotation: 0.3
    },
    {
      id: '48a8804f-9028-4132-85dd-d5c4d807c75e',
      url: '/images/gallery/48a8804f-9028-4132-85dd-d5c4d807c75e-13630e73.jpeg',
      title: '未来都市',
      author: 'UrbanVision',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1234,
      comments: 76,
      views: 6789,
      downloads: 445,
      isPremium: false,
      isFeatured: false,
      isLiked: true,
      createdAt: '1 week ago',
      prompt: 'Futuristic cityscape with flying vehicles and holographic displays',
      style: 'Sci-Fi',
      tags: ['sci-fi', 'city', 'futuristic', 'holographic', 'vehicles'],
      size: 'medium',
      rotation: 1.2
    },
    {
      id: '5abb0316-b1d9-4c3a-ac97-76fcbe63f52b',
      url: '/images/gallery/5abb0316-b1d9-4c3a-ac97-76fcbe63f52b-fbb64e00.png',
      title: '水晶洞穴',
      author: 'CrystalMiner',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 789,
      comments: 52,
      views: 3456,
      downloads: 287,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '5 days ago',
      prompt: 'Crystal cave with glowing gems and magical atmosphere',
      style: 'Fantasy',
      tags: ['fantasy', 'crystal', 'cave', 'gems', 'magical'],
      size: 'vertical',
      rotation: -1.7
    },
    {
      id: '82db65f1-d54e-4f7f-a9c3-c3f5e902643b',
      url: '/images/gallery/82db65f1-d54e-4f7f-a9c3-c3f5e902643b-d36a1d13.png',
      title: '星际战舰',
      author: 'SpaceCommander',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1876,
      comments: 123,
      views: 8765,
      downloads: 634,
      isPremium: true,
      isFeatured: false,
      isLiked: true,
      createdAt: '3 days ago',
      prompt: 'Massive space battleship in epic interstellar battle scene',
      style: 'Sci-Fi',
      tags: ['sci-fi', 'battleship', 'space', 'interstellar', 'epic'],
      size: 'horizontal',
      rotation: 0.6
    },
    {
      id: '9912c424-e6a2-4ac1-98de-77bac4200978',
      url: '/images/gallery/9912c424-e6a2-4ac1-98de-77bac4200978-fbd736fa.jpeg',
      title: '魔法师塔',
      author: 'WizardSage',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1345,
      comments: 87,
      views: 5678,
      downloads: 423,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '1 week ago',
      prompt: 'Magical wizard tower with floating spells and mystical energy',
      style: 'Fantasy',
      tags: ['fantasy', 'wizard', 'tower', 'magic', 'mystical'],
      size: 'vertical',
      rotation: 1.1
    },
    {
      id: 'b3a47ac4-6386-41b1-8702-de4cf5ff03c1',
      url: '/images/gallery/b3a47ac4-6386-41b1-8702-de4cf5ff03c1-38528305.png',
      title: '机械神话',
      author: 'MechLegend',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 2098,
      comments: 145,
      views: 9876,
      downloads: 756,
      isPremium: true,
      isFeatured: true,
      isLiked: true,
      createdAt: '2 days ago',
      prompt: 'Legendary mechanical creature with mythical powers and energy',
      style: 'Cyberpunk',
      tags: ['cyberpunk', 'mechanical', 'legendary', 'mythical', 'energy'],
      size: 'large',
      rotation: -0.4
    }
  ]

  console.log(`📋 静态Gallery数据生成: ${realGalleryImages.length}张真实AI图片`)
  return realGalleryImages
}

export default getStaticGalleryData