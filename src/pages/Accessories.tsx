import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addAccessory, updateAccessory, deleteAccessory } from '@/store/slices/accessoriesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Watch, Plus, Edit, Trash2 } from 'lucide-react';

interface Accessory {
  id: string;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  style: string;
  occasions: string[];
  brand?: string;
  image?: string;
}

const ACCESSORY_CATEGORIES = [
  'Jewelry', 'Bags', 'Watches', 'Sunglasses', 'Hats', 'Scarves', 'Belts', 'Tech Accessories'
];

const MATERIALS = [
  'Gold', 'Silver', 'Leather', 'Fabric', 'Plastic', 'Metal', 'Wood', 'Glass', 'Crystal'
];

const STYLES = [
  'Classic', 'Modern', 'Vintage', 'Bohemian', 'Minimalist', 'Luxurious', 'Casual', 'Statement'
];

const OCCASIONS = ['Work', 'Party', 'Casual', 'Date', 'Formal', 'Beach', 'Travel', 'Evening'];

export default function Accessories() {
  const dispatch = useDispatch();
  const { accessories } = useSelector((state: RootState) => state.accessories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    material: '',
    color: '',
    style: '',
    occasions: [] as string[],
    brand: ''
  });

  const handleAddNew = () => {
    setEditingAccessory(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      material: '',
      color: '',
      style: '',
      occasions: [],
      brand: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (accessory: any) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name,
      category: accessory.category,
      description: accessory.description,
      material: accessory.material,
      color: accessory.color,
      style: accessory.style,
      occasions: accessory.occasions,
      brand: accessory.brand || ''
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    const newAccessory = {
      id: editingAccessory?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      material: formData.material,
      color: formData.color,
      style: formData.style,
      occasions: formData.occasions,
      brand: formData.brand
    };

    if (editingAccessory) {
      dispatch(updateAccessory(newAccessory));
    } else {
      dispatch(addAccessory(newAccessory));
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteAccessory(id));
  };

  const toggleOccasion = (occasion: string) => {
    setFormData(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter(o => o !== occasion)
        : [...prev.occasions, occasion]
    }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Accessories Library
          </h1>
          <p className="text-muted-foreground">
            Manage accessories and styling elements
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-ai-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Accessory
        </Button>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {accessories.map((accessory) => (
          <Card key={accessory.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                  {accessory.image ? (
                    <img src={accessory.image} alt={accessory.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Watch className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{accessory.name}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{accessory.category}</Badge>
                      <Badge variant="secondary">{accessory.style}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{accessory.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Color:</span>
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: accessory.color.toLowerCase() }}
                        />
                        <span className="text-sm">{accessory.color}</span>
                      </div>
                      <p className="text-sm"><span className="font-medium">Material:</span> {accessory.material}</p>
                      {accessory.brand && (
                        <p className="text-sm"><span className="font-medium">Brand:</span> {accessory.brand}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {accessory.occasions.map((occasion: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(accessory)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(accessory.id)}
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
              {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Accessory Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Gold Chain Necklace"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Jewelry', 'Bags', 'Watches', 'Sunglasses', 'Hats', 'Scarves', 'Belts', 'Tech Accessories'].map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
                placeholder="Describe the accessory..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material">Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData({...formData, material: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Gold', 'Silver', 'Leather', 'Fabric', 'Plastic', 'Metal', 'Wood', 'Glass', 'Crystal'].map((material) => (
                      <SelectItem key={material} value={material}>{material}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="e.g., Gold, Black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={formData.style} onValueChange={(value) => setFormData({...formData, style: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {['Classic', 'Modern', 'Vintage', 'Bohemian', 'Minimalist', 'Luxurious', 'Casual', 'Statement'].map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="e.g., Tiffany & Co., Coach"
              />
            </div>

            <div>
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Work', 'Party', 'Casual', 'Date', 'Formal', 'Beach', 'Travel', 'Evening'].map((occasion) => (
                  <Badge
                    key={occasion}
                    variant={formData.occasions.includes(occasion) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleOccasion(occasion)}
                  >
                    {occasion}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-ai-gradient hover:opacity-90">
                {editingAccessory ? 'Update' : 'Add'} Accessory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
