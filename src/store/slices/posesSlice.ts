
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Pose {
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

interface PosesState {
  poses: Pose[];
  loading: boolean;
  error: string | null;
}

const initialState: PosesState = {
  poses: [
    {
      id: '1',
      name: 'Classic Portrait',
      category: 'Portrait',
      description: 'Traditional headshot with direct eye contact',
      difficulty: 'Beginner',
      bodyPart: 'Face/Head',
      mood: 'Serious & Professional',
      props: [],
      instructions: 'Look directly at camera, slight smile, shoulders relaxed'
    },
    {
      id: '2',
      name: 'Coffee Shop Casual',
      category: 'Lifestyle',
      description: 'Relaxed pose with coffee cup in hand',
      difficulty: 'Beginner',
      bodyPart: 'Upper Body',
      mood: 'Relaxed & Casual',
      props: ['Coffee Cup'],
      instructions: 'Hold coffee cup naturally, look slightly away from camera, genuine smile'
    },
    {
      id: '3',
      name: 'Fashion Forward',
      category: 'Fashion',
      description: 'Dynamic fashion pose with attitude',
      difficulty: 'Intermediate',
      bodyPart: 'Full Body',
      mood: 'Dramatic & Intense',
      props: [],
      instructions: 'Strong stance, one hand on hip, confident expression, chin slightly up'
    }
  ],
  loading: false,
  error: null,
};

const posesSlice = createSlice({
  name: 'poses',
  initialState,
  reducers: {
    addPose: (state, action: PayloadAction<Pose>) => {
      state.poses.push(action.payload);
    },
    updatePose: (state, action: PayloadAction<Pose>) => {
      const index = state.poses.findIndex(pose => pose.id === action.payload.id);
      if (index !== -1) {
        state.poses[index] = action.payload;
      }
    },
    deletePose: (state, action: PayloadAction<string>) => {
      state.poses = state.poses.filter(pose => pose.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  addPose, 
  updatePose, 
  deletePose, 
  setLoading, 
  setError 
} = posesSlice.actions;

export default posesSlice.reducer;
