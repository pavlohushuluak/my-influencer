import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Key, CreditCard, Shield, Bell, Crown, Calendar, AlertCircle, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditPurchaseDialog } from '@/components/Payment/CreditPurchaseDialog';

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const navigate = useNavigate();

  // Mock subscription data - replace with actual data from your backend
  const subscriptionData = {
    plan: user.subscription || 'Free',
    nextBillingDate: '2024-07-01',
    cardLast4: '4242',
    status: 'active',
    features: {
      free: ['Basic influencer information', 'Limited appearance customization', 'Basic style options', 'Up to 3 color palettes', 'Basic content generation'],
      professional: ['All Free features', 'Advanced appearance customization', 'Detailed personality traits', 'Style & environment options', 'Content focus customization', 'Unlimited color palettes', 'Advanced content generation', 'Priority support'],
      enterprise: ['All Professional features', 'Unlimited customization', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations', 'Dedicated account manager', 'Team collaboration features']
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accessToken = sessionStorage.getItem('access_token');
      const response = await fetch('https://api.nymia.ai/v1/user', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            nickname: user.nickname
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual payment method update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payment method updated successfully');
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanFeatures = (plan: string) => {
    return subscriptionData.features[plan.toLowerCase() as keyof typeof subscriptionData.features] || [];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and how others see you on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={user.firstName}
                      onChange={(e) => dispatch(setUser({ firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={user.lastName}
                      onChange={(e) => dispatch(setUser({ lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    value={user.nickname}
                    onChange={(e) => dispatch(setUser({ nickname: e.target.value }))}
                    placeholder="Enter your nickname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Balance</CardTitle>
              <CardDescription>Manage your credits and purchase more when needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-ai-purple-500" />
                    <h3 className="text-lg font-semibold">{user.credits} Credits</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available for content generation and customization
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreditPurchase(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  Buy More Credits
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Credit Usage</h4>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Content Generation</p>
                      <p className="text-xs text-muted-foreground">Generate new content for your influencers</p>
                    </div>
                    <div className="text-sm font-medium">1 credit per generation</div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Appearance Customization</p>
                      <p className="text-xs text-muted-foreground">Modify your influencer's appearance</p>
                    </div>
                    <div className="text-sm font-medium">2 credits per change</div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Style Updates</p>
                      <p className="text-xs text-muted-foreground">Update your influencer's style and environment</p>
                    </div>
                    <div className="text-sm font-medium">3 credits per update</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-ai-purple-500" />
                    <h3 className="text-lg font-semibold">{subscriptionData.plan} Plan</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionData.plan === 'Free' ? 'Basic features with limited access' : 'Full access to all features'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  {subscriptionData.plan === 'Free' ? 'Upgrade Plan' : 'Change Plan'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Plan Features</h4>
                <ul className="space-y-2">
                  {getPlanFeatures(subscriptionData.plan).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-ai-purple-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {subscriptionData.plan !== 'Free' && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Next Billing Date</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.billing_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* <div className="space-y-1">
                      <h4 className="font-medium">Payment Method</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        •••• {subscriptionData.cardLast4}
                      </div>
                    </div>

                    <form onSubmit={handleBillingUpdate} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Update Payment Method</Label>
                        <Input placeholder="Card number" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="123" />
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Payment Method'}
                      </Button>
                    </form> */}
                  </div>
                </>
              )}

              {subscriptionData.plan !== 'Free' && (
                <div className="pt-4">
                  <Button variant="destructive" className="w-full">
                    Cancel Subscription
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    You will lose access to premium features at the end of your billing period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={showCreditPurchase}
        onOpenChange={setShowCreditPurchase}
      />
    </div>
  );
}
