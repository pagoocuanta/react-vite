-- Migration: Create team_members table
-- This table stores team member information displayed in preboarding

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    bio TEXT,
    avatar VARCHAR,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view team members
CREATE POLICY "Everyone can view team members" 
    ON public.team_members 
    FOR SELECT 
    USING (true);

-- Admins can manage team members
CREATE POLICY "Admins can manage team members" 
    ON public.team_members 
    FOR ALL 
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_members_updated_at();

-- Insert default team members
INSERT INTO public.team_members (name, role, department, email, phone, location, bio, display_order) VALUES
    ('Sarah van der Berg', 'Team Lead', 'Operations', 'sarah.vdberg@company.nl', '+31 6 1234 5678', 'Amsterdam HQ', 'Sarah leidt het operations team en is je eerste aanspreekpunt voor vragen.', 1),
    ('Mark de Vries', 'Senior Developer', 'Engineering', 'mark.devries@company.nl', '+31 6 2345 6789', 'Amsterdam HQ', 'Mark helpt je met alle technische onboarding en systeemtoegang.', 2),
    ('Lisa Jansen', 'HR Specialist', 'Human Resources', 'lisa.jansen@company.nl', '+31 6 3456 7890', 'Amsterdam HQ', 'Lisa verzorgt je administratieve onboarding en praktische zaken.', 3);
