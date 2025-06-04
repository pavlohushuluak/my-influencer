import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addPose, updatePose, deletePose } from '@/store/slices/posesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Plus, Edit, Trash2 } from 'lucide-react';

interface Pose {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  bodyPart: string;
  mood: string;
  props: string[];
  instructions: string;
  image?: string;
}

const POSE_CATEGORIES = [
  'Portrait', 'Full Body', 'Lifestyle', 'Fashion', 'Action', 'Group', 'Artistic'
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const BODY_PARTS = [
  'Face/Head', 'Upper Body', 'Full Body', 'Hands', 'Legs', 'Profile'
];

const MOODS = [
  'Happy & Energetic', 'Serious & Professional', 'Relaxed & Casual', 'Dramatic & Intense', 'Playful & Fun'
];

export default function Poses() {
  const dispatch = useDispatch();
  const { poses } = useSelector((state: RootState) => state.poses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPose, setEditingPose] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    difficulty: '',
    bodyPart: '',
    mood: '',
    props: [] as string[],
    instructions: ''
  });

  const [propInput, setPropInput] = useState('');

  const handleAddNew = () => {
    setEditingPose(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      difficulty: '',
      bodyPart: '',
      mood: '',
      props: [],
      instructions: ''
    });
    setPropInput('');
    setShowAddModal(true);
  };

  const handleEdit = (pose: any) => {
    setEditingPose(pose);
    setFormData({
      name: pose.name,
      category: pose.category,
      description: pose.description,
      difficulty: pose.difficulty,
      bodyPart: pose.bodyPart,
      mood: pose.mood,
      props: pose.props,
      instructions: pose.instructions
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    const newPose = {
      id: editingPose?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      difficulty: formData.difficulty,
      bodyPart: formData.bodyPart,
      mood: formData.mood,
      props: formData.props,
      instructions: formData.instructions
    };

    if (editingPose) {
      dispatch(updatePose(newPose));
    } else {
      dispatch(addPose(newPose));
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    dispatch(deletePose(id));
  };

  const addProp = () => {
    if (propInput.trim() && !formData.props.includes(propInput.trim())) {
      setFormData(prev => ({
        ...prev,
        props: [...prev.props, propInput.trim()]
      }));
      setPropInput('');
    }
  };

  const removeProp = (propToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      props: prev.props.filter(prop => prop !== propToRemove)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Pose Library
          </h1>
          <p className="text-muted-foreground">
            Manage poses and positioning guides for your content
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-ai-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Pose
        </Button>
      </div>

      {/* Poses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {poses.map((pose) => (
          <Card key={pose.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                  {pose.image ? (
                    <img src={pose.image} alt={pose.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <User className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{pose.name}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{pose.category}</Badge>
                      <Badge className={getDifficultyColor(pose.difficulty)}>
                        {pose.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pose.description}</p>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Focus:</span> {pose.bodyPart}</p>
                      <p className="text-sm"><span className="font-medium">Mood:</span> {pose.mood}</p>
                    </div>
                    {pose.props.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Props needed:</p>
                        <div className="flex flex-wrap gap-1">
                          {pose.props.map((prop: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-1">Instructions:</p>
                      <p className="text-xs text-muted-foreground">{pose.instructions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(pose)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(pose.id)}
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
              {editingPose ? 'Edit Pose' : 'Add New Pose'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Pose Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Classic Portrait"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Portrait', 'Full Body', 'Lifestyle', 'Fashion', 'Action', 'Group', 'Artistic'].map((category) => (
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
                placeholder="Brief description of the pose..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bodyPart">Body Part Focus</Label>
              <Select value={formData.bodyPart} onValueChange={(value) => setFormData({...formData, bodyPart: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {['Face/Head', 'Upper Body', 'Full Body', 'Hands', 'Legs', 'Profile'].map((part) => (
                    <SelectItem key={part} value={part}>{part}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={formData.mood} onValueChange={(value) => setFormData({...formData, mood: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {['Happy & Energetic', 'Serious & Professional', 'Relaxed & Casual', 'Dramatic & Intense', 'Playful & Fun'].map((mood) => (
                    <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Props (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={propInput}
                  onChange={(e) => setPropInput(e.target.value)}
                  placeholder="Add a prop..."
                  onKeyPress={(e) => e.key === 'Enter' && addProp()}
                />
                <Button type="button" onClick={addProp} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.props.map((prop, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeProp(prop)}
                  >
                    {prop} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Detailed instructions for the pose..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-ai-gradient hover:opacity-90">
                {editingPose ? 'Update' : 'Add'} Pose
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
