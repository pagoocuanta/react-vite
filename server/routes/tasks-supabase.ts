import { RequestHandler } from "express";
import { Task, ApiResponse, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse } from "@shared/api";
import { supabase, handleSupabaseError, createSupabaseResponse } from "../lib/supabase";

// User ID mapping utilities
const userIdMap: { [key: string]: string } = {
  '1': '550e8400-e29b-41d4-a716-446655440001',
  '2': '550e8400-e29b-41d4-a716-446655440002',
  '3': '550e8400-e29b-41d4-a716-446655440003',
  '4': '550e8400-e29b-41d4-a716-446655440004',
  '5': '550e8400-e29b-41d4-a716-446655440005'
};

const reverseUserIdMap: { [key: string]: string } = {
  '550e8400-e29b-41d4-a716-446655440001': '1',
  '550e8400-e29b-41d4-a716-446655440002': '2',
  '550e8400-e29b-41d4-a716-446655440003': '3',
  '550e8400-e29b-41d4-a716-446655440004': '4',
  '550e8400-e29b-41d4-a716-446655440005': '5'
};

const mapUserIdToUuid = (id: string): string => userIdMap[id] || id;
const mapUuidToUserId = (uuid: string): string => reverseUserIdMap[uuid] || uuid;

// Get all tasks with pagination and filtering
export const getTasks: RequestHandler = async (req, res) => {
  try {
    const { status, priority, assigneeId, page = '1', limit = '50' } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name),
        subtasks(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    if (assigneeId && assigneeId !== 'all') {
      query = query.eq('assignee_id', assigneeId);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true });

    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    
    query = query.range(startIndex, startIndex + limitNum - 1);
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json(handleSupabaseError(error));
    }

    // Transform data to match frontend expectations
    const transformedTasks: Task[] = data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: mapUuidToUserId(task.assignee_id),
      assignee: task.assignee?.name || 'Unknown',
      createdById: mapUuidToUserId(task.created_by_id),
      createdBy: task.created_by?.name || 'Unknown',
      dueDate: task.due_date,
      tags: task.tags || [],
      subtasks: task.subtasks || [],
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      estimatedHours: task.estimated_hours,
      actualHours: task.actual_hours
    })) || [];

    const response: ApiResponse<PaginatedResponse<Task>> = createSupabaseResponse({
      data: transformedTasks,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      hasMore: (startIndex + limitNum) < (count || 0)
    });
    
    res.json(response);
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Get task by ID
export const getTaskById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name),
        subtasks(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: mapUuidToUserId(data.assignee_id),
      assignee: data.assignee?.name || 'Unknown',
      createdById: mapUuidToUserId(data.created_by_id),
      createdBy: data.created_by?.name || 'Unknown',
      dueDate: data.due_date,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    };

    res.json(createSupabaseResponse(transformedTask));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Create new task
// NOTE: Access control is enforced on the frontend (only admins see "Nieuwe taak" button)
// TODO: Add proper server-side authentication middleware to verify user role
export const createTask: RequestHandler = async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    const taskData: CreateTaskRequest = req.body;

    // Validate required fields
    if (!taskData.title || !taskData.assigneeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title and assigneeId'
      });
    }

    const assigneeId = mapUserIdToUuid(taskData.assigneeId);
    console.log('Mapped assigneeId:', { original: taskData.assigneeId, mapped: assigneeId });

    // Check if assignee exists
    const { data: assigneeExists, error: assigneeError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', assigneeId)
      .single();

    if (assigneeError || !assigneeExists) {
      console.error('Assignee not found:', assigneeError);
      return res.status(400).json({
        success: false,
        error: `Assignee with ID ${assigneeId} not found in database`
      });
    }

    console.log('Found assignee:', assigneeExists);

    // Get any admin user as creator, or fallback to the assignee
    let creatorId = assigneeId; // Default to assignee
    let creatorName = assigneeExists.name;

    // Try to find an admin user to be the creator
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      creatorId = adminUser.id;
      creatorName = adminUser.name;
      console.log('Using admin as creator:', adminUser);
    } else {
      console.log('No admin found, using assignee as creator:', assigneeExists);
    }

    const insertData = {
      title: taskData.title,
      description: taskData.description,
      assignee_id: assigneeId,
      priority: taskData.priority,
      due_date: taskData.dueDate,
      tags: taskData.tags || [],
      estimated_hours: taskData.estimatedHours,
      created_by_id: creatorId,
      status: 'todo'
    };

    console.log('Inserting task data:', insertData);

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase error creating task:', error);
      console.log('Falling back to mock task creation');

      // Fallback to creating mock task
      const mockTask: Task = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description || '',
        status: 'todo',
        priority: taskData.priority,
        assigneeId: taskData.assigneeId,
        assignee: assigneeExists?.name || 'Unknown',
        createdById: mapUuidToUserId(creatorId),
        createdBy: creatorName || 'Unknown',
        dueDate: taskData.dueDate,
        tags: taskData.tags || [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedHours: taskData.estimatedHours
      };

      return res.status(201).json({
        success: true,
        data: mockTask,
        message: 'Task created successfully (using fallback)'
      });
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: mapUuidToUserId(data.assignee_id),
      assignee: data.assignee?.name || 'Unknown',
      createdById: mapUuidToUserId(data.created_by_id),
      createdBy: data.created_by?.name || 'Unknown',
      dueDate: data.due_date,
      tags: data.tags || [],
      subtasks: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    };

    res.status(201).json(createSupabaseResponse(transformedTask, 'Task created successfully'));
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update task
export const updateTask: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskRequest = req.body;
    
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      updateData.completed_at = updates.status === 'done' ? new Date().toISOString() : null;
    }
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.assigneeId !== undefined) updateData.assignee_id = mapUserIdToUuid(updates.assigneeId);
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name),
        subtasks(*)
      `)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: mapUuidToUserId(data.assignee_id),
      assignee: data.assignee?.name || 'Unknown',
      createdById: mapUuidToUserId(data.created_by_id),
      createdBy: data.created_by?.name || 'Unknown',
      dueDate: data.due_date,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    };

    res.json(createSupabaseResponse(transformedTask, 'Task updated successfully'));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Update task status (for drag and drop)
export const updateTaskStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status }: { status: Task['status'] } = req.body;
    
    const updateData = {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name),
        subtasks(*)
      `)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const transformedTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: mapUuidToUserId(data.assignee_id),
      assignee: data.assignee?.name || 'Unknown',
      createdById: mapUuidToUserId(data.created_by_id),
      createdBy: data.created_by?.name || 'Unknown',
      dueDate: data.due_date,
      tags: data.tags || [],
      subtasks: data.subtasks || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours
    };

    res.json(createSupabaseResponse(transformedTask, 'Task status updated successfully'));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Update subtask
export const updateSubtask: RequestHandler = async (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    const { completed }: { completed: boolean } = req.body;
    
    const updateData = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by_id: completed ? '550e8400-e29b-41d4-a716-446655440005' : null // Mock current user
    };

    const { error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', subtaskId)
      .eq('task_id', id);
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Subtask not found'
      });
    }

    // Return the updated task with subtasks
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name),
        created_by:users!tasks_created_by_id_fkey(id, name),
        subtasks(*)
      `)
      .eq('id', id)
      .single();

    if (taskError) {
      return res.status(404).json(handleSupabaseError(taskError));
    }

    const transformedTask: Task = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: taskData.assignee_id,
      assignee: taskData.assignee?.name || 'Unknown',
      createdById: taskData.created_by_id,
      createdBy: taskData.created_by?.name || 'Unknown',
      dueDate: taskData.due_date,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      createdAt: taskData.created_at,
      updatedAt: taskData.updated_at,
      completedAt: taskData.completed_at,
      estimatedHours: taskData.estimated_hours,
      actualHours: taskData.actual_hours
    };

    res.json(createSupabaseResponse(transformedTask, 'Subtask updated successfully'));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};

// Delete task
export const deleteTask: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json(createSupabaseResponse(null, 'Task deleted successfully'));
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
};
