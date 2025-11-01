// Script to create an admin user for Gruppy
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('Creating admin user...');
  
  const userData = {
    email: 'admin@gruppy.nl',
    password: 'gruppy2024',
    name: 'Silver Admin',
    role: 'admin',
    position: 'System Administrator',
    department: 'IT'
  };

  try {
    // Create user in Supabase Auth
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return;
    }

    if (!authData.user) {
      console.error('Failed to create auth user');
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile in database
    console.log('Creating user profile...');
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
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', userData.email);
    console.log('Password:', userData.password);
    console.log('User ID:', authData.user.id);
    console.log('Profile:', profileData);

  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createAdminUser();
