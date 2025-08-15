import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Influencer {
  id: string;
  user_id: string;
  image_url: string;
  influencer_type: string;
  name_first: string;
  name_last: string;
  visual_only: boolean;
  sex: string;
  age_lifestyle: string;
  origin_birth: string;
  origin_residence: string;
  cultural_background: string;
  hair_length: string;
  hair_color: string;
  hair_style: string;
  eye_color: string;
  lip_style: string;
  nose_style: string;
  eyebrow_style: string;
  face_shape: string;
  facial_features: string;
  bust_size: string;
  skin_tone: string;
  body_type: string;
  color_palette: string[];
  clothing_style_everyday: string;
  clothing_style_occasional: string;
  clothing_style_home: string;
  clothing_style_sports: string;
  clothing_style_sexy_dress: string;
  home_environment: string;
  content_focus: string[];
  content_focus_areas: string[];
  job_area: string;
  job_title: string;
  job_vibe: string;
  hobbies: string[];
  social_circle: string;
  strengths: string[];
  weaknesses: string[];
  speech_style: string[];
  humor: string[];
  core_values: string[];
  current_goals: string[];
  background_elements: string[];
  prompt: string;
  notes: string;
  created_at: string;
  updated_at: string;
  image_num: number;
  age: string;
  lifestyle: string;
  eye_shape: string;
  lorastatus: number; // 0 = none, 1 = creating, 2 = successful, 9 = needs re-creation
  bio?: any; // jsonb bio field from API
  template_pro?: boolean; // true for pro templates, false for free templates
  // Integration fields
  elevenlabs_apikey?: string; // Bring your own key
  elevenlabs_voiceid?: string; // Shareable Voice ID from Elevenlabs
  use_fanvue_api?: boolean; // Shall this Influencer be connected to Fanvue
  fanvue_api_key?: string; // API Key of this Influencer on Fanvue
  show_on_dashboard?: boolean; // Shall this Influencer be part of your dashboard
}

interface InfluencersState {
  influencers: Influencer[];
  loading: boolean;
  error: string | null;
}

const initialState: InfluencersState = {
  influencers: [],
  loading: false,
  error: null
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
    updateInfluencer: (state, action: PayloadAction<Influencer>) => {
      const index = state.influencers.findIndex(inf => inf.id === action.payload.id);
      if (index !== -1) {
        state.influencers[index] = action.payload;
      }
    },
    deleteInfluencer: (state, action: PayloadAction<string>) => {
      state.influencers = state.influencers.filter(inf => inf.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Utility functions for date handling
export const parseDate = (dateString: string | null | undefined): number => {
  if (!dateString) return 0;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return 0;
  }
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Unknown';
  }
};

// Selector functions for sorted influencers
export const selectLatestTrainedInfluencer = (state: { influencers: InfluencersState }) => {
  const { influencers } = state.influencers;
  const trainedInfluencers = [...influencers].filter(inf => inf.lorastatus === 2);
  
  if (trainedInfluencers.length === 0) return null;
  
  return trainedInfluencers.sort((a, b) => {
    const dateA = parseDate(a.created_at);
    const dateB = parseDate(b.created_at);
    
    // If created_at is not available, fallback to updated_at
    if (dateA === 0 && dateB === 0) {
      const updatedA = parseDate(a.updated_at);
      const updatedB = parseDate(b.updated_at);
      return updatedB - updatedA;
    }
    
    return dateB - dateA;
  })[0];
};

export const selectLatestGeneratedInfluencer = (state: { influencers: InfluencersState }) => {
  const { influencers } = state.influencers;
  
  if (influencers.length === 0) return null;
  
  return [...influencers].sort((a, b) => {
    const dateA = parseDate(a.created_at);
    const dateB = parseDate(b.created_at);
    
    // If created_at is not available, fallback to updated_at
    if (dateA === 0 && dateB === 0) {
      const updatedA = parseDate(a.updated_at);
      const updatedB = parseDate(b.updated_at);
      return updatedB - updatedA;
    }
    
    return dateB - dateA;
  })[0];
};

export const selectInfluencersSortedByDate = (state: { influencers: InfluencersState }) => {
  const { influencers } = state.influencers;
  
  return [...influencers].sort((a, b) => {
    const dateA = parseDate(a.created_at);
    const dateB = parseDate(b.created_at);
    
    // If created_at is not available, fallback to updated_at
    if (dateA === 0 && dateB === 0) {
      const updatedA = parseDate(a.updated_at);
      const updatedB = parseDate(b.updated_at);
      return updatedB - updatedA;
    }
    
    return dateB - dateA;
  });
};

export const { 
  setInfluencers, 
  addInfluencer, 
  updateInfluencer, 
  deleteInfluencer,
  setLoading,
  setError
} = influencersSlice.actions;

export default influencersSlice.reducer;