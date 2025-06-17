import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addLocation, updateLocation, deleteLocation } from '@/store/slices/locationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  mood: string;
  lighting: string;
  season: string;
  tags: string[];
  image?: string;
}

const LOCATION_TYPES = [
  'Indoor', 'Outdoor', 'Studio', 'Cafe', 'Park', 'Beach', 'Urban', 'Home', 'Office', 'Restaurant'
];

const MOODS = [
  'Bright & Cheerful', 'Moody & Dramatic', 'Cozy & Warm', 'Modern & Clean', 'Vintage & Rustic'
];

const LIGHTING_CONDITIONS = [
  'Natural Light', 'Golden Hour', 'Studio Lighting', 'Low Light', 'Neon/Artificial'
];

export default function Location() {
  const dispatch = useDispatch();
  const { locations } = useSelector((state: RootState) => state.location);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    mood: '',
    lighting: '',
    season: '',
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      type: '',
      description: '',
      mood: '',
      lighting: '',
      season: '',
      tags: []
    });
    setTagInput('');
    setShowAddModal(true);
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description,
      mood: location.mood,
      lighting: location.lighting,
      season: location.season,
      tags: location.tags
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    const newLocation = {
      id: editingLocation?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      mood: formData.mood,
      lighting: formData.lighting,
      season: formData.season,
      tags: formData.tags
    };

    if (editingLocation) {
      dispatch(updateLocation(newLocation));
    } else {
      dispatch(addLocation(newLocation));
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteLocation(id));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Location Library
          </h1>
          <p className="text-muted-foreground">
            Manage shooting locations and environments
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-ai-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                  {location.image ? (
                    <img src={location.image} alt={location.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <MapPin className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{location.type}</Badge>
                      <Badge variant="secondary">{location.season}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Mood:</span> {location.mood}</p>
                      <p className="text-sm"><span className="font-medium">Lighting:</span> {location.lighting}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {location.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(location)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(location.id)}
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Modern Coffee Shop"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {['Indoor', 'Outdoor', 'Studio', 'Cafe', 'Park', 'Beach', 'Urban', 'Home', 'Office', 'Restaurant'].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the location..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={formData.mood} onValueChange={(value) => setFormData({...formData, mood: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {['Bright & Cheerful', 'Moody & Dramatic', 'Cozy & Warm', 'Modern & Clean', 'Vintage & Rustic'].map((mood) => (
                    <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lighting">Lighting</Label>
              <Select value={formData.lighting} onValueChange={(value) => setFormData({...formData, lighting: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent>
                  {['Natural Light', 'Golden Hour', 'Studio Lighting', 'Low Light', 'Neon/Artificial'].map((lighting) => (
                    <SelectItem key={lighting} value={lighting}>{lighting}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="All Season">All Season</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-ai-gradient hover:opacity-90">
                {editingLocation ? 'Update' : 'Add'} Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
