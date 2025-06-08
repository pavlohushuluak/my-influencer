
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, Image, Video, PlayCircle } from 'lucide-react';

export default function ContentSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const mockScheduledContent = [
    {
      id: '1',
      title: 'Morning Workout Routine',
      type: 'video',
      platform: 'instagram',
      scheduledDate: '2024-06-05',
      scheduledTime: '09:00',
      status: 'scheduled',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Fashion Outfit of the Day',
      type: 'image',
      platform: 'tiktok',
      scheduledDate: '2024-06-05',
      scheduledTime: '14:30',
      status: 'scheduled',
      thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Lifestyle Vlog',
      type: 'video',
      platform: 'fanvue',
      scheduledDate: '2024-06-06',
      scheduledTime: '18:00',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Product Review',
      type: 'image',
      platform: 'instagram',
      scheduledDate: '2024-06-07',
      scheduledTime: '12:00',
      status: 'scheduled',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'published': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-500/20 text-pink-700 dark:text-pink-400';
      case 'tiktok': return 'bg-black/20 text-black dark:text-white';
      case 'fanvue': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const todaysContent = mockScheduledContent.filter(
    content => content.scheduledDate === '2024-06-05'
  );

  const upcomingContent = mockScheduledContent.filter(
    content => content.scheduledDate > '2024-06-05'
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Content Schedule
          </h1>
          <p className="text-muted-foreground">
            Plan and schedule your content across platforms
          </p>
        </div>
        <Button 
          onClick={() => setShowScheduleForm(true)}
          className="bg-ai-gradient hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Content Lists */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              <div className="space-y-3">
                {todaysContent.length > 0 ? (
                  todaysContent.map((content) => (
                    <Card key={content.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={content.thumbnail} 
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {content.type === 'image' ? (
                              <Image className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Video className="w-4 h-4 text-purple-500" />
                            )}
                            <Badge className={getPlatformColor(content.platform)}>
                              {content.platform}
                            </Badge>
                            <Badge className={getStatusColor(content.status)}>
                              {content.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{content.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {content.scheduledTime}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No content scheduled for today</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              <div className="space-y-3">
                {upcomingContent.map((content) => (
                  <Card key={content.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {content.type === 'image' ? (
                            <Image className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-500" />
                          )}
                          <Badge className={getPlatformColor(content.platform)}>
                            {content.platform}
                          </Badge>
                          <Badge className={getStatusColor(content.status)}>
                            {content.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{content.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {content.scheduledDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {content.scheduledTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="published" className="space-y-4">
              <div className="text-center py-8">
                <PlayCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Published content will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Schedule Form Modal/Card */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-select">Select Content</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose content to schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content1">Summer Fashion Shoot</SelectItem>
                    <SelectItem value="content2">Workout Video</SelectItem>
                    <SelectItem value="content3">Lifestyle Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="platform-select">Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="fanvue">FanVue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule-date">Date</Label>
                <Input id="schedule-date" type="date" />
              </div>
              <div>
                <Label htmlFor="schedule-time">Time</Label>
                <Input id="schedule-time" type="time" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-ai-gradient hover:opacity-90">
                Schedule Content
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
