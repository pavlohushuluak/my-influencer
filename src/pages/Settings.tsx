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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { User, Mail, Key, CreditCard, Shield, Bell, Crown, Calendar, AlertCircle, Check, Star, Image, Video, Folder, Database, TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react';
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

interface MonthlyTransaction {
  period: string;
  month_start: string;
  item_name: string;
  uses_count: number;
  gems_total: number;
}

interface MonthlyTransactionByItem {
  user_id?: string;
  period: string;
  month_start: string;
  item_name: string;
  uses_count: number;
  gems_total: number;
}

interface MonthlyTransactionByTaskType {
  period: string;
  month_start: string;
  task_type: string;
  uses_count: number;
  gems_total: number;
}

interface MonthlyTransactionByTaskTypeUser {
  user_id: string;
  period: string;
  month_start: string;
  task_type: string;
  uses_count: number;
  gems_total: number;
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
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyTransaction[]>([]);
  const [monthlyTransactionsByItem, setMonthlyTransactionsByItem] = useState<MonthlyTransactionByItem[]>([]);
  const [monthlyTransactionsByItemGlobal, setMonthlyTransactionsByItemGlobal] = useState<MonthlyTransaction[]>([]);
  const [monthlyTransactionsByTaskType, setMonthlyTransactionsByTaskType] = useState<MonthlyTransactionByTaskType[]>([]);
  const [monthlyTransactionsByTaskTypeUser, setMonthlyTransactionsByTaskTypeUser] = useState<MonthlyTransactionByTaskTypeUser[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'item' | 'itemGlobal' | 'taskType' | 'taskTypeUser'>('item');
  const navigate = useNavigate();

  // Mock subscription data - replace with actual data from your backend
  const subscriptionData = {
    plan: user.subscription || 'Free',
    nextBillingDate: '2024-07-01',
    cardLast4: '4242',
    status: 'active',
    features: {
      free: ['Basic influencer information', 'Limited appearance customization', 'Basic style options', 'Up to 3 color palettes', 'Basic content generation'],
      professional: ['All Free features', 'Advanced appearance customization', 'Detailed personality traits', 'Style & Settings options', 'Content focus customization', 'Unlimited color palettes', 'Advanced content generation', 'Priority support'],
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

  // Fetch monthly transactions
  const fetchMonthlyTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      // Fetch all transaction views
      const [itemResponse, itemGlobalResponse, taskTypeResponse, taskTypeUserResponse] = await Promise.all([
        fetch(`${config.supabase_server_url}/v_transactions_monthly_by_item_name_user?user_id=eq.${user.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${config.supabase_server_url}/v_transactions_monthly_by_item_name`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${config.supabase_server_url}/v_transactions_monthly_by_task_type`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${config.supabase_server_url}/v_transactions_monthly_by_task_type_user?user_id=eq.${user.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!itemResponse.ok || !itemGlobalResponse.ok || !taskTypeResponse.ok || !taskTypeUserResponse.ok) {
        throw new Error('Failed to fetch monthly transactions');
      }

      const [itemData, itemGlobalData, taskTypeData, taskTypeUserData] = await Promise.all([
        itemResponse.json(),
        itemGlobalResponse.json(),
        taskTypeResponse.json(),
        taskTypeUserResponse.json()
      ]);

      setMonthlyTransactionsByItem(itemData);
      setMonthlyTransactionsByItemGlobal(itemGlobalData);
      setMonthlyTransactionsByTaskType(taskTypeData);
      setMonthlyTransactionsByTaskTypeUser(taskTypeUserData);

      // For backward compatibility, use item data as main transactions
      setMonthlyTransactions(itemData);
    } catch (error) {
      console.error('Error fetching monthly transactions:', error);
      toast.error('Failed to load monthly transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMonthlyTransactions();
  }, [fetchMonthlyTransactions]);



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

  // Helper functions for monthly transactions
  const formatMonth = (monthStart: string) => {
    return new Date(monthStart).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getItemIcon = (itemName: string) => {
    const item = itemName.toLowerCase();
    if (item.includes('image') || item.includes('pic')) return <Image className="w-4 h-4" />;
    if (item.includes('video')) return <Video className="w-4 h-4" />;
    if (item.includes('lipsync') || item.includes('lip')) return <Activity className="w-4 h-4" />;
    if (item.includes('upscale') || item.includes('enhance')) return <TrendingUp className="w-4 h-4" />;
    if (item.includes('edit') || item.includes('swap')) return <BarChart3 className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  const getTaskTypeIcon = (taskType: string) => {
    const task = taskType.toLowerCase();
    if (task.includes('image') || task.includes('pic')) return <Image className="w-4 h-4" />;
    if (task.includes('video')) return <Video className="w-4 h-4" />;
    if (task.includes('lipsync') || task.includes('lip')) return <Activity className="w-4 h-4" />;
    if (task.includes('upscale') || task.includes('enhance')) return <TrendingUp className="w-4 h-4" />;
    if (task.includes('edit') || task.includes('swap')) return <BarChart3 className="w-4 h-4" />;
    if (task.includes('synthesis')) return <Database className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  const getItemColor = (itemName: string) => {
    const item = itemName.toLowerCase();
    if (item.includes('image') || item.includes('pic')) return 'text-blue-600 dark:text-blue-400';
    if (item.includes('video')) return 'text-purple-600 dark:text-purple-400';
    if (item.includes('lipsync') || item.includes('lip')) return 'text-pink-600 dark:text-pink-400';
    if (item.includes('upscale') || item.includes('enhance')) return 'text-green-600 dark:text-green-400';
    if (item.includes('edit') || item.includes('swap')) return 'text-orange-600 dark:text-orange-400';
    if (item.includes('synthesis')) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTaskTypeColor = (taskType: string) => {
    const task = taskType.toLowerCase();
    if (task.includes('image') || task.includes('pic')) return 'text-blue-600 dark:text-blue-400';
    if (task.includes('video')) return 'text-purple-600 dark:text-purple-400';
    if (task.includes('lipsync') || task.includes('lip')) return 'text-pink-600 dark:text-pink-400';
    if (task.includes('upscale') || task.includes('enhance')) return 'text-green-600 dark:text-green-400';
    if (task.includes('edit') || task.includes('swap')) return 'text-orange-600 dark:text-orange-400';
    if (task.includes('synthesis')) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getItemBadgeColor = (itemName: string) => {
    const item = itemName.toLowerCase();
    if (item.includes('image') || item.includes('pic')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    if (item.includes('video')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    if (item.includes('lipsync') || item.includes('lip')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    if (item.includes('upscale') || item.includes('enhance')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (item.includes('edit') || item.includes('swap')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    if (item.includes('synthesis')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getTaskTypeBadgeColor = (taskType: string) => {
    const task = taskType.toLowerCase();
    if (task.includes('image') || task.includes('pic')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    if (task.includes('video')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    if (task.includes('lipsync') || task.includes('lip')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    if (task.includes('upscale') || task.includes('enhance')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (task.includes('edit') || task.includes('swap')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    if (task.includes('synthesis')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Get current data based on selected view
  const getCurrentData = () => {
    switch (selectedView) {
      case 'item':
        return monthlyTransactionsByItem;
      case 'itemGlobal':
        return monthlyTransactionsByItemGlobal;
      case 'taskType':
        return monthlyTransactionsByTaskType;
      case 'taskTypeUser':
        return monthlyTransactionsByTaskTypeUser;
      default:
        return monthlyTransactionsByItem;
    }
  };

  const currentData = getCurrentData();

  // Filter transactions by period
  const filteredTransactions = currentData.filter(transaction => {
    if (selectedPeriod === 'all') return true;
    return transaction.period === selectedPeriod;
  });

  // Calculate summary statistics
  const totalGems = filteredTransactions.reduce((sum, transaction) => sum + transaction.gems_total, 0);
  const totalUses = filteredTransactions.reduce((sum, transaction) => sum + transaction.uses_count, 0);
  const uniqueItems = new Set(filteredTransactions.map(t =>
    'item_name' in t ? t.item_name : t.task_type
  )).size;

  // Prepare chart data
  const chartData = filteredTransactions.map(transaction => ({
    name: 'item_name' in transaction ? transaction.item_name : transaction.task_type,
    gems: transaction.gems_total,
    uses: transaction.uses_count,
    avgPerUse: transaction.gems_total / transaction.uses_count,
    period: transaction.period,
    month: formatMonth(transaction.month_start)
  }));

  // Prepare pie chart data for item distribution
  const pieChartData = filteredTransactions.reduce((acc, transaction) => {
    const name = 'item_name' in transaction ? transaction.item_name : transaction.task_type;
    const existing = acc.find(item => item.name === name);
    if (existing) {
      existing.value += transaction.gems_total;
    } else {
      acc.push({
        name: name,
        value: transaction.gems_total,
        color: ('item_name' in transaction ? getItemColor(transaction.item_name) : getTaskTypeColor(transaction.task_type)).replace('text-', '').replace('dark:text-', '')
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  // Prepare monthly trend data
  const monthlyTrendData = filteredTransactions.reduce((acc, transaction) => {
    const monthKey = transaction.period;
    const existing = acc.find(item => item.month === monthKey);
    if (existing) {
      existing.gems += transaction.gems_total;
      existing.uses += transaction.uses_count;
    } else {
      acc.push({
        month: monthKey,
        gems: transaction.gems_total,
        uses: transaction.uses_count
      });
    }
    return acc;
  }, [] as Array<{ month: string; gems: number; uses: number }>).sort((a, b) => a.month.localeCompare(b.month));

  // Chart colors
  const chartColors = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    indigo: '#6366F1',
    emerald: '#059669'
  };

  const COLORS = [chartColors.blue, chartColors.purple, chartColors.pink, chartColors.green, chartColors.orange, chartColors.red, chartColors.indigo, chartColors.emerald];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full h-full grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1 p-1">
          <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <User className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden text-[10px] leading-tight">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <Shield className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden text-[10px] leading-tight">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <Bell className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden text-[10px] leading-tight">Notif</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <Star className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Credits</span>
            <span className="sm:hidden text-[10px] leading-tight">Credits</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <CreditCard className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Billing</span>
            <span className="sm:hidden text-[10px] leading-tight">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex flex-col items-center gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:py-2 sm:px-3">
            <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden text-[10px] leading-tight">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-sm">Update your personal information and how others see you on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Library Statistics Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Library Statistics
              </CardTitle>
              <CardDescription className="text-sm">
                Overview of your content library and storage usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                  <span className="text-sm sm:text-base text-muted-foreground">Loading library statistics...</span>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Total Images */}
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 sm:p-4 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {vaultStats.totalImages.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Images</p>
                        </div>
                      </div>
                    </div>

                    {/* Total Videos */}
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 sm:p-4 border border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {vaultStats.totalVideos.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Videos</p>
                        </div>
                      </div>
                    </div>

                    {/* Total Items */}
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 sm:p-4 border border-green-200/50 dark:border-green-800/50 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                            {vaultStats.totalItems.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Total Items</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Last updated: {vaultStats.lastUpdated}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchVaultStats}
                        disabled={isLoadingStats}
                        className="w-full sm:w-auto"
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
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
              <CardDescription className="text-sm">Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-full sm:w-auto">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <CardDescription className="text-sm">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Credits & Usage</CardTitle>
              <CardDescription className="text-sm">Manage your credits and view usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg gap-4 sm:gap-0">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Available Credits</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{user.credits}</p>
                </div>
                <Button onClick={() => setShowCreditPurchase(true)} className="w-full sm:w-auto">
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
              <CardTitle className="text-lg sm:text-xl">Billing Information</CardTitle>
              <CardDescription className="text-sm">Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Billing settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
          {/* View Selector */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                Analytics View
              </CardTitle>
              <CardDescription className="text-sm">Choose how you want to view your transaction data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  variant={selectedView === 'itemGlobal' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('itemGlobal')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-2"
                >
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">By Item Name (Global)</span>
                  <span className="sm:hidden">Global Items</span>
                </Button>
                <Button
                  variant={selectedView === 'item' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('item')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-2"
                >
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">By Item Name (Personal)</span>
                  <span className="sm:hidden">Personal Items</span>
                </Button>
                <Button
                  variant={selectedView === 'taskType' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('taskType')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-2"
                >
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">By Task Type (Global)</span>
                  <span className="sm:hidden">Global Tasks</span>
                </Button>
                <Button
                  variant={selectedView === 'taskTypeUser' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('taskTypeUser')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-2"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">By Task Type (Personal)</span>
                  <span className="sm:hidden">Personal Tasks</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Transactions Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Total Gems Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{totalGems.toFixed(2)}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Total Uses</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{totalUses}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Unique Items</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{uniqueItems}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {filteredTransactions.length > 0 && (
            <div className="grid gap-4 sm:gap-6">

              {/* Item Distribution Pie Chart */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    {selectedView === 'item' && 'Spending by Item Type'}
                    {selectedView === 'itemGlobal' && 'Global Spending by Item Type'}
                    {selectedView === 'taskType' && 'Global Spending by Task Type'}
                    {selectedView === 'taskTypeUser' && 'Personal Spending by Task Type'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {selectedView === 'item' && 'Distribution of your gem spending across different services'}
                    {selectedView === 'itemGlobal' && 'Global distribution of gem spending across different services'}
                    {selectedView === 'taskType' && 'Global distribution of gem spending across different task types'}
                    {selectedView === 'taskTypeUser' && 'Distribution of your personal gem spending across different task types'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => [`${value.toFixed(2)} gems`, 'Total Spent']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Usage Comparison Chart */}
          {filteredTransactions.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  Usage vs Spending Comparison
                </CardTitle>
                <CardDescription className="text-sm">
                  {selectedView === 'item' && 'Compare usage frequency with spending for each service'}
                  {selectedView === 'itemGlobal' && 'Compare global usage frequency with spending for each service'}
                  {selectedView === 'taskType' && 'Compare global usage frequency with spending for each task type'}
                  {selectedView === 'taskTypeUser' && 'Compare your personal usage frequency with spending for each task type'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748B"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="uses"
                        fill={chartColors.purple}
                        radius={[4, 4, 0, 0]}
                        name="Usage Count"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="gems"
                        fill={chartColors.green}
                        radius={[4, 4, 0, 0]}
                        name="Gems Spent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Insights */}
          {filteredTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  Usage Insights
                </CardTitle>
                <CardDescription className="text-sm">Key insights about your credit usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Most Expensive Item</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                      {(() => {
                        const maxTransaction = filteredTransactions.reduce((max, t) => t.gems_total > max.gems_total ? t : max, filteredTransactions[0]);
                        return maxTransaction.gems_total > 0
                          ? ('item_name' in maxTransaction ? maxTransaction.item_name : maxTransaction.task_type)
                          : 'No data';
                      })()}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Most Used Item</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                      {(() => {
                        const maxTransaction = filteredTransactions.reduce((max, t) => t.uses_count > max.uses_count ? t : max, filteredTransactions[0]);
                        return maxTransaction.uses_count > 0
                          ? ('item_name' in maxTransaction ? maxTransaction.item_name : maxTransaction.task_type)
                          : 'No data';
                      })()}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Avg. Gems per Use</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-green-900 dark:text-green-100">
                      {(totalGems / totalUses).toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">Active Months</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-orange-900 dark:text-orange-100">
                      {new Set(filteredTransactions.map(t => t.period)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreditPurchaseDialog
        open={showCreditPurchase}
        onOpenChange={setShowCreditPurchase}
      />
    </div>
  );
}
