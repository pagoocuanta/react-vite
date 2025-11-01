import { RequestHandler } from "express";
import { Task, ApiResponse, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse } from "@shared/api";

// Mock data
let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Inventaris bijwerken',
    description: 'Controleer alle voorraad en update het systeem met de juiste aantallen.',
    status: 'todo',
    priority: 'high',
    assigneeId: '5',
    assignee: 'Jij',
    createdById: '4',
    createdBy: 'Mike Johnson',
    dueDate: '2024-01-19',
    tags: ['Voorraad', 'Urgent'],
    subtasks: [
      { id: '1a', title: 'Tel voorraad kassa gebied', completed: true, completedAt: '2024-01-16T10:30:00Z', completedBy: 'Jij' },
      { id: '1b', title: 'Tel voorraad magazijn', completed: false },
      { id: '1c', title: 'Update systeem', completed: false },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
    estimatedHours: 4,
  },
  {
    id: '2',
    title: 'Nieuwe medewerker inwerken',
    description: 'Lisa wegwijs maken in de kassasystemen en bedrijfsprocedures.',
    status: 'inprogress',
    priority: 'medium',
    assigneeId: '1',
    assignee: 'Emma Jansen',
    createdById: '4',
    createdBy: 'Mike Johnson',
    dueDate: '2024-01-18',
    tags: ['HR', 'Training'],
    subtasks: [
      { id: '2a', title: 'Rondleiding geven', completed: true, completedAt: '2024-01-14T14:00:00Z', completedBy: 'Emma Jansen' },
      { id: '2b', title: 'Kassasysteem uitleggen', completed: true, completedAt: '2024-01-15T11:00:00Z', completedBy: 'Emma Jansen' },
      { id: '2c', title: 'Veiligheidsprocedures bespreken', completed: false },
    ],
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    estimatedHours: 6,
  },
  {
    id: '3',
    title: 'Kassasysteem testen',
    description: 'Test de nieuwe update van het kassasysteem op bugs en problemen.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '2',
    assignee: 'Tom de Vries',
    createdById: '4',
    createdBy: 'Mike Johnson',
    dueDate: '2024-01-20',
    tags: ['IT', 'Testing'],
    subtasks: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    estimatedHours: 2,
  },
  {
    id: '4',
    title: 'Klantfeedback verwerken',
    description: 'Analyseer de feedback van afgelopen week en maak een rapport.',
    status: 'done',
    priority: 'low',
    assigneeId: '3',
    assignee: 'Lisa Bakker',
    createdById: '4',
    createdBy: 'Mike Johnson',
    dueDate: '2024-01-16',
    tags: ['Klantenservice', 'Rapport'],
    subtasks: [],
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-16T16:00:00Z',
    completedAt: '2024-01-16T16:00:00Z',
    estimatedHours: 3,
    actualHours: 2.5,
  },
  {
    id: '5',
    title: 'Veiligheidsronde',
    description: 'Controleer alle veiligheidsmaatregelen en nooduitgangen.',
    status: 'todo',
    priority: 'urgent',
    assigneeId: '4',
    assignee: 'Mike Johnson',
    createdById: '4',
    createdBy: 'Mike Johnson',
    dueDate: '2024-01-17',
    tags: ['Veiligheid', 'Controle'],
    subtasks: [],
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    estimatedHours: 1,
  }
];

// Get all tasks
export const getTasks: RequestHandler = (req, res) => {
  const { status, priority, assigneeId, page = '1', limit = '50' } = req.query;
  
  let filteredTasks = [...mockTasks];
  
  // Apply filters
  if (status && status !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (priority && priority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  if (assigneeId && assigneeId !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId);
  }
  
  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  
  const response: ApiResponse<PaginatedResponse<Task>> = {
    success: true,
    data: {
      data: paginatedTasks,
      total: filteredTasks.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < filteredTasks.length
    }
  };
  
  res.json(response);
};

// Get task by ID
export const getTaskById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const task = mockTasks.find(t => t.id === id);
  
  if (!task) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Task not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Task> = {
    success: true,
    data: task
  };
  res.json(response);
};

// Create new task
export const createTask: RequestHandler = (req, res) => {
  const taskData: CreateTaskRequest = req.body;
  
  const newTask: Task = {
    id: Date.now().toString(),
    ...taskData,
    assignee: 'Unknown', // Would be populated by user lookup
    createdById: '4', // Mock current user
    createdBy: 'Mike Johnson',
    status: 'todo',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockTasks.unshift(newTask);
  
  const response: ApiResponse<Task> = {
    success: true,
    data: newTask,
    message: 'Task created successfully'
  };
  
  res.status(201).json(response);
};

// Update task
export const updateTask: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates: UpdateTaskRequest = req.body;
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Task not found'
    };
    return res.status(404).json(response);
  }

  // Update task
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
    completedAt: updates.status === 'done' ? new Date().toISOString() : mockTasks[taskIndex].completedAt
  };

  const response: ApiResponse<Task> = {
    success: true,
    data: mockTasks[taskIndex],
    message: 'Task updated successfully'
  };
  res.json(response);
};

// Update task status (for drag and drop)
export const updateTaskStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status }: { status: Task['status'] } = req.body;
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Task not found'
    };
    return res.status(404).json(response);
  }

  // Update task status
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
    completedAt: status === 'done' ? new Date().toISOString() : undefined
  };

  const response: ApiResponse<Task> = {
    success: true,
    data: mockTasks[taskIndex],
    message: 'Task status updated successfully'
  };
  res.json(response);
};

// Update subtask
export const updateSubtask: RequestHandler = (req, res) => {
  const { id, subtaskId } = req.params;
  const { completed }: { completed: boolean } = req.body;
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Task not found'
    };
    return res.status(404).json(response);
  }

  const task = mockTasks[taskIndex];
  const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
  
  if (subtaskIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Subtask not found'
    };
    return res.status(404).json(response);
  }

  // Update subtask
  task.subtasks[subtaskIndex] = {
    ...task.subtasks[subtaskIndex],
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
    completedBy: completed ? 'Current User' : undefined
  };

  task.updatedAt = new Date().toISOString();

  const response: ApiResponse<Task> = {
    success: true,
    data: task,
    message: 'Subtask updated successfully'
  };
  res.json(response);
};

// Delete task
export const deleteTask: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Task not found'
    };
    return res.status(404).json(response);
  }

  mockTasks.splice(taskIndex, 1);

  const response: ApiResponse<null> = {
    success: true,
    message: 'Task deleted successfully'
  };
  res.json(response);
};
