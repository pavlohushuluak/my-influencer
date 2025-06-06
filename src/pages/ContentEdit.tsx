
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Image, Video, Save, Undo, Redo, Crop, Filter, Type } from 'lucide-react';

export default function ContentEdit() {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [editMode, setEditMode] = useState('basic');

  const mockContent = [
    { 
      id: '1', 
      title: 'Summer Fashion Shoot', 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop',
      description: 'Beautiful summer fashion content'
    },
    { 
      id: '2', 
      title: 'Workout Video', 
      type: 'video', 
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      description: 'High-energy fitness routine'
    },
    { 
      id: '3', 
      title: 'Lifestyle Portrait', 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
      description: 'Casual lifestyle photography'
    },
  ];

  const selectedItem = mockContent.find(item => item.id === selectedContent);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Edit Content
        </h1>
        <p className="text-muted-foreground">
          Edit and modify your generated content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Library */}
        <Card>
          <CardHeader>
            <CardTitle>Content Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockContent.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedContent === item.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' 
                    : 'border-border hover:border-purple-300'
                }`}
                onClick={() => setSelectedContent(item.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'image' ? (
                        <Image className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-500" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <>
              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Editing: {selectedItem.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Redo className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={selectedItem.url} 
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Editing Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Editing Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={editMode} onValueChange={setEditMode}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="filters">Filters</TabsTrigger>
                      <TabsTrigger value="text">Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex-col">
                          <Crop className="w-6 h-6 mb-2" />
                          Crop
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Filter className="w-6 h-6 mb-2" />
                          Adjust
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="filters" className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {['Original', 'Vintage', 'B&W', 'Warm', 'Cool', 'Vibrant'].map((filter) => (
                          <Button key={filter} variant="outline" className="h-16 text-xs">
                            {filter}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="text-content">Add Text</Label>
                          <Input id="text-content" placeholder="Enter text..." />
                        </div>
                        <Button className="w-full">
                          <Type className="w-4 h-4 mr-2" />
                          Add Text Overlay
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Metadata Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" defaultValue={selectedItem.title} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" defaultValue={selectedItem.description} />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="fashion, summer, lifestyle" />
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-ai-gradient hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Edit className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select Content to Edit</h3>
                <p className="text-muted-foreground text-center">
                  Choose an item from the content library to start editing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
