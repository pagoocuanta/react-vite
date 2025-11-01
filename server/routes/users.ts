import { RequestHandler } from "express";
import { User, ApiResponse, UpdateUserProfileRequest } from "@shared/api";

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma Jansen',
    email: 'emma.jansen@gruppy.nl',
    role: 'staff',
    position: 'Kassa Medewerker',
    department: 'Verkoop',
    startDate: '2023-06-15',
    phone: '+31 6 12345678',
    preferences: {
      language: 'nl',
      notifications: true,
      theme: 'light'
    },
    permissions: ['view_schedule', 'view_tasks', 'chat']
  },
  {
    id: '2',
    name: 'Tom de Vries',
    email: 'tom.devries@gruppy.nl',
    role: 'staff',
    position: 'Voorraad Specialist',
    department: 'Logistiek',
    startDate: '2023-03-10',
    phone: '+31 6 87654321',
    preferences: {
      language: 'nl',
      notifications: true,
      theme: 'light'
    },
    permissions: ['view_schedule', 'view_tasks', 'chat', 'manage_inventory']
  },
  {
    id: '3',
    name: 'Lisa Bakker',
    email: 'lisa.bakker@gruppy.nl',
    role: 'staff',
    position: 'Klantenservice',
    department: 'Service',
    startDate: '2023-08-20',
    phone: '+31 6 55566677',
    preferences: {
      language: 'nl',
      notifications: true,
      theme: 'light'
    },
    permissions: ['view_schedule', 'view_tasks', 'chat', 'customer_service']
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike.johnson@gruppy.nl',
    role: 'admin',
    position: 'Store Manager',
    department: 'Management',
    startDate: '2022-01-15',
    phone: '+31 6 99988877',
    preferences: {
      language: 'en',
      notifications: true,
      theme: 'light'
    },
    permissions: ['*'] // Admin has all permissions
  },
  {
    id: '5',
    name: 'Jij',
    email: 'jij@gruppy.nl',
    role: 'staff',
    position: 'Kassa Medewerker',
    department: 'Verkoop',
    startDate: '2023-09-01',
    phone: '+31 6 11223344',
    preferences: {
      language: 'nl',
      notifications: true,
      theme: 'light'
    },
    permissions: ['view_schedule', 'view_tasks', 'chat']
  }
];

// Get all users
export const getUsers: RequestHandler = (req, res) => {
  const response: ApiResponse<User[]> = {
    success: true,
    data: mockUsers
  };
  res.json(response);
};

// Get current user (mock)
export const getCurrentUser: RequestHandler = (req, res) => {
  const currentUser = mockUsers.find(u => u.name === 'Jij');
  
  if (!currentUser) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: currentUser
  };
  res.json(response);
};

// Get user by ID
export const getUserById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find(u => u.id === id);
  
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user
  };
  res.json(response);
};

// Update user profile
export const updateUserProfile: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates: UpdateUserProfileRequest = req.body;
  
  const userIndex = mockUsers.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }

  // Update user
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
    preferences: {
      ...mockUsers[userIndex].preferences,
      ...updates.preferences
    }
  };

  const response: ApiResponse<User> = {
    success: true,
    data: mockUsers[userIndex],
    message: 'Profile updated successfully'
  };
  res.json(response);
};

// Get team members (non-admin users)
export const getTeamMembers: RequestHandler = (req, res) => {
  const teamMembers = mockUsers.filter(u => u.role === 'staff');
  
  const response: ApiResponse<User[]> = {
    success: true,
    data: teamMembers
  };
  res.json(response);
};
