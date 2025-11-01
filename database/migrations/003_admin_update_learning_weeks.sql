-- Migration: Add admin update policy for learning_weeks
-- Run this migration in your Supabase SQL Editor

-- Allow admins to update learning weeks
CREATE POLICY "Admins can update learning weeks" ON public.learning_weeks 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
