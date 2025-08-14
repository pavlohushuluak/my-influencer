import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Key, CreditCard, Shield, Bell, Crown, Calendar, AlertCircle, Check, Star, Image, Video, Folder, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditPurchaseDialog } from '@/components/Payment/CreditPurchaseDialog';
import { config } from '@/config/config';

interface GeneratedImageData {
  id: string;
  task_id: string;
  image_sequence_number: number;
  system_filename: string;
  user_filename: string | null;
  user_notes: string | null;
  user_tags: string[] | null;
  file_path: string;
  file_size_bytes: number;
  image_format: string;
  seed: number;
  guidance: number;
  steps: number;
  nsfw_strength: number;
  lora_strength: number;
  model_version: string;
  t5xxl_prompt: string;
  clip_l_prompt: string;
  negative_prompt: string;
  generation_status: string;
  generation_started_at: string;
  generation_completed_at: string;
  generation_time_seconds: number;
  error_message: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  actual_seed_used: number;
  prompt_file_used: string;
  quality_setting: string;
  rating: number;
  favorite: boolean;
  file_type: string;
}

interface VaultStats {
  totalImages: number;
  totalVideos: number;
  totalItems: number;
  lastUpdated: string;
}

interface VideoData {
  id: string;
  task_id: string;
  video_id: string;
  user_uuid: string;
  model: string;
  mode: string;
  prompt: string;
  duration: number;
  start_image: string;
  start_image_url: string;
  negative_prompt: string;
  status: string;
  task_created_at: string;
  task_completed_at: string;
  lip_flag: boolean;
  user_filename?: string;
  user_notes?: string;
  user_tags?: string[];
  rating?: number;
  favorite?: boolean;
  video_url?: string;
  video_path?: string;
  video_name?: string;
}

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [vaultStats, setVaultStats] = useState<VaultStats>({
    totalImages: 0,
    totalVideos: 0,
    totalItems: 0,
    lastUpdated: ''
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
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

    // Fetch vault statistics
  const fetchVaultStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // Fetch images from generated_images table
      const imagesResponse = await fetch(`${config.supabase_server_url}/generated_images?user_uuid=eq.${user.id}&generation_status=eq.completed&select=file_type,file_size_bytes,created_at`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (!imagesResponse.ok) {
        throw new Error('Failed to fetch image statistics');
      }

      const imagesData: GeneratedImageData[] = await imagesResponse.json();
      
      // Fetch videos from video table
      const videosResponse = await fetch(`${config.supabase_server_url}/video?user_uuid=eq.${user.id}&status=eq.completed&select=count`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch video statistics');
      }

      const videosData = await videosResponse.json();
      const totalVideos = videosData[0]?.count || 0;
      
      const images = imagesData.filter(item => item.file_type === 'pic');
      const lastUpdated = imagesData.length > 0 
        ? new Date(Math.max(...imagesData.map(item => new Date(item.created_at).getTime()))).toLocaleDateString()
        : 'Never';

      setVaultStats({
        totalImages: images.length,
        totalVideos: totalVideos,
        totalItems: images.length + totalVideos,
        lastUpdated
      });

    } catch (error) {
      console.error('Error fetching library statistics:', error);
      toast.error('Failed to load library statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchVaultStats();
  }, [fetchVaultStats]);



  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accessToken = sessionStorage.getItem('access_token');
      const response = await fetch(`${config.backend_url}/user`, {
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

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
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
          {/* Library Statistics Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                Library Statistics
              </CardTitle>
              <CardDescription>
                Overview of your content library and storage usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-muted-foreground">Loading library statistics...</span>
                </div>
              ) : (
                <div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Images */}
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {vaultStats.totalImages.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Images</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Videos */}
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {vaultStats.totalVideos.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Videos</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Items */}
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {vaultStats.totalItems.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="mt-6 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last updated: {vaultStats.lastUpdated}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchVaultStats}
                        disabled={isLoadingStats}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Refresh Stats
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credits & Usage</CardTitle>
              <CardDescription>Manage your credits and view usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user.credits}</p>
                </div>
                <Button onClick={() => setShowCreditPurchase(true)}>
                  <Star className="w-4 h-4 mr-2" />
                  Purchase Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreditPurchaseDialog
        open={showCreditPurchase}
        onOpenChange={setShowCreditPurchase}
      />
    </div>
  );
}
