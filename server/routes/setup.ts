import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// One-time setup endpoint to create admin user
router.post('/create-admin', async (req, res) => {
  try {
    const userData = {
      email: 'admin@gruppy.nl',
      password: 'gruppy2024',
      name: 'Silver Admin',
      role: 'admin',
      position: 'System Administrator',
      department: 'IT'
    };

    console.log('Creating admin user...');

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        error: `Auth error: ${authError.message}`
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create auth user'
      });
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile in database
    const userProfile = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      preferences: {
        language: 'nl',
        notifications: true,
        theme: 'light'
      },
      permissions: ['read', 'write', 'delete', 'admin']
    };

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([userProfile])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({
        success: false,
        error: `Profile error: ${profileError.message}`
      });
    }

    res.json({
      success: true,
      message: 'Admin user created successfully!',
      credentials: {
        email: userData.email,
        password: userData.password
      },
      user: profileData
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`
    });
  }
});

export default router;
