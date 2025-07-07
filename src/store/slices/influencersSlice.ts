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

export const { 
  setInfluencers, 
  addInfluencer, 
  updateInfluencer, 
  deleteInfluencer,
  setLoading,
  setError
} = influencersSlice.actions;

export default influencersSlice.reducer;