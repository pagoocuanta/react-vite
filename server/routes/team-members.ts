import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Get all team members
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new team member (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, role, department, email, phone, location, bio, avatar } = req.body;

    // Get the highest display_order to determine the next order
    const { data: existingMembers, error: fetchError } = await supabase
      .from('team_members')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextOrder = existingMembers && existingMembers.length > 0
      ? existingMembers[0].display_order + 1
      : 1;

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name,
        role,
        department,
        email,
        phone,
        location,
        bio,
        avatar,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update team member (admin only)
router.put('/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, role, department, email, phone, location, bio, avatar } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete team member (admin only)
router.delete('/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    res.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
