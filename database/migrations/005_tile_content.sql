-- Migration: Create tile_content table for preboarding tile content
-- Run this migration in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.tile_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tile_id UUID REFERENCES public.preboarding_tiles(id) ON DELETE CASCADE,
    content_type VARCHAR DEFAULT 'rich_text',
    content JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tile_id)
);

-- Enable Row Level Security
ALTER TABLE public.tile_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view tile content" ON public.tile_content;
DROP POLICY IF EXISTS "Admins can manage tile content" ON public.tile_content;

-- RLS Policies
-- All authenticated users can view tile content
CREATE POLICY "Users can view tile content" ON public.tile_content 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage all tile content (insert, update, delete)
CREATE POLICY "Admins can manage tile content" ON public.tile_content 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_tile_content_updated_at 
    BEFORE UPDATE ON public.tile_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
