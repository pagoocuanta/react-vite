import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Get user's learning progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's progress for all weeks
    let { data: progress, error } = await supabase
      .from('user_learning_progress')
      .select(`
        *,
        week:learning_weeks(*)
      `)
      .eq('user_id', userId)
      .order('week_number');

    if (error) throw error;

    // If user has no progress, initialize it
    if (!progress || progress.length === 0) {
      console.log('No progress found for user, initializing...');

      // Get all learning weeks
      const { data: weeks, error: weeksError } = await supabase
        .from('learning_weeks')
        .select('*')
        .order('week_number');

      if (weeksError) throw weeksError;

      if (weeks && weeks.length > 0) {
        // Create progress records for all weeks
        const progressRecords = weeks.map(week => ({
          user_id: userId,
          week_id: week.id,
          week_number: week.week_number,
          status: week.week_number === 1 ? 'unlocked' : 'locked'
        }));

        const { error: insertError } = await supabase
          .from('user_learning_progress')
          .insert(progressRecords);

        if (insertError) {
          console.error('Error initializing progress:', insertError);
        } else {
          // Fetch the newly created progress
          const { data: newProgress, error: fetchError } = await supabase
            .from('user_learning_progress')
            .select(`
              *,
              week:learning_weeks(*)
            `)
            .eq('user_id', userId)
            .order('week_number');

          if (!fetchError) {
            progress = newProgress;
          }
        }
      }
    }

    // Get quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (attemptsError) throw attemptsError;

    // Calculate statistics
    const completedCount = progress?.filter(p => p.status === 'completed').length || 0;
    const availableCount = progress?.filter(p => p.status === 'unlocked' || p.status === 'in_progress' || p.status === 'completed').length || 0;
    const totalMinutes = progress
      ?.filter(p => p.status === 'completed' && p.time_spent)
      .reduce((acc, p) => acc + (p.time_spent || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        progress: progress || [],
        attempts: attempts || [],
        statistics: {
          completedCount,
          availableCount,
          totalMinutes
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all learning weeks
router.get('/weeks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('learning_weeks')
      .select('*')
      .order('week_number');

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching learning weeks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update week progress (start, complete, etc.)
router.put('/progress/:userId/:weekId', async (req, res) => {
  try {
    const { userId, weekId } = req.params;
    const { status, score, timeSpent } = req.body;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'in_progress' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (score !== undefined) updateData.score = score;
      if (timeSpent !== undefined) updateData.time_spent = timeSpent;
    }

    const { data, error } = await supabase
      .from('user_learning_progress')
      .update(updateData)
      .eq('user_id', userId)
      .eq('week_id', weekId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quiz attempts for a user
router.get('/quiz-attempts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekNumber } = req.query;

    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId);

    if (weekNumber) {
      query = query.eq('week_number', parseInt(weekNumber as string));
    }

    const { data, error } = await query.order('completed_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create quiz attempt
router.post('/quiz-attempt', async (req, res) => {
  try {
    const { userId, weekId, weekNumber, score, totalQuestions, answers, duration } = req.body;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        week_id: weekId,
        week_number: weekNumber,
        score,
        total_questions: totalQuestions,
        answers,
        duration,
        completed: true,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update user progress to completed
    const { error: progressError } = await supabase
      .from('user_learning_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score,
        time_spent: duration ? Math.round(duration / 60) : null // Convert seconds to minutes
      })
      .eq('user_id', userId)
      .eq('week_id', weekId);

    if (progressError) throw progressError;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating quiz attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user statistics
router.get('/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: progress, error } = await supabase
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const completedCount = progress?.filter(p => p.status === 'completed').length || 0;
    const availableCount = progress?.filter(p =>
      p.status === 'unlocked' || p.status === 'in_progress' || p.status === 'completed'
    ).length || 0;
    const totalMinutes = progress
      ?.filter(p => p.status === 'completed' && p.time_spent)
      .reduce((acc, p) => acc + (p.time_spent || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        completedCount,
        availableCount,
        totalMinutes
      }
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update learning week (admin only)
router.put('/weeks/:weekId', async (req, res) => {
  try {
    const { weekId } = req.params;
    const { title, description, duration, level, color } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (level !== undefined) updateData.level = level;
    if (color !== undefined) updateData.color = color;

    const { data, error } = await supabase
      .from('learning_weeks')
      .update(updateData)
      .eq('id', weekId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating learning week:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
