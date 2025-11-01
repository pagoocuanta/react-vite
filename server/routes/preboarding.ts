import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Get all preboarding tiles
router.get('/tiles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('preboarding_tiles')
      .select('*')
      .order('tile_order');

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching preboarding tiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new preboarding tile (admin only)
router.post('/tiles', async (req, res) => {
  try {
    const { title, description, icon, color, tileId } = req.body;

    // Get the highest tile_order to determine the next order
    const { data: existingTiles, error: fetchError } = await supabase
      .from('preboarding_tiles')
      .select('tile_order')
      .order('tile_order', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextOrder = existingTiles && existingTiles.length > 0
      ? existingTiles[0].tile_order + 1
      : 1;

    const { data, error } = await supabase
      .from('preboarding_tiles')
      .insert({
        tile_order: nextOrder,
        tile_id: tileId || `tile-${Date.now()}`,
        title,
        description,
        icon,
        color,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating preboarding tile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update preboarding tile (admin only)
router.put('/tiles/:tileId', async (req, res) => {
  try {
    const { tileId } = req.params;
    const { title, description, icon, color } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const { data, error } = await supabase
      .from('preboarding_tiles')
      .update(updateData)
      .eq('id', tileId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating preboarding tile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete preboarding tile (admin only)
router.delete('/tiles/:tileId', async (req, res) => {
  try {
    const { tileId } = req.params;

    const { error } = await supabase
      .from('preboarding_tiles')
      .delete()
      .eq('id', tileId);

    if (error) throw error;

    res.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Error deleting preboarding tile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tile content
router.get('/tiles/:tileId/content', async (req, res) => {
  try {
    const { tileId } = req.params;

    const { data, error } = await supabase
      .from('tile_content')
      .select('*')
      .eq('tile_id', tileId)
      .maybeSingle();

    if (error) throw error;

    res.json({ success: true, data: data || { content: [] } });
  } catch (error: any) {
    console.error('Error fetching tile content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upsert tile content (admin only)
router.put('/tiles/:tileId/content', async (req, res) => {
  try {
    const { tileId } = req.params;
    const { content } = req.body;

    const { data, error } = await supabase
      .from('tile_content')
      .upsert({
        tile_id: tileId,
        content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tile_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating tile content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's preboarding progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('preboarding_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching preboarding progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update tile progress
router.put('/progress/:userId/:tileId', async (req, res) => {
  try {
    const { userId, tileId } = req.params;
    const { completed } = req.body;

    const updateData: any = {
      user_id: userId,
      tile_id: tileId,
      completed,
      updated_at: new Date().toISOString()
    };

    if (completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('preboarding_progress')
      .upsert(updateData, {
        onConflict: 'user_id,tile_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating preboarding progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
