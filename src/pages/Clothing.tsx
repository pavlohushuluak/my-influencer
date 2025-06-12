import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addClothingItem, updateClothingItem, deleteClothingItem } from '@/store/slices/clothingSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shirt, Plus, Edit, Trash2 } from 'lucide-react';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  style: string;
  color: string;
  season: string;
  occasions: string[];
  image?: string;
}

const CLOTHING_CATEGORIES = [
  'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes', 'Underwear'
];

const CLOTHING_STYLES = [
  'Casual', 'Formal', 'Business', 'Party', 'Athletic', 'Vintage', 'Bohemian', 'Minimalist'
];

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
const OCCASIONS = ['Work', 'Party', 'Casual', 'Date', 'Sport', 'Beach', 'Travel'];

export default function Clothing() {
  const dispatch = useDispatch();
  const { items: clothingItems } = useSelector((state: RootState) => state.clothing);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    style: '',
    color: '',
    season: '',
    occasions: [] as string[]
  });

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      style: '',
      color: '',
      season: '',
      occasions: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      style: item.style,
      color: item.color,
      season: item.season,
      occasions: item.occasions
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    const newItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      style: formData.style,
      color: formData.color,
      season: formData.season,
      occasions: formData.occasions
    };

    if (editingItem) {
      dispatch(updateClothingItem(newItem));
    } else {
      dispatch(addClothingItem(newItem));
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteClothingItem(id));
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
            Clothing Library
          </h1>
          <p className="text-muted-foreground">
            Manage your influencer's wardrobe and clothing styles
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-ai-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Clothing
        </Button>
      </div>

      {/* Clothing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clothingItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Shirt className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <div className="space-y-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="secondary">{item.style}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Color:</span>
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.color.toLowerCase() }}
                      />
                      <span className="text-sm">{item.color}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Season: {item.season}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.occasions.map((occasion: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(item)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(item.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Clothing Item' : 'Add New Clothing Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., White Cotton T-Shirt"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes', 'Underwear'].map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={formData.style} onValueChange={(value) => setFormData({...formData, style: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {['Casual', 'Formal', 'Business', 'Party', 'Athletic', 'Vintage', 'Bohemian', 'Minimalist'].map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
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
                placeholder="e.g., White, Blue, Red"
              />
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {['Spring', 'Summer', 'Fall', 'Winter', 'All Season'].map((season) => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Work', 'Party', 'Casual', 'Date', 'Sport', 'Beach', 'Travel'].map((occasion) => (
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
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
