'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentProvider {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'alipay' | 'wechat' | 'crypto';
  enabled: boolean;
  priority: number;
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookSecret?: string;
    environment: 'sandbox' | 'production';
    supportedCurrencies: string[];
    supportedCountries: string[];
  };
  features: {
    subscription: boolean;
    oneTime: boolean;
    refund: boolean;
    webhook: boolean;
  };
  status?: 'active' | 'testing' | 'error';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'free' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: {
    imageGenerations: number;
    highResolution: boolean;
    advancedStyles: boolean;
    priorityQueue: boolean;
    apiAccess: boolean;
    commercialUse: boolean;
  };
  enabled: boolean;
  popular: boolean;
}

export default function PaymentAdminPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const { toast } = useToast();

  // 支付提供商表单状态
  const [providerForm, setProviderForm] = useState<Partial<PaymentProvider>>({
    name: '',
    type: 'stripe',
    enabled: true,
    priority: 1,
    config: {
      environment: 'sandbox',
      supportedCurrencies: ['USD'],
      supportedCountries: ['US']
    },
    features: {
      subscription: true,
      oneTime: true,
      refund: true,
      webhook: true
    }
  });

  // 订阅计划表单状态
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    type: 'premium',
    price: 0,
    currency: 'USD',
    interval: 'month',
    enabled: true,
    popular: false,
    features: {
      imageGenerations: 100,
      highResolution: true,
      advancedStyles: true,
      priorityQueue: false,
      apiAccess: false,
      commercialUse: false
    }
  });

  useEffect(() => {
    loadData();
    
    // 调试：检查用户认证状态
    console.log('检查用户认证状态...');
    fetch('/api/debug/auth', { credentials: 'include' })
      .then(res => res.json())
              .then(data => {
          console.log('=== 前端认证调试信息 ===');
          console.log('完整数据:', JSON.stringify(data, null, 2));
          console.log('用户认证状态:', data.authenticated);
          console.log('用户信息:', data.user);
          console.log('管理员检查:', data.adminCheck);
          
          // 保存当前用户邮箱
          if (data.user?.email) {
            setCurrentUserEmail(data.user.email);
          }
          
          if (!data.authenticated) {
            console.error('⚠️ 用户未认证！');
          } else if (!data.adminCheck) {
            console.error('⚠️ 用户不是管理员！', data.user?.email);
          } else {
            console.log('✅ 用户认证和管理员权限正常');
          }
        })
      .catch(err => console.error('获取认证调试信息失败:', err));
  }, []);

  const loadData = async () => {
    try {
      const [providersRes, plansRes] = await Promise.all([
        fetch('/api/admin/payment/providers'),
        fetch('/api/admin/payment/plans')
      ]);
      
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData);
      }
      
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载支付配置数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProvider = async () => {
    try {
      console.log('Saving provider:', providerForm);
      
      const method = selectedProvider ? 'PUT' : 'POST';
      const url = selectedProvider 
        ? `/api/admin/payment/providers/${selectedProvider.id}`
        : '/api/admin/payment/providers';

      console.log('Request URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...providerForm,
          userEmail: currentUserEmail
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Save result:', result);
        
        toast({
          title: "Save Successful",
          description: `Payment provider ${selectedProvider ? 'updated' : 'created'} successfully`,
        });
        setShowProviderForm(false);
        setSelectedProvider(null);
        loadData();
      } else {
        const errorData = await response.text();
        console.error('Save error:', errorData);
        throw new Error(`Save failed: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Save provider error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unable to save payment provider configuration",
        variant: "destructive",
      });
    }
  };

  const savePlan = async () => {
    try {
      console.log('Saving plan:', planForm);
      
      const method = selectedPlan ? 'PUT' : 'POST';
      const url = selectedPlan 
        ? `/api/admin/payment/plans/${selectedPlan.id}`
        : '/api/admin/payment/plans';

      console.log('Request URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save result:', result);
        
        toast({
          title: "Save Successful",
          description: `Subscription plan ${selectedPlan ? 'updated' : 'created'} successfully`,
        });
        setShowPlanForm(false);
        setSelectedPlan(null);
        loadData();
      } else {
        const errorData = await response.text();
        console.error('Save error:', errorData);
        throw new Error(`Save failed: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Save plan error:', error);
      toast({
        title: "Save Failed",
        description: "无法保存订阅计划配置",
        variant: "destructive",
      });
    }
  };

  const testProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/admin/payment/providers/${providerId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Test Successful",
          description: "Payment provider connection is working",
        });
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to connect to payment provider",
        variant: "destructive",
      });
    }
  };

  const deleteProvider = async (providerId: string, providerName: string) => {
    if (!confirm(`Are you sure you want to delete "${providerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payment/providers/${providerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Delete Successful",
          description: `Payment provider "${providerName}" deleted successfully`,
        });
        loadData(); // Refresh the list
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unable to delete payment provider",
        variant: "destructive",
      });
    }
  };

  const getProviderStatusIcon = (provider: PaymentProvider) => {
    switch (provider.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing':
        return <TestTube className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment System Administration</h1>
        <p className="text-gray-600 mt-2">管理支付提供商和订阅计划配置</p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">支付提供商</TabsTrigger>
          <TabsTrigger value="plans">订阅计划</TabsTrigger>
          <TabsTrigger value="analytics">交易分析</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Payment Providers</h2>
              <Button onClick={() => {
                setSelectedProvider(null);
                setProviderForm({
                  name: '',
                  type: 'stripe',
                  enabled: true,
                  priority: 1,
                  config: {
                    environment: 'sandbox',
                    supportedCurrencies: ['USD'],
                    supportedCountries: ['US']
                  },
                  features: {
                    subscription: true,
                    oneTime: true,
                    refund: true,
                    webhook: true
                  }
                });
                setShowProviderForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.name}
                          {getProviderStatusIcon(provider)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant={provider.type === 'stripe' ? 'default' : 'secondary'}>
                            {provider.type.toUpperCase()}
                          </Badge>
                          <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                            {provider.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testProvider(provider.id)}
                        >
                          <TestTube className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setProviderForm(provider);
                            setShowProviderForm(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteProvider(provider.id, provider.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Environment:</span> {provider.config.environment}
                      </div>
                      <div>
                        <span className="font-medium">Currencies:</span> {provider.config.supportedCurrencies.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {provider.features.subscription && <Badge variant="outline" className="text-xs">Subscription</Badge>}
                          {provider.features.oneTime && <Badge variant="outline" className="text-xs">One-time</Badge>}
                          {provider.features.refund && <Badge variant="outline" className="text-xs">Refund</Badge>}
                          {provider.features.webhook && <Badge variant="outline" className="text-xs">Webhook</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Subscription Plans</h2>
              <Button onClick={() => {
                setSelectedPlan(null);
                setPlanForm({
                  name: '',
                  description: '',
                  type: 'premium',
                  price: 0,
                  currency: 'USD',
                  interval: 'month',
                  enabled: true,
                  popular: false,
                  features: {
                    imageGenerations: 100,
                    highResolution: true,
                    advancedStyles: true,
                    priorityQueue: false,
                    apiAccess: false,
                    commercialUse: false
                  }
                });
                setShowPlanForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.popular && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Popular</Badge>}
                        </CardTitle>
                        <CardDescription>
                          <Badge variant={plan.type === 'premium' ? 'default' : 'secondary'}>
                            {plan.type.toUpperCase()}
                          </Badge>
                          <span className="ml-2 font-medium">
                            ${plan.price}/{plan.interval}
                          </span>
                        </CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setPlanForm(plan);
                          setShowPlanForm(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>{plan.description}</div>
                      <div className="space-y-1">
                        <div><span className="font-medium">Image Generations:</span> {plan.features.imageGenerations}/month</div>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.highResolution && <Badge variant="outline" className="text-xs">High Resolution</Badge>}
                          {plan.features.advancedStyles && <Badge variant="outline" className="text-xs">Advanced Styles</Badge>}
                          {plan.features.priorityQueue && <Badge variant="outline" className="text-xs">Priority Queue</Badge>}
                          {plan.features.apiAccess && <Badge variant="outline" className="text-xs">API Access</Badge>}
                          {plan.features.commercialUse && <Badge variant="outline" className="text-xs">Commercial Use</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>交易统计和支付分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                交易分析功能开发中...
                <br />
                将包含收入统计、用户订阅分析、支付成功率等功能
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 支付提供商表单弹窗 */}
      {showProviderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedProvider ? 'Edit Provider' : 'Add Provider'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input
                    id="provider-name"
                    value={providerForm.name || ''}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    placeholder="e.g., Stripe, PayPal"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-type">Provider Type</Label>
                  <Select 
                    value={providerForm.type} 
                    onValueChange={(value) => setProviderForm({ ...providerForm, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="alipay">Alipay</SelectItem>
                      <SelectItem value="wechat">WeChat Pay</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="provider-enabled"
                    checked={providerForm.enabled || false}
                    onCheckedChange={(checked) => setProviderForm({ ...providerForm, enabled: checked })}
                  />
                  <Label htmlFor="provider-enabled">Enable Provider</Label>
                </div>
                <div>
                  <Label htmlFor="provider-priority">Priority</Label>
                  <Input
                    id="provider-priority"
                    type="number"
                    value={providerForm.priority || 1}
                    onChange={(e) => setProviderForm({ ...providerForm, priority: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Environment</Label>
                <Select 
                  value={providerForm.config?.environment} 
                  onValueChange={(value) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config!, environment: value as 'sandbox' | 'production' }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={providerForm.config?.apiKey || ''}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config!, apiKey: e.target.value }
                  })}
                  placeholder="Enter API key"
                />
              </div>

              <div>
                <Label htmlFor="secret-key">Secret Key</Label>
                <Input
                  id="secret-key"
                  type="password"
                  value={providerForm.config?.secretKey || ''}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config!, secretKey: e.target.value }
                  })}
                  placeholder="Enter secret key"
                />
              </div>

              <div>
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  value={providerForm.config?.webhookSecret || ''}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config!, webhookSecret: e.target.value }
                  })}
                  placeholder="Enter webhook secret"
                />
              </div>

              <div>
                <Label htmlFor="supported-currencies">Supported Currencies (comma separated)</Label>
                <Input
                  id="supported-currencies"
                  value={providerForm.config?.supportedCurrencies?.join(', ') || 'USD'}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { 
                      ...providerForm.config!, 
                      supportedCurrencies: e.target.value.split(',').map(c => c.trim())
                    }
                  })}
                  placeholder="USD, EUR, GBP"
                />
              </div>

              <div>
                <Label htmlFor="supported-countries">Supported Countries (comma separated)</Label>
                <Input
                  id="supported-countries"
                  value={providerForm.config?.supportedCountries?.join(', ') || 'US'}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { 
                      ...providerForm.config!, 
                      supportedCountries: e.target.value.split(',').map(c => c.trim())
                    }
                  })}
                  placeholder="US, CA, GB, AU"
                />
              </div>

              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={providerForm.features?.subscription || false}
                      onCheckedChange={(checked) => setProviderForm({ 
                        ...providerForm, 
                        features: { ...providerForm.features!, subscription: checked }
                      })}
                    />
                    <Label>Subscription</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={providerForm.features?.oneTime || false}
                      onCheckedChange={(checked) => setProviderForm({ 
                        ...providerForm, 
                        features: { ...providerForm.features!, oneTime: checked }
                      })}
                    />
                    <Label>One-time Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={providerForm.features?.refund || false}
                      onCheckedChange={(checked) => setProviderForm({ 
                        ...providerForm, 
                        features: { ...providerForm.features!, refund: checked }
                      })}
                    />
                    <Label>Refund</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={providerForm.features?.webhook || false}
                      onCheckedChange={(checked) => setProviderForm({ 
                        ...providerForm, 
                        features: { ...providerForm.features!, webhook: checked }
                      })}
                    />
                    <Label>Webhook</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProviderForm(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveProvider}
                  type="button"
                  disabled={!providerForm.name || !providerForm.type}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 订阅计划表单弹窗 */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedPlan ? 'Edit Plan' : 'Add Plan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={planForm.name || ''}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g., Pro Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-type">Plan Type</Label>
                  <Select 
                    value={planForm.type} 
                    onValueChange={(value) => setPlanForm({ ...planForm, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={planForm.description || ''}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Describe the plan benefits"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="plan-price">Price</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    step="0.01"
                    value={planForm.price || 0}
                    onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="plan-currency">Currency</Label>
                  <Select 
                    value={planForm.currency} 
                    onValueChange={(value) => setPlanForm({ ...planForm, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan-interval">Interval</Label>
                  <Select 
                    value={planForm.interval} 
                    onValueChange={(value) => setPlanForm({ ...planForm, interval: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="plan-enabled"
                    checked={planForm.enabled || false}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, enabled: checked })}
                  />
                  <Label htmlFor="plan-enabled">Enable Plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="plan-popular"
                    checked={planForm.popular || false}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, popular: checked })}
                  />
                  <Label htmlFor="plan-popular">Mark as Popular</Label>
                </div>
              </div>

              <div>
                <Label>Plan Features</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="image-generations">Image Generations per Month</Label>
                    <Input
                      id="image-generations"
                      type="number"
                      value={planForm.features?.imageGenerations || 0}
                      onChange={(e) => setPlanForm({ 
                        ...planForm, 
                        features: { 
                          ...planForm.features!, 
                          imageGenerations: parseInt(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.features?.highResolution || false}
                        onCheckedChange={(checked) => setPlanForm({ 
                          ...planForm, 
                          features: { ...planForm.features!, highResolution: checked }
                        })}
                      />
                      <Label>High Resolution</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.features?.advancedStyles || false}
                        onCheckedChange={(checked) => setPlanForm({ 
                          ...planForm, 
                          features: { ...planForm.features!, advancedStyles: checked }
                        })}
                      />
                      <Label>Advanced Styles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.features?.priorityQueue || false}
                        onCheckedChange={(checked) => setPlanForm({ 
                          ...planForm, 
                          features: { ...planForm.features!, priorityQueue: checked }
                        })}
                      />
                      <Label>Priority Queue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.features?.apiAccess || false}
                        onCheckedChange={(checked) => setPlanForm({ 
                          ...planForm, 
                          features: { ...planForm.features!, apiAccess: checked }
                        })}
                      />
                      <Label>API Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={planForm.features?.commercialUse || false}
                        onCheckedChange={(checked) => setPlanForm({ 
                          ...planForm, 
                          features: { ...planForm.features!, commercialUse: checked }
                        })}
                      />
                      <Label>Commercial Use</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPlanForm(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={savePlan}
                  type="button"
                  disabled={!planForm.name || !planForm.type}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 