// User Management
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
  position: string;
  department: string;
  startDate: string;
  phone?: string;
  preferences: {
    language: 'nl' | 'en';
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  permissions: string[];
}

// News & Announcements
export interface Post {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  authorId: string;
  author: string;
  tags: string[];
  reactions: {
    heart: number;
    thumbsUp: number;
    flame: number;
    check: number;
  };
  userReactions: { [userId: string]: 'heart' | 'thumbsUp' | 'flame' | 'check' };
  isImportant: boolean;
  readBy: string[];
}

// Task Management
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  assignee: string;
  createdById: string;
  createdBy: string;
  dueDate?: string;
  tags: string[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

// Schedule Management
export interface Shift {
  id: string;
  employeeId: string;
  employee: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
  location?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Chat System
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  sender: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  readBy: { [userId: string]: string }; // userId -> timestamp
  type: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface Chat {
  id: string;
  name: string;
  type: 'group' | 'direct' | 'ai';
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  settings: {
    muted: { [userId: string]: boolean };
    notifications: { [userId: string]: boolean };
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Request Types
export interface CreatePostRequest {
  title: string;
  description: string;
  tags: string[];
  isImportant: boolean;
  image?: string;
}

export interface UpdatePostReactionRequest {
  postId: string;
  reaction: 'heart' | 'thumbsUp' | 'flame' | 'check';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'inprogress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface CreateShiftRequest {
  employeeId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
  location?: string;
  notes?: string;
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
  type?: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  preferences?: {
    language?: 'nl' | 'en';
    notifications?: boolean;
    theme?: 'light' | 'dark';
  };
}

// Demo Response (existing)
export interface DemoResponse {
  message: string;
}
