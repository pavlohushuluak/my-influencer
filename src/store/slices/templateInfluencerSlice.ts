import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface TemplateInfluencer {
    id: string;
    user_id: string;
    image_url: string;
    name_first: string;
    name_last: string;
    influencer_type: string;
    visual_only: boolean;
    sex: string;
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
    makeup_style: string;
    skin_tone: string;
    body_type: string;
    color_palette: string[];
    clothing_style_everyday: string;
    clothing_style_occasional: string;
    clothing_style_home: string;
    clothing_style_sports: string;
    clothing_style_sexy_dress: string;
    home_environment: string;
    age_lifestyle: string;
    origin_birth: string;
    origin_residence: string;
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
}

interface TemplateInfluencerState {
    templates: TemplateInfluencer[];
    loading: boolean;
    error: string | null;
}

const initialState: TemplateInfluencerState = {
    templates: [],
    loading: false,
    error: null
};

export const fetchTemplateInfluencers = createAsyncThunk(
    'templateInfluencer/fetchAll',
    async () => {
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.template`, {
            headers: {
                'Authorization': 'Bearer WeInfl3nc3withAI'
            }
        });

        const data = await response.json();
        return data;
    }
);

const templateInfluencerSlice = createSlice({
    name: 'templateInfluencer',
    initialState,
    reducers: {
        setTemplates: (state, action: PayloadAction<TemplateInfluencer[]>) => {
            state.templates = action.payload;
        },
        clearTemplates: (state) => {
            state.templates = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTemplateInfluencers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTemplateInfluencers.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            })
            .addCase(fetchTemplateInfluencers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch template influencers';
            });
    }
});

export const { setTemplates, clearTemplates } = templateInfluencerSlice.actions;
export default templateInfluencerSlice.reducer; 