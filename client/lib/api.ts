import { 
  ApiResponse, 
  PaginatedResponse,
  User, 
  Task, 
  Post, 
  Shift,
  CreatePostRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateShiftRequest,
  UpdatePostReactionRequest,
  UpdateUserProfileRequest
} from '@shared/api';

const API_BASE = '/api';

// Generic API request handler with resilient fallbacks and clearer errors
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Candidate base URLs to try in order
  const candidates: string[] = [API_BASE];

  // Add Netlify functions path as a fallback (useful in preview/deploy environments)
  if (typeof window !== 'undefined') {
    candidates.push('/.netlify/functions/api');
    candidates.push(window.location.origin + API_BASE);
  }

  // Ensure unique
  const uniqueCandidates = Array.from(new Set(candidates));

  let lastError: any = null;

  for (const base of uniqueCandidates) {
    const url = `${base}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        lastError = new Error(`API Error: ${response.status} ${response.statusText} (url: ${url})`);
        // try next candidate
        continue;
      }

      return response.json();
    } catch (err) {
      // capture and try next candidate
      lastError = err;
      // If this was a network/fetch error, log which url failed
      console.warn(`apiRequest fetch failed for ${url}:`, err);
      continue;
    }
  }

  // If we reach here, all candidates failed
  if (lastError instanceof Error) {
    throw new APIError(lastError.message || 'Network request failed');
  }

  throw new APIError('Unknown network error');
}

// Users API
export const usersAPI = {
  getAll: () => apiRequest<User[]>('/users'),
  
  getCurrent: () => apiRequest<User>('/users/me'),
  
  getById: (id: string) => apiRequest<User>(`/users/${id}`),
  
  getTeamMembers: () => apiRequest<User[]>('/users/team'),
  
  updateProfile: (id: string, data: UpdateUserProfileRequest) =>
    apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiRequest<PaginatedResponse<Task>>(`/tasks?${searchParams.toString()}`);
  },
  
  getById: (id: string) => apiRequest<Task>(`/tasks/${id}`),
  
  create: (data: CreateTaskRequest) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateTaskRequest) =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: Task['status']) =>
    apiRequest<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) =>
    apiRequest<Task>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
  
  delete: (id: string) =>
    apiRequest<null>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

// Posts API
export const postsAPI = {
  getAll: (params?: {
    tag?: string;
    important?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiRequest<PaginatedResponse<Post>>(`/posts?${searchParams.toString()}`);
  },
  
  getById: (id: string) => apiRequest<Post>(`/posts/${id}`),
  
  create: (data: CreatePostRequest) =>
    apiRequest<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateReaction: (data: UpdatePostReactionRequest) =>
    apiRequest<Post>('/posts/reaction', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  markAsRead: (id: string) =>
    apiRequest<Post>(`/posts/${id}/read`, {
      method: 'PATCH',
    }),
  
  delete: (id: string) =>
    apiRequest<null>(`/posts/${id}`, {
      method: 'DELETE',
    }),
};

// Learning Progress API
export const learningAPI = {
  getProgress: (userId: string) =>
    apiRequest<{
      progress: any[];
      attempts: any[];
      statistics: {
        completedCount: number;
        availableCount: number;
        totalMinutes: number;
      };
    }>(`/learning/progress/${userId}`),

  getWeeks: () => apiRequest<any[]>('/learning/weeks'),

  updateProgress: (userId: string, weekId: string, data: {
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    score?: number;
    timeSpent?: number;
  }) =>
    apiRequest<any>(`/learning/progress/${userId}/${weekId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createQuizAttempt: (data: {
    userId: string;
    weekId: string;
    weekNumber: number;
    score: number;
    totalQuestions: number;
    answers: any;
    duration?: number;
  }) =>
    apiRequest<any>('/learning/quiz-attempt', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getQuizAttempts: (userId: string, weekNumber?: number) =>
    apiRequest<any[]>(`/learning/quiz-attempts/${userId}${weekNumber ? `?weekNumber=${weekNumber}` : ''}`),

  getStatistics: (userId: string) =>
    apiRequest<{
      completedCount: number;
      availableCount: number;
      totalMinutes: number;
    }>(`/learning/statistics/${userId}`),

  updateWeek: (weekId: string, data: {
    title?: string;
    description?: string;
    duration?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
    color?: string;
  }) =>
    apiRequest<any>(`/learning/weeks/${weekId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Preboarding API
export const preboardingAPI = {
  getTiles: () => apiRequest<any[]>('/preboarding/tiles'),

  createTile: (data: {
    title: string;
    description: string;
    icon: string;
    color: string;
    tileId?: string;
  }) =>
    apiRequest<any>('/preboarding/tiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTile: (tileId: string, data: {
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
  }) =>
    apiRequest<any>(`/preboarding/tiles/${tileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTile: (tileId: string) =>
    apiRequest<null>(`/preboarding/tiles/${tileId}`, {
      method: 'DELETE',
    }),

  getTileContent: (tileId: string) =>
    apiRequest<any>(`/preboarding/tiles/${tileId}/content`),

  updateTileContent: (tileId: string, content: any[]) =>
    apiRequest<any>(`/preboarding/tiles/${tileId}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  getProgress: (userId: string) =>
    apiRequest<any[]>(`/preboarding/progress/${userId}`),

  updateProgress: (userId: string, tileId: string, completed: boolean) =>
    apiRequest<any>(`/preboarding/progress/${userId}/${tileId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    }),
};

export const teamMembersAPI = {
  getMembers: () =>
    apiRequest<any[]>('/team-members'),

  createMember: (data: {
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    avatar?: string;
  }) =>
    apiRequest<any>('/team-members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (memberId: string, data: Partial<{
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    avatar?: string;
  }>) =>
    apiRequest<any>(`/team-members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMember: (memberId: string) =>
    apiRequest<null>(`/team-members/${memberId}`, {
      method: 'DELETE',
    }),
};

// Schedule API
export const scheduleAPI = {
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return apiRequest<Shift[]>(`/schedule?${searchParams.toString()}`);
  },
  
  getMy: (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return apiRequest<Shift[]>(`/schedule/me?${searchParams.toString()}`);
  },
  
  getById: (id: string) => apiRequest<Shift>(`/schedule/${id}`),
  
  create: (data: CreateShiftRequest) =>
    apiRequest<Shift>('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<CreateShiftRequest>) =>
    apiRequest<Shift>(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiRequest<null>(`/schedule/${id}`, {
      method: 'DELETE',
    }),
};

// General API utilities
export const api = {
  health: () => apiRequest<{ status: string; timestamp: string; version: string }>('/health'),
  
  ping: () => apiRequest<{ message: string }>('/ping'),
};

// Error handling utility
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Enhanced error handling
export async function handleAPICall<T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.success) {
      throw new APIError(
        response.error || 'Unknown API error',
        undefined,
        response
      );
    }
    
    return response.data!;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new APIError(error.message);
    }
    
    throw new APIError('Unknown error occurred');
  }
}

// React hooks for API calls (optional - could be extended with react-query)
export const useAPI = () => {
  const callAPI = async <T>(apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      return await handleAPICall(apiCall);
    } catch (error) {
      console.error('API Call failed:', error);
      throw error;
    }
  };

  return { callAPI };
};
