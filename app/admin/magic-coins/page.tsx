'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Coins, Settings, Users, DollarSign, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface MagicCoinPackage {
  id: string
  name: string
  description?: string
  coins_amount: number
  price_usd: number
  bonus_coins: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface PackageForm {
  name: string
  description: string
  coins_amount: string
  price_usd: string
  bonus_coins: string
  sort_order: string
  is_active: boolean
}

export default function MagicCoinsManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<MagicCoinPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPackageDialog, setShowPackageDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<MagicCoinPackage | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [packageForm, setPackageForm] = useState<PackageForm>({
    name: '',
    description: '',
    coins_amount: '',
    price_usd: '',
    bonus_coins: '0',
    sort_order: '0',
    is_active: true
  })

  useEffect(() => {
    if (session?.user?.isAdmin) {
      loadPackages()
    }
  }, [session])

  const loadPackages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/magic-coins/packages')
      const data = await response.json()
      
      if (response.ok) {
        setPackages(data.packages || [])
      } else {
        console.error('Failed to load packages:', data.error)
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePackage = async () => {
    try {
      setErrorMessage('')
      
      if (!packageForm.name.trim() || !packageForm.coins_amount.trim() || !packageForm.price_usd.trim()) {
        setErrorMessage('Please fill in all required fields: Package Name, Coins Amount, and Price (USD)')
        return
      }

      const coinsAmount = parseInt(packageForm.coins_amount)
      const priceUsd = parseFloat(packageForm.price_usd)
      
      if (isNaN(coinsAmount) || coinsAmount <= 0) {
        setErrorMessage('Coins Amount must be a positive number')
        return
      }
      
      if (isNaN(priceUsd) || priceUsd <= 0) {
        setErrorMessage('Price (USD) must be a positive number')
        return
      }

      const method = editingPackage ? 'PUT' : 'POST'
      const body = editingPackage 
        ? { ...packageForm, id: editingPackage.id }
        : packageForm

      const response = await fetch('/api/admin/magic-coins/packages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        await loadPackages()
        setShowPackageDialog(false)
        resetForm()
        setErrorMessage('')
      } else {
        setErrorMessage(data.error || 'Failed to save package')
      }
    } catch (error) {
      setErrorMessage('An error occurred while saving the package')
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const response = await fetch(`/api/admin/magic-coins/packages?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadPackages()
      } else {
        const data = await response.json()
        console.error('Failed to delete package:', data.error)
      }
    } catch (error) {
      console.error('Error deleting package:', error)
    }
  }

  const handleEditPackage = (pkg: MagicCoinPackage) => {
    setEditingPackage(pkg)
    setErrorMessage('')
    setPackageForm({
      name: pkg.name,
      description: pkg.description || '',
      coins_amount: pkg.coins_amount.toString(),
      price_usd: pkg.price_usd.toString(),
      bonus_coins: pkg.bonus_coins.toString(),
      sort_order: pkg.sort_order.toString(),
      is_active: pkg.is_active
    })
    setShowPackageDialog(true)
  }

  const resetForm = () => {
    setEditingPackage(null)
    setErrorMessage('')
    setPackageForm({
      name: '',
      description: '',
      coins_amount: '',
      price_usd: '',
      bonus_coins: '0',
      sort_order: '0',
      is_active: true
    })
  }

  const handleNewPackage = () => {
    resetForm()
    setShowPackageDialog(true)
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home 🏠
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-4xl font-black text-[#2d3e2d] mb-2 flex items-center"
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            <Coins className="w-10 h-10 mr-3 text-[#d4a574]" />
            Magic Coins Management ✨
          </h1>
          <p 
            className="text-[#8b7355] text-lg font-bold"
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            Manage magic coin packages, settings, and user balances
          </p>
        </motion.div>

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Balances
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle 
                      className="text-2xl font-black text-[#2d3e2d] flex items-center"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      <DollarSign className="w-6 h-6 mr-2" />
                      Magic Coin Packages 💰
                    </CardTitle>
                    <Button
                      onClick={handleNewPackage}
                      className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package ➕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a574] mx-auto"></div>
                      <p className="mt-2 text-[#8b7355]">Loading packages...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {packages.map((pkg, index) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-[#f5f1e8] rounded-2xl border-2 border-[#8b7355] p-6 hover:border-[#d4a574] transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 
                                className="text-xl font-black text-[#2d3e2d]"
                                style={{ fontFamily: "Comic Sans MS, cursive" }}
                              >
                                {pkg.name}
                              </h3>
                              <Badge className={pkg.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                                {pkg.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPackage(pkg)}
                                className="text-[#8b7355] hover:text-[#2d3e2d]"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-[#8b7355] text-sm">{pkg.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-black text-[#d4a574]">
                                {pkg.coins_amount} coins
                              </span>
                              <span className="text-xl font-black text-[#2d3e2d]">
                                ${pkg.price_usd}
                              </span>
                            </div>
                            {pkg.bonus_coins > 0 && (
                              <p className="text-green-600 font-bold text-sm">
                                +{pkg.bonus_coins} bonus coins! 🎁
                              </p>
                            )}
                            <p className="text-xs text-[#8b7355]">
                              Sort Order: {pkg.sort_order}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle 
                    className="text-2xl font-black text-[#2d3e2d] flex items-center"
                    style={{ fontFamily: "Comic Sans MS, cursive" }}
                  >
                    <Settings className="w-6 h-6 mr-2" />
                    Magic Coin Settings ⚙️
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-[#8b7355]">Settings management coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* User Balances Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle 
                    className="text-2xl font-black text-[#2d3e2d] flex items-center"
                    style={{ fontFamily: "Comic Sans MS, cursive" }}
                  >
                    <Users className="w-6 h-6 mr-2" />
                    User Balances 👥
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-[#8b7355]">User balance management coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle 
                    className="text-2xl font-black text-[#2d3e2d] flex items-center"
                    style={{ fontFamily: "Comic Sans MS, cursive" }}
                  >
                    <Coins className="w-6 h-6 mr-2" />
                    Magic Coin Analytics 📊
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-[#8b7355]">Analytics dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Package Dialog */}
        <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 错误信息显示 */}
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{errorMessage}</span>
                </div>
              )}
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="e.g., Starter Pack"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Package description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coins_amount">Coins Amount</Label>
                  <Input
                    id="coins_amount"
                    type="number"
                    value={packageForm.coins_amount}
                    onChange={(e) => setPackageForm({ ...packageForm, coins_amount: e.target.value })}
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price_usd">Price (USD)</Label>
                  <Input
                    id="price_usd"
                    type="number"
                    step="0.01"
                    value={packageForm.price_usd}
                    onChange={(e) => setPackageForm({ ...packageForm, price_usd: e.target.value })}
                    placeholder="4.99"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bonus_coins">Bonus Coins</Label>
                  <Input
                    id="bonus_coins"
                    type="number"
                    value={packageForm.bonus_coins}
                    onChange={(e) => setPackageForm({ ...packageForm, bonus_coins: e.target.value })}
                    placeholder="5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={packageForm.sort_order}
                    onChange={(e) => setPackageForm({ ...packageForm, sort_order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={packageForm.is_active}
                  onCheckedChange={(checked) => setPackageForm({ ...packageForm, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPackageDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePackage}
                  className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d]"
                >
                  {editingPackage ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 