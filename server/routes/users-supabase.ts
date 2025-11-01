import { RequestHandler } from "express";
import { User, ApiResponse, UpdateUserProfileRequest } from "@shared/api";
import { supabase, handleSupabaseError, createSupabaseResponse } from "../lib/supabase";

// Map UUIDs to simple IDs for frontend compatibility
const mapUserToFrontend = (user: any): User => {
  const idMap: { [key: string]: string } = {
    '550e8400-e29b-41d4-a716-446655440001': '1',
    '550e8400-e29b-41d4-a716-446655440002': '2',
    '550e8400-e29b-41d4-a716-446655440003': '3',
    '550e8400-e29b-41d4-a716-446655440004': '4',
    '550e8400-e29b-41d4-a716-446655440005': '5'
  };

  return {
    id: idMap[user.id] || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    department: user.department,
    startDate: user.start_date,
    phone: user.phone,
    preferences: user.preferences,
    permissions: user.permissions
  };
};

// Get all users
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    const users = data?.map(mapUserToFrontend) || [];
    res.json(createSupabaseResponse(users));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Get current user (mock)
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', 'Jij')
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = mapUserToFrontend(data);
    res.json(createSupabaseResponse(user));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Get user by ID
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Map frontend ID back to UUID
    const uuidMap: { [key: string]: string } = {
      '1': '550e8400-e29b-41d4-a716-446655440001',
      '2': '550e8400-e29b-41d4-a716-446655440002',
      '3': '550e8400-e29b-41d4-a716-446655440003',
      '4': '550e8400-e29b-41d4-a716-446655440004',
      '5': '550e8400-e29b-41d4-a716-446655440005'
    };
    
    const uuid = uuidMap[id] || id;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uuid)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = mapUserToFrontend(data);
    res.json(createSupabaseResponse(user));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Update user profile
export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateUserProfileRequest = req.body;
    
    // Map frontend ID back to UUID
    const uuidMap: { [key: string]: string } = {
      '1': '550e8400-e29b-41d4-a716-446655440001',
      '2': '550e8400-e29b-41d4-a716-446655440002',
      '3': '550e8400-e29b-41d4-a716-446655440003',
      '4': '550e8400-e29b-41d4-a716-446655440004',
      '5': '550e8400-e29b-41d4-a716-446655440005'
    };
    
    const uuid = uuidMap[id] || id;
    
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.preferences) updateData.preferences = updates.preferences;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', uuid)
      .select('*')
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = mapUserToFrontend(data);
    res.json(createSupabaseResponse(user, 'Profile updated successfully'));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Get team members (non-admin users)
export const getTeamMembers: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    const users = data?.map(mapUserToFrontend) || [];
    res.json(createSupabaseResponse(users));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};
