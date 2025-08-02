-- Video Presets Database Schema
-- This table stores video generation presets for users

CREATE TABLE IF NOT EXISTS video_presets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    route VARCHAR(500) DEFAULT '', -- Folder path for organization
    video_name VARCHAR(255) DEFAULT '', -- Associated video file name
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    favorite BOOLEAN DEFAULT FALSE,
    
    -- Video generation settings
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model VARCHAR(100) NOT NULL, -- Video generation model/engine
    resolution VARCHAR(50) NOT NULL, -- Video resolution (720p, 1080p, 480p, etc.)
    video_length INTEGER NOT NULL, -- Video duration in seconds
    seed INTEGER, -- Random seed for generation
    start_image TEXT, -- Start image URL or path
    start_image_url TEXT, -- Full start image URL
    
    -- Additional video settings
    fps INTEGER DEFAULT 24,
    motion_strength DECIMAL(3,2) DEFAULT 0.8,
    camera_movement VARCHAR(50) DEFAULT 'static',
    transition_type VARCHAR(50) DEFAULT 'fade',
    guidance DECIMAL(3,2) DEFAULT 3.5,
    nsfw_strength INTEGER DEFAULT 0,
    lora_strength DECIMAL(3,2) DEFAULT 1.0,
    quality VARCHAR(50) DEFAULT 'Quality',
    mode VARCHAR(50) DEFAULT 'standard',
    use_prompt_only BOOLEAN DEFAULT FALSE,
    
    -- Model data (influencer or custom model)
    model_data JSONB, -- Store influencer or custom model data
    
    -- Scene specifications
    scene_framing VARCHAR(100),
    scene_rotation VARCHAR(100),
    scene_lighting_preset VARCHAR(100),
    scene_setting VARCHAR(100),
    scene_pose VARCHAR(100),
    scene_clothes VARCHAR(100),
    
    -- Model description (detailed model specifications)
    model_appearance TEXT,
    model_cultural_background VARCHAR(100),
    model_body_type VARCHAR(100),
    model_facial_features TEXT,
    model_hair_color VARCHAR(50),
    model_hair_length VARCHAR(50),
    model_hair_style VARCHAR(100),
    model_skin VARCHAR(100),
    model_lips VARCHAR(100),
    model_eyes VARCHAR(100),
    model_nose VARCHAR(100),
    model_makeup VARCHAR(100),
    model_bust VARCHAR(50),
    model_clothing TEXT,
    model_sex VARCHAR(20),
    model_eyebrow_style VARCHAR(100),
    model_face_shape VARCHAR(100),
    model_color_palette TEXT,
    model_age VARCHAR(50),
    model_lifestyle VARCHAR(100),
    
    -- Additional settings
    lora BOOLEAN DEFAULT FALSE,
    no_ai BOOLEAN DEFAULT TRUE,
    regenerated_from VARCHAR(255),
    
    -- Metadata
    tags TEXT[],
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT video_presets_name_not_empty CHECK (name != ''),
    CONSTRAINT video_presets_user_id_not_null CHECK (user_id IS NOT NULL),
    CONSTRAINT video_presets_prompt_not_empty CHECK (prompt != ''),
    CONSTRAINT video_presets_model_not_empty CHECK (model != ''),
    CONSTRAINT video_presets_resolution_not_empty CHECK (resolution != ''),
    CONSTRAINT video_presets_video_length_positive CHECK (video_length > 0),
    CONSTRAINT video_presets_video_length_max CHECK (video_length <= 300), -- Max 5 minutes
    CONSTRAINT video_presets_fps_range CHECK (fps >= 1 AND fps <= 60),
    CONSTRAINT video_presets_motion_strength_range CHECK (motion_strength >= 0 AND motion_strength <= 1),
    CONSTRAINT video_presets_guidance_range CHECK (guidance >= 0 AND guidance <= 20),
    CONSTRAINT video_presets_nsfw_strength_range CHECK (nsfw_strength >= 0 AND nsfw_strength <= 100),
    CONSTRAINT video_presets_lora_strength_range CHECK (lora_strength >= 0 AND lora_strength <= 2)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_presets_user_id ON video_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_video_presets_created_at ON video_presets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_presets_route ON video_presets(route);
CREATE INDEX IF NOT EXISTS idx_video_presets_favorite ON video_presets(favorite);
CREATE INDEX IF NOT EXISTS idx_video_presets_rating ON video_presets(rating);
CREATE INDEX IF NOT EXISTS idx_video_presets_model ON video_presets(model);
CREATE INDEX IF NOT EXISTS idx_video_presets_resolution ON video_presets(resolution);
CREATE INDEX IF NOT EXISTS idx_video_presets_video_length ON video_presets(video_length);
CREATE INDEX IF NOT EXISTS idx_video_presets_model_data_gin ON video_presets USING GIN (model_data);

-- Enable Row Level Security (RLS)
ALTER TABLE video_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own video presets" ON video_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video presets" ON video_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video presets" ON video_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video presets" ON video_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_video_presets_updated_at
    BEFORE UPDATE ON video_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_video_presets_updated_at();

-- Comments
COMMENT ON TABLE video_presets IS 'Stores video generation presets for users with specific video generation parameters';
COMMENT ON COLUMN video_presets.prompt IS 'Main prompt describing what to generate in the video';
COMMENT ON COLUMN video_presets.negative_prompt IS 'Negative prompt describing what NOT to include in the video';
COMMENT ON COLUMN video_presets.model IS 'Video generation model/engine (e.g., kling-v2.1, seedance-1-pro)';
COMMENT ON COLUMN video_presets.resolution IS 'Video resolution (e.g., 720p, 1080p, 480p)';
COMMENT ON COLUMN video_presets.video_length IS 'Video duration in seconds';
COMMENT ON COLUMN video_presets.seed IS 'Random seed for reproducible generation';
COMMENT ON COLUMN video_presets.start_image IS 'Start image filename or identifier';
COMMENT ON COLUMN video_presets.start_image_url IS 'Full URL to the start image';
COMMENT ON COLUMN video_presets.model_data IS 'JSON object containing influencer or custom model data';
COMMENT ON COLUMN video_presets.route IS 'Folder path for organizing presets in a hierarchical structure';
COMMENT ON COLUMN video_presets.video_name IS 'Associated video file name if preset includes a sample video';
COMMENT ON COLUMN video_presets.rating IS 'User rating from 1-5 stars';
COMMENT ON COLUMN video_presets.favorite IS 'Whether the preset is marked as favorite by the user';
COMMENT ON COLUMN video_presets.tags IS 'Array of tags for categorizing presets';
COMMENT ON COLUMN video_presets.category IS 'Category for organizing presets';
COMMENT ON COLUMN video_presets.is_public IS 'Whether the preset is publicly accessible to other users'; 