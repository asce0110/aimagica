import type { Metadata } from 'next'
import GalleryClient from './gallery-client'

export const metadata: Metadata = {
  title: 'AI Gallery - AIMAGICA | Explore Amazing AI Art',
  description: 'Discover stunning AI-generated artworks in our magical gallery. Browse, like, and share incredible AI art created by our community.',
  keywords: 'AI art gallery, AI generated images, digital art, artificial intelligence art, AI artwork showcase',
  openGraph: {
    title: 'AI Gallery - AIMAGICA',
    description: 'Explore amazing AI-generated artworks in our magical gallery',
    images: [
      {
        url: 'https://aimagica.ai/images/aimagica-logo.png',
        width: 800,
        height: 600,
        alt: 'AIMAGICA Gallery',
      }
    ],
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}