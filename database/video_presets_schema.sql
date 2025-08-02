-- Video Presets Database Schema
-- This table stores video generation presets for users

CREATE TABLE IF NOT EXISTS video_presets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Video generation settings
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    video_model VARCHAR(100) NOT NULL, -- Video generation model/engine
    resolution VARCHAR(50) NOT NULL, -- Video resolution (720p, 1080p, 480p, etc.)
    video_length INTEGER NOT NULL, -- Video duration in seconds
    seed INTEGER, -- Random seed for generation
    influencer_image TEXT, -- Influencer image URL
    preset_image TEXT, -- Preset image URL (selected image for the preset)
    
    -- Metadata
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    favorite BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT video_presets_name_not_empty CHECK (name != ''),
    CONSTRAINT video_presets_user_id_not_null CHECK (user_id IS NOT NULL),
    CONSTRAINT video_presets_prompt_not_empty CHECK (prompt != ''),
    CONSTRAINT video_presets_video_model_not_empty CHECK (video_model != ''),
    CONSTRAINT video_presets_resolution_not_empty CHECK (resolution != ''),
    CONSTRAINT video_presets_video_length_positive CHECK (video_length > 0),
    CONSTRAINT video_presets_video_length_max CHECK (video_length <= 300) -- Max 5 minutes
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_presets_user_id ON video_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_video_presets_created_at ON video_presets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_presets_favorite ON video_presets(favorite);
CREATE INDEX IF NOT EXISTS idx_video_presets_rating ON video_presets(rating);
CREATE INDEX IF NOT EXISTS idx_video_presets_video_model ON video_presets(video_model);
CREATE INDEX IF NOT EXISTS idx_video_presets_resolution ON video_presets(resolution);
CREATE INDEX IF NOT EXISTS idx_video_presets_video_length ON video_presets(video_length);

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
COMMENT ON TABLE video_presets IS 'Stores video generation presets for users with essential video generation parameters';
COMMENT ON COLUMN video_presets.prompt IS 'Main prompt describing what to generate in the video';
COMMENT ON COLUMN video_presets.negative_prompt IS 'Negative prompt describing what NOT to include in the video';
COMMENT ON COLUMN video_presets.video_model IS 'Video generation model/engine (e.g., kling-v2.1, seedance-1-pro)';
COMMENT ON COLUMN video_presets.resolution IS 'Video resolution (e.g., 720p, 1080p, 480p)';
COMMENT ON COLUMN video_presets.video_length IS 'Video duration in seconds';
COMMENT ON COLUMN video_presets.seed IS 'Random seed for reproducible generation';
COMMENT ON COLUMN video_presets.influencer_image IS 'URL to the influencer image used for video generation';
COMMENT ON COLUMN video_presets.preset_image IS 'URL to the preset image (selected image for the preset)';
COMMENT ON COLUMN video_presets.rating IS 'User rating from 1-5 stars';
COMMENT ON COLUMN video_presets.favorite IS 'Whether the preset is marked as favorite by the user'; 