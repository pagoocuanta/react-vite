-- Migration: Create preboarding_progress table
-- This table tracks user progress on preboarding tiles

CREATE TABLE IF NOT EXISTS public.preboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tile_id UUID REFERENCES public.preboarding_tiles(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tile_id)
);

-- Enable Row Level Security
ALTER TABLE public.preboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own progress
CREATE POLICY "Users can view their own preboarding progress" 
    ON public.preboarding_progress 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own preboarding progress" 
    ON public.preboarding_progress 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all preboarding progress" 
    ON public.preboarding_progress 
    FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_preboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_preboarding_progress_updated_at
    BEFORE UPDATE ON public.preboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_preboarding_progress_updated_at();
