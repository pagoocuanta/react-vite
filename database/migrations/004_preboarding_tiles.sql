-- Migration: Create preboarding_tiles table
-- This table stores the editable tiles shown on the preboarding page

CREATE TABLE public.preboarding_tiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tile_order INTEGER UNIQUE NOT NULL,
    tile_id VARCHAR UNIQUE NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.preboarding_tiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- All authenticated users can view preboarding tiles
CREATE POLICY "Users can view preboarding tiles" ON public.preboarding_tiles 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can update preboarding tiles
CREATE POLICY "Admins can update preboarding tiles" ON public.preboarding_tiles 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Add trigger for updated_at
CREATE TRIGGER update_preboarding_tiles_updated_at 
    BEFORE UPDATE ON public.preboarding_tiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default preboarding tiles
INSERT INTO public.preboarding_tiles (tile_order, tile_id, title, description, icon, color) VALUES
    (1, 'team', 'Kennismaking met het team', 'Bekijk wie jouw eerste collega''s zijn (1-4 personen)', 'Users', 'from-blue-500 to-indigo-600'),
    (2, 'safety', 'Veiligheid en praktische afspraken', 'Lees de huisregels, werktijden en praktische info', 'Shield', 'from-green-500 to-emerald-600'),
    (3, 'day1', 'Planning van dag 1', 'Bekijk wat je kunt verwachten op je eerste werkdag', 'Calendar', 'from-purple-500 to-violet-600');
