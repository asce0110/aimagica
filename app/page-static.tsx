"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Palette,
  Wand2,
  Download,
  Share2,
  Heart,
  Star,
  Brush,
  Sparkles,
  ImageIcon,
  PenTool,
  Layers,
  ArrowRight,
  Crown,
  Users,
  Zap,
  Eye,
} from "lucide-react"
import Link from "next/link"
import HeroSection from "@/components/hero-section"
import TestimonialsCarousel from "@/components/testimonials-carousel"
import { isFeatureEnabled } from "@/lib/api-config"

export default function AISketchPlatformStatic() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AIMAGICA</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/gallery" className="text-white/80 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/help" className="text-white/80 hover:text-white transition-colors">
              Help
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isFeatureEnabled('USER_AUTH') && (
              <div className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                Demo Mode
              </div>
            )}
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Transform Your Images with AI
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience the future of image creation with our advanced AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ImageIcon className="w-12 h-12 text-purple-400" />,
                title: "Image to Image",
                description: "Transform your sketches and photos into stunning artworks with AI",
                available: true
              },
              {
                icon: <PenTool className="w-12 h-12 text-blue-400" />,
                title: "Text to Image", 
                description: "Create amazing images from simple text descriptions",
                available: false
              },
              {
                icon: <Layers className="w-12 h-12 text-green-400" />,
                title: "Style Transfer",
                description: "Apply artistic styles to your images instantly",
                available: false
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70 mb-4">
                  {feature.description}
                </p>
                {!feature.available && (
                  <div className="text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Generated Gallery
            </h2>
            <p className="text-xl text-white/80">
              Explore amazing creations from our AI platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 group hover:bg-white/10 transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white/50" />
                </div>
                <div className="text-sm text-white/80">
                  AI Generated Art #{item}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-white/60">{Math.floor(Math.random() * 100) + 10}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3">
                View Full Gallery
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Create Amazing Art?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using AI to transform their ideas into stunning visuals
          </p>
          
          {!isFeatureEnabled('IMAGE_GENERATION') && (
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">Demo Mode Active</span>
              </div>
              <p className="text-white/80 text-sm">
                Full functionality will be available once API services are configured.
                Currently in static preview mode.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3">
                Explore Gallery
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AIMAGICA</span>
              </div>
              <p className="text-white/60 text-sm">
                Transform your images with the power of AI. Create stunning artworks in seconds.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <div className="space-y-2">
                <Link href="/gallery" className="block text-white/60 hover:text-white text-sm">
                  Gallery
                </Link>
                <Link href="/pricing" className="block text-white/60 hover:text-white text-sm">
                  Pricing
                </Link>
                <Link href="/help" className="block text-white/60 hover:text-white text-sm">
                  Help Center
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-white/60 hover:text-white text-sm">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-white/60 hover:text-white text-sm">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="block text-white/60 hover:text-white text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <Link href="/contact" className="block text-white/60 hover:text-white text-sm">
                  Contact Us
                </Link>
                <Link href="/about" className="block text-white/60 hover:text-white text-sm">
                  About
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 AIMAGICA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 