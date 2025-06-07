import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  personality: string;
  createdAt: string;
  generatedContent: number;
  status: 'active' | 'inactive';
  tags: string[];
  age?: number;
  lifecycle?: string;
  type?: string;
  imageUrl?: string;
  
  // Basic Information (Level 1)
  visual_only_or_full_persona?: 'visual_only' | 'full_persona';
  name_first?: string;
  name_last?: string;
  influencer_type?: 'lifestyle' | 'educational';
  sex?: 'woman' | 'man' | 'nonbinary';
  cultural_background?: string;
  age_lifestyle?: string;
  origin_birth?: string;
  origin_residence?: string;
  
  // Appearance (Level 1-2)
  hair_length?: string;
  hair_color?: string;
  hair_style?: string;
  eye_color?: string;
  lip_style?: string;
  nose_style?: string;
  face_shape?: string;
  eyebrow_style?: string;
  makeup_style?: string; // Level 2
  facial_features?: string; // Level 2
  skin_tone?: string;
  body_type?: string;
  
  // Style & Environment (Level 1-2)
  color_palette?: string[]; // Level 2, multiselect max 3
  clothing_style_everyday?: string;
  clothing_style_occasional?: string;
  clothing_style_home?: string; // Level 2
  clothing_style_sports?: string; // Level 2
  clothing_style_sexy_dress?: string; // Level 2, lifestyle only
  home_environment?: string; // Level 2
  
  // Content & Professional (Level 2)
  content_focus?: string[]; // multiselect max 4
  content_focus_areas?: string[]; // multiselect max 5
  job_area?: string;
  job_title?: string;
  job_vibe?: string;
  hobbies?: string[]; // multiselect max 5
  social_circle?: string;
  
  // Personality (Level 3)
  strengths?: string[]; // multiselect max 3
  weaknesses?: string[]; // multiselect max 2
  speech_style?: string[]; // multiselect max 4
  humor?: string[]; // multiselect max 4
  core_values?: string[]; // multiselect max 5
  current_goals?: string[]; // multiselect max 3
  background_elements?: string[]; // multiselect max 4
}

interface InfluencersState {
  influencers: Influencer[];
  selectedInfluencer: Influencer | null;
  loading: boolean;
  error: string | null;
}

const initialState: InfluencersState = {
  influencers: [
    {
      id: '1',
      name: 'Luna Sterling',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
      description: 'Fashion & Lifestyle AI Influencer',
      personality: 'Sophisticated, trendy, and inspirational',
      createdAt: '2024-01-15',
      generatedContent: 127,
      status: 'active',
      tags: ['Fashion', 'Lifestyle', 'Beauty'],
      
      // Updated with comprehensive data
      visual_only_or_full_persona: 'full_persona',
      name_first: 'Luna',
      name_last: 'Sterling',
      influencer_type: 'lifestyle',
      sex: 'woman',
      cultural_background: 'North American',
      age_lifestyle: '25, Fashion Influencer',
      origin_birth: 'New York',
      origin_residence: 'Los Angeles',
      
      hair_length: 'Long',
      hair_color: 'Blonde',
      hair_style: 'Wavy',
      eye_color: 'Blue',
      lip_style: 'Natural',
      nose_style: 'Natural',
      face_shape: 'Oval',
      eyebrow_style: 'Natural Arch',
      makeup_style: 'Natural Glam',
      facial_features: 'Defined Cheekbones',
      skin_tone: 'Fair',
      body_type: 'Athletic',
      
      color_palette: ['Neutral', 'Pastels', 'Earth Tones'],
      clothing_style_everyday: 'Chic Casual',
      clothing_style_occasional: 'Elegant',
      clothing_style_home: 'Comfortable Chic',
      clothing_style_sports: 'Athleisure',
      clothing_style_sexy_dress: 'Sophisticated',
      home_environment: 'Modern Minimalist',
      
      content_focus: ['Fashion', 'Lifestyle', 'Beauty', 'Travel'],
      content_focus_areas: ['Style Tips', 'Daily Routines', 'Beauty Reviews', 'Travel Vlogs', 'Fashion Hauls'],
      job_area: 'Creative',
      job_title: 'Fashion Influencer',
      job_vibe: 'Creative',
      hobbies: ['Photography', 'Shopping', 'Travel', 'Yoga', 'Art'],
      social_circle: 'Fashion industry professionals and creatives',
      
      strengths: ['Creative', 'Charismatic', 'Trend-aware'],
      weaknesses: ['Perfectionist', 'Overthinking'],
      speech_style: ['Friendly', 'Inspirational', 'Trendy', 'Confident'],
      humor: ['Light', 'Witty', 'Self-deprecating', 'Playful'],
      core_values: ['Authenticity', 'Creativity', 'Self-expression', 'Inclusivity', 'Quality'],
      current_goals: ['Grow following', 'Brand collaborations', 'Launch own line'],
      background_elements: ['Fashion school graduate', 'Former retail experience', 'Art background', 'Travel enthusiast']
    },
    {
      id: '2',
      name: 'Alex Nova',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
      description: 'Tech & Innovation Enthusiast',
      personality: 'Tech-savvy, forward-thinking, and educational',
      createdAt: '2024-02-03',
      generatedContent: 89,
      status: 'active',
      tags: ['Technology', 'Innovation', 'Education'],
      
      visual_only_or_full_persona: 'full_persona',
      name_first: 'Alex',
      name_last: 'Nova',
      influencer_type: 'educational',
      sex: 'man',
      cultural_background: 'North American',
      age_lifestyle: '28, Tech Professional',
      origin_birth: 'San Francisco',
      origin_residence: 'Seattle',
      
      hair_length: 'Short',
      hair_color: 'Brown',
      hair_style: 'Modern',
      eye_color: 'Brown',
      lip_style: 'Natural',
      nose_style: 'Natural',
      face_shape: 'Square',
      eyebrow_style: 'Natural',
      facial_features: 'Strong Jawline',
      skin_tone: 'Medium',
      body_type: 'Average',
      
      color_palette: ['Modern', 'Tech Blues'],
      clothing_style_everyday: 'Smart Casual',
      clothing_style_occasional: 'Business Casual',
      clothing_style_home: 'Casual',
      clothing_style_sports: 'Athletic',
      home_environment: 'Tech Modern',
      
      content_focus: ['Technology', 'Innovation', 'Education', 'Reviews'],
      content_focus_areas: ['Tech Reviews', 'Tutorials', 'Industry News', 'Gadget Unboxing', 'Career Advice'],
      job_area: 'Technology',
      job_title: 'Tech Educator',
      job_vibe: 'Professional',
      hobbies: ['Coding', 'Gaming', 'Reading', 'Podcasting', 'Gadgets'],
      social_circle: 'Tech professionals and developers',
      
      strengths: ['Analytical', 'Knowledgeable', 'Clear Communicator'],
      weaknesses: ['Technical Jargon', 'Impatient'],
      speech_style: ['Educational', 'Clear', 'Enthusiastic', 'Professional'],
      humor: ['Geeky', 'Dry', 'Clever', 'Tech Puns'],
      core_values: ['Innovation', 'Education', 'Accessibility', 'Progress', 'Transparency'],
      current_goals: ['Tech education', 'Build community', 'Industry recognition'],
      background_elements: ['Computer Science degree', 'Software developer', 'Tech startup experience', 'Open source contributor']
    }
  ],
  selectedInfluencer: null,
  loading: false,
  error: null,
};

const influencersSlice = createSlice({
  name: 'influencers',
  initialState,
  reducers: {
    setInfluencers: (state, action: PayloadAction<Influencer[]>) => {
      state.influencers = action.payload;
    },
    addInfluencer: (state, action: PayloadAction<Influencer>) => {
      state.influencers.push(action.payload);
    },
    selectInfluencer: (state, action: PayloadAction<string>) => {
      state.selectedInfluencer = state.influencers.find(inf => inf.id === action.payload) || null;
    },
    updateInfluencer: (state, action: PayloadAction<Partial<Influencer> & { id: string }>) => {
      const index = state.influencers.findIndex(inf => inf.id === action.payload.id);
      if (index !== -1) {
        state.influencers[index] = { ...state.influencers[index], ...action.payload };
        
        // Update selected influencer if it's the one being updated
        if (state.selectedInfluencer?.id === action.payload.id) {
          state.selectedInfluencer = { ...state.selectedInfluencer, ...action.payload };
        }
      }
    },
    deleteInfluencer: (state, action: PayloadAction<string>) => {
      state.influencers = state.influencers.filter(inf => inf.id !== action.payload);
      if (state.selectedInfluencer?.id === action.payload) {
        state.selectedInfluencer = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSelectedInfluencer: (state) => {
      state.selectedInfluencer = null;
    },
  },
});

export const { 
  setInfluencers, 
  addInfluencer, 
  selectInfluencer, 
  updateInfluencer, 
  deleteInfluencer,
  setLoading, 
  setError,
  clearSelectedInfluencer
} = influencersSlice.actions;

export default influencersSlice.reducer;