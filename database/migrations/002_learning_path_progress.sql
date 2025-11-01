-- Learning Path Progress Tables
-- Run this migration in your Supabase SQL Editor

-- Learning weeks configuration table
CREATE TABLE public.learning_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_number INTEGER UNIQUE NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    duration VARCHAR NOT NULL,
    level VARCHAR CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    color VARCHAR NOT NULL,
    prerequisites INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Array of week_numbers that must be completed first
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User learning progress table
CREATE TABLE public.user_learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    week_id UUID REFERENCES public.learning_weeks(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    status VARCHAR CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')) DEFAULT 'locked',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER, -- Quiz score if applicable
    time_spent INTEGER, -- Minutes spent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_id)
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    week_id UUID REFERENCES public.learning_weeks(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    answers JSONB DEFAULT '{}', -- Store user answers
    duration INTEGER, -- Time taken in seconds
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX idx_user_learning_progress_week_id ON public.user_learning_progress(week_id);
CREATE INDEX idx_user_learning_progress_status ON public.user_learning_progress(user_id, status);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_week_id ON public.quiz_attempts(week_id);

-- Enable Row Level Security
ALTER TABLE public.learning_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Learning weeks are visible to all authenticated users
CREATE POLICY "Users can view learning weeks" ON public.learning_weeks 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only view their own progress
CREATE POLICY "Users can view own progress" ON public.user_learning_progress 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON public.user_learning_progress 
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON public.user_learning_progress 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON public.user_learning_progress 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can view all quiz attempts" ON public.quiz_attempts 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Add trigger for updated_at
CREATE TRIGGER update_learning_weeks_updated_at 
    BEFORE UPDATE ON public.learning_weeks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at 
    BEFORE UPDATE ON public.user_learning_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default learning weeks
INSERT INTO public.learning_weeks (week_number, title, description, duration, level, color, prerequisites) VALUES
    (1, 'Week 1: Kennismaken & oefenen', 'Leer de fundamenten van effectieve onboarding en belangrijke concepten', '8 min', 'Beginner', 'from-blue-500 to-indigo-600', ARRAY[]::INTEGER[]),
    (2, 'Week 2: Zelfstandig aan de slag', 'Beheers teamdynamiek en communicatiestrategieën', '7 min', 'Beginner', 'from-green-500 to-emerald-600', ARRAY[1]),
    (3, 'Week 3: Proces Optimalisatie', 'Stroomlijn workflows en verbeter efficiëntie', '8 min', 'Intermediate', 'from-orange-500 to-red-600', ARRAY[1, 2]),
    (4, 'Week 4: Klantsucces', 'Bouw duurzame relaties met klanten', '8 min', 'Intermediate', 'from-purple-500 to-pink-600', ARRAY[1, 2, 3]),
    (5, 'Week 5: Leiderschapsvaardigheden', 'Ontwikkel je leiderschapscapaciteiten', '10 min', 'Advanced', 'from-amber-500 to-yellow-600', ARRAY[1, 2, 3, 4]),
    (6, 'Week 6: Digitale Tools Beheersing', 'Navigeer door moderne werkplektechnologie', '8 min', 'Intermediate', 'from-cyan-500 to-blue-600', ARRAY[1, 2, 3, 4, 5]);

-- Function to initialize user progress when a new user is created
CREATE OR REPLACE FUNCTION initialize_user_learning_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert progress records for all weeks, only week 1 is unlocked by default
    INSERT INTO public.user_learning_progress (user_id, week_id, week_number, status)
    SELECT 
        NEW.id,
        lw.id,
        lw.week_number,
        CASE WHEN lw.week_number = 1 THEN 'unlocked' ELSE 'locked' END
    FROM public.learning_weeks lw;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize progress for new users
CREATE TRIGGER trigger_initialize_user_learning_progress
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_learning_progress();

-- Function to unlock next week when a week is completed
CREATE OR REPLACE FUNCTION unlock_next_week()
RETURNS TRIGGER AS $$
DECLARE
    next_week_number INTEGER;
    prerequisites_met BOOLEAN;
BEGIN
    -- Only proceed if status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Find the next week number
        next_week_number := NEW.week_number + 1;
        
        -- Check if all prerequisites for the next week are met
        SELECT NOT EXISTS (
            SELECT 1
            FROM public.learning_weeks lw
            WHERE lw.week_number = next_week_number
            AND EXISTS (
                SELECT 1
                FROM unnest(lw.prerequisites) AS prereq
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM public.user_learning_progress ulp
                    WHERE ulp.user_id = NEW.user_id
                    AND ulp.week_number = prereq
                    AND ulp.status = 'completed'
                )
            )
        ) INTO prerequisites_met;
        
        -- Unlock next week if prerequisites are met
        IF prerequisites_met THEN
            UPDATE public.user_learning_progress
            SET status = 'unlocked'
            WHERE user_id = NEW.user_id
            AND week_number = next_week_number
            AND status = 'locked';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to unlock next week on completion
CREATE TRIGGER trigger_unlock_next_week
    AFTER UPDATE ON public.user_learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION unlock_next_week();
