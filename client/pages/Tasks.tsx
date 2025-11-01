import { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  MoreVertical,
  Check,
  X,
  ChevronDown,
  Tag,
  MessageSquare,
  GripVertical,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { tasksAPI, usersAPI, handleAPICall } from '@/lib/api';
import { NewTaskModal } from '@/components/NewTaskModal';
import type { Task, User } from '@shared/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate?: string;
  tags: string[];
  subtasks?: SubTask[];
  createdAt: string;
  completedAt?: string;
  estimatedHours?: number;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

const mockTeamMembers = [
  { id: '1', name: 'Emma Jansen', avatar: 'EJ', role: 'Kassa' },
  { id: '2', name: 'Tom de Vries', avatar: 'TV', role: 'Voorraad' },
  { id: '3', name: 'Lisa Bakker', avatar: 'LB', role: 'Klantenservice' },
  { id: '4', name: 'Sarah Meijer', avatar: 'SM', role: 'Kassa' },
  { id: '5', name: 'Mike Johnson', avatar: 'MJ', role: 'Manager' },
  { id: '6', name: 'Jij', avatar: 'JL', role: 'Kassa' },
];

const priorityConfig = {
  low: { label: 'Laag', color: 'bg-gray-100 text-gray-700', icon: '⚪' },
  medium: { label: 'Normaal', color: 'bg-gruppy-blue-light text-gruppy-blue', icon: '🔵' },
  high: { label: 'Hoog', color: 'bg-gruppy-orange-light text-gruppy-orange', icon: '🟠' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: '🔴' },
};

const statusConfig = {
  todo: { label: 'Te doen', color: 'bg-gray-50', icon: '📋' },
  inprogress: { label: 'Bezig', color: 'bg-gruppy-orange-light/30', icon: '⚡' },
  done: { label: 'Voltooid', color: 'bg-gruppy-green-light/30', icon: '✅' },
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Inventaris bijwerken',
    description: 'Controleer alle voorraad en update het systeem met de juiste aantallen.',
    status: 'todo',
    priority: 'high',
    assignee: 'Jij',
    dueDate: '2024-01-19',
    tags: ['Voorraad', 'Urgent'],
    subtasks: [
      { id: '1a', title: 'Tel voorraad kassa gebied', completed: true },
      { id: '1b', title: 'Tel voorraad magazijn', completed: false },
      { id: '1c', title: 'Update systeem', completed: false },
    ],
    createdAt: '2024-01-15',
    estimatedHours: 4,
  },
  {
    id: '2',
    title: 'Nieuwe medewerker inwerken',
    description: 'Lisa wegwijs maken in de kassasystemen en bedrijfsprocedures.',
    status: 'inprogress',
    priority: 'medium',
    assignee: 'Emma Jansen',
    dueDate: '2024-01-18',
    tags: ['HR', 'Training'],
    subtasks: [
      { id: '2a', title: 'Rondleiding geven', completed: true },
      { id: '2b', title: 'Kassasysteem uitleggen', completed: true },
      { id: '2c', title: 'Veiligheidsprocedures bespreken', completed: false },
    ],
    createdAt: '2024-01-14',
    estimatedHours: 6,
  },
  {
    id: '3',
    title: 'Kassasysteem testen',
    description: 'Test de nieuwe update van het kassasysteem op bugs en problemen.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Tom de Vries',
    dueDate: '2024-01-20',
    tags: ['IT', 'Testing'],
    createdAt: '2024-01-15',
    estimatedHours: 2,
  },
  {
    id: '4',
    title: 'Klantfeedback verwerken',
    description: 'Analyseer de feedback van afgelopen week en maak een rapport.',
    status: 'done',
    priority: 'low',
    assignee: 'Lisa Bakker',
    dueDate: '2024-01-16',
    tags: ['Klantenservice', 'Rapport'],
    createdAt: '2024-01-12',
    completedAt: '2024-01-16',
    estimatedHours: 3,
  },
  {
    id: '5',
    title: 'Veiligheidsronde',
    description: 'Controleer alle veiligheidsmaatregelen en nooduitgangen.',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Mike Johnson',
    dueDate: '2024-01-17',
    tags: ['Veiligheid', 'Controle'],
    createdAt: '2024-01-15',
    estimatedHours: 1,
  },
  {
    id: '6',
    title: 'Team meeting voorbereiden',
    description: 'Agenda opstellen en vergaderruimte reserveren voor weekly meeting.',
    status: 'inprogress',
    priority: 'low',
    assignee: 'Mike Johnson',
    dueDate: '2024-01-18',
    tags: ['Meeting', 'Planning'],
    createdAt: '2024-01-14',
    estimatedHours: 1,
  }
];

export default function Tasks() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store all tasks
  const [tasks, setTasks] = useState<Task[]>([]); // Filtered tasks based on role
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Filter tasks based on user role
  const filterTasksByRole = (allTasksData: Task[]) => {
    if (!user) return allTasksData;

    if (user.role === 'admin') {
      // Admins see all tasks
      console.log('Admin user: showing all tasks');
      return allTasksData;
    } else {
      // Staff users see only tasks assigned to them
      const userTasks = allTasksData.filter(task => {
        // Check if task is assigned to current user by name or ID
        const isAssignedToUser = task.assignee === user.name ||
                                task.assignee === user.id ||
                                task.assignee === `${user.id}`;
        return isAssignedToUser;
      });
      console.log(`Staff user ${user.name}: showing ${userTasks.length} assigned tasks`);
      return userTasks;
    }
  };

  // Load tasks and team members from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading tasks and users...');
        const [tasksData, usersData] = await Promise.all([
          handleAPICall(() => tasksAPI.getAll()),
          handleAPICall(() => usersAPI.getTeamMembers())
        ]);

        console.log('Tasks loaded:', tasksData);
        console.log('Users loaded:', usersData);

        // Remove unwanted tasks by title (case-insensitive)
        const removedTitles = ['marcoo', 'marcooo', 'neger', 'test', 'back-end verandering'];
        const sanitize = (s: string | undefined) => (s || '').toLowerCase().trim();
        const filteredData = tasksData.data.filter((task: Task) => !removedTitles.includes(sanitize(task.title)));

        setAllTasks(filteredData);
        setTeamMembers(usersData);

        // Apply role-based filtering
        const filteredTasks = filterTasksByRole(filteredData);
        setTasks(filteredTasks);

      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to mock data - remove unwanted titles from mock as well
        const removedTitles = ['marcoo', 'marcooo', 'neger', 'test', 'back-end verandering'];
        const sanitize = (s: string | undefined) => (s || '').toLowerCase().trim();
        const cleanedMockTasks = mockTasks.filter((task: Task) => !removedTitles.includes(sanitize(task.title)));

        const fallbackTasks = filterTasksByRole(cleanedMockTasks);
        setAllTasks(cleanedMockTasks);
        setTasks(fallbackTasks);
        setTeamMembers(mockTeamMembers);
        console.log('Using fallback mock data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Re-filter tasks when user changes
  useEffect(() => {
    if (allTasks.length > 0 && user) {
      const filteredTasks = filterTasksByRole(allTasks);
      setTasks(filteredTasks);
    }
  }, [user, allTasks]);

  const filters = user?.role === 'admin' ? [
    { key: 'all', label: 'Alle taken', count: tasks.length },
    { key: 'vandaag', label: 'Vandaag', count: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length },
    { key: 'deze_week', label: 'Deze week', count: tasks.filter(t => isThisWeek(t.dueDate)).length },
    { key: 'mijn_taken', label: 'Mijn taken', count: tasks.filter(t => t.assignee === user?.name || t.assignee === 'Jij').length },
    { key: 'open', label: 'Open', count: tasks.filter(t => t.status !== 'done').length },
    { key: 'voltooid', label: 'Voltooid', count: tasks.filter(t => t.status === 'done').length },
  ] : [
    // Staff users only see simplified filters since they only see their own tasks
    { key: 'all', label: 'Alle taken', count: tasks.length },
    { key: 'vandaag', label: 'Vandaag', count: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length },
    { key: 'deze_week', label: 'Deze week', count: tasks.filter(t => isThisWeek(t.dueDate)).length },
    { key: 'open', label: 'Open', count: tasks.filter(t => t.status !== 'done').length },
    { key: 'voltooid', label: 'Voltooid', count: tasks.filter(t => t.status === 'done').length },
  ];

  function isThisWeek(dateString?: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    return date >= startOfWeek && date <= endOfWeek;
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Status filter
      if (selectedFilter === 'vandaag' && task.dueDate !== new Date().toISOString().split('T')[0]) return false;
      if (selectedFilter === 'deze_week' && !isThisWeek(task.dueDate)) return false;
      if (selectedFilter === 'mijn_taken' && task.assignee !== user?.name && task.assignee !== 'Jij') return false;
      if (selectedFilter === 'open' && task.status === 'done') return false;
      if (selectedFilter === 'voltooid' && task.status !== 'done') return false;
      
      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      
      // Assignee filter
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) return false;
      
      return true;
    });
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' :
                     task.status === 'todo' ? 'inprogress' : 'done';

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));

    try {
      await handleAPICall(() => tasksAPI.updateStatus(taskId, newStatus));
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return task; // Revert to original
        }
        return t;
      }));
    }
  };

  const toggleSubTask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(st => st.id === subtaskId);
    if (!task || !subtask) return;

    const newCompleted = !subtask.completed;

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(st =>
            st.id === subtaskId
              ? { ...st, completed: newCompleted }
              : st
          )
        };
      }
      return t;
    }));

    try {
      await handleAPICall(() => tasksAPI.updateSubtask(taskId, subtaskId, newCompleted));
    } catch (error) {
      console.error('Failed to update subtask:', error);
      // Revert on error
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return task; // Revert to original
        }
        return t;
      }));
    }
  };

  const createNewTask = async (taskData: {
    title: string;
    description: string;
    assigneeId: string;
    priority: Task['priority'];
    dueDate?: string;
    tags: string[];
    estimatedHours?: number;
  }) => {
    try {
      // Find assignee name
      const assignee = teamMembers.find(m => m.id === taskData.assigneeId);

      // Create optimistic task for immediate UI feedback
      const optimisticTask: Task = {
        id: 'temp-' + Date.now(),
        title: taskData.title,
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority,
        assigneeId: taskData.assigneeId,
        assignee: assignee?.name || 'Unknown',
        createdById: '5', // Current user
        createdBy: 'Jij',
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedHours: taskData.estimatedHours
      };

      // Add optimistic task to UI
      setTasks(prev => [optimisticTask, ...prev]);

      // Create via API
      const newTask = await handleAPICall(() => tasksAPI.create(taskData));

      // Replace optimistic task with real task
      setTasks(prev => prev.map(t =>
        t.id === optimisticTask.id ? newTask : t
      ));

      console.log('Task created successfully:', newTask.title);
    } catch (error) {
      console.error('Failed to create task:', error);
      // Remove optimistic task on error
      setTasks(prev => prev.filter(t => !t.id.startsWith('temp-')));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Vandaag';
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getTasksByStatus = (status: Task['status']) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== newStatus) {
      // Optimistic update
      setTasks(prev => prev.map(task => {
        if (task.id === draggedTask.id) {
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      }));

      try {
        // Update via API
        await handleAPICall(() => tasksAPI.updateStatus(draggedTask.id, newStatus));
        console.log(`Task "${draggedTask.title}" moved to ${newStatus}`);
      } catch (error) {
        console.error('Failed to update task status:', error);
        // Revert optimistic update on error
        setTasks(prev => prev.map(task => {
          if (task.id === draggedTask.id) {
            return draggedTask; // Revert to original state
          }
          return task;
        }));
      }
    }

    setDraggedTask(null);
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gruppy-orange" />
          <span className="text-lg text-muted-foreground">Taken laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('nav.tasks')}
            </h1>
            {user && (
              <Badge
                className={`${user.role === 'admin'
                  ? 'bg-gruppy-orange/20 text-gruppy-orange border-gruppy-orange/30'
                  : 'bg-gruppy-blue/20 text-gruppy-blue border-gruppy-blue/30'
                }`}
              >
                {user.role === 'admin' ? 'Alle taken' : 'Mijn taken'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'admin'
              ? 'Beheer alle taken van het team en houd voortgang bij'
              : 'Beheer je eigen taken en houd voortgang bij'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={cn(
                "text-xs",
                viewMode === 'kanban' && "bg-white shadow-sm"
              )}
            >
              Kanban
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "text-xs",
                viewMode === 'list' && "bg-white shadow-sm"
              )}
            >
              Lijst
            </Button>
          </div>

          {/* Only show "Nieuwe taak" button for admin users */}
          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowNewTaskForm(true)}
              className="bg-gruppy-orange hover:bg-gruppy-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe taak
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key)}
              className={cn(
                "text-xs",
                selectedFilter === filter.key && "bg-gruppy-orange hover:bg-gruppy-orange/90"
              )}
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">Alle prioriteiten</option>
          {Object.entries(priorityConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>

        {/* Assignee Filter - Only show for admins or current user for staff */}
        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
        >
          <option value="all">
            {user?.role === 'admin' ? 'Alle medewerkers' : 'Mijn taken'}
          </option>
          {(user?.role === 'admin' ? teamMembers : teamMembers.filter(member => member.name === user?.name)).map(member => (
            <option key={member.id} value={member.name}>{member.name}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTasks = getTasksByStatus(status as Task['status']);
            const isDragOver = dragOverColumn === status;

            return (
              <div
                key={status}
                className={cn(
                  "bg-card rounded-2xl border border-border p-4 transition-all duration-200 min-h-[400px]",
                  isDragOver && "border-gruppy-orange border-2 bg-gruppy-orange-light/10 scale-[1.02]"
                )}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, status as Task['status'])}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status as Task['status'])}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {statusTasks.length}
                    </Badge>
                  </div>
                  {isDragOver && (
                    <div className="text-gruppy-orange text-sm font-medium animate-pulse">
                      Laat hier los
                    </div>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-background rounded-xl border border-border p-4 cursor-move transition-all duration-200 hover:shadow-md hover:scale-[1.02] group",
                        isOverdue(task.dueDate) && task.status !== 'done'
                          ? "border-l-4 border-l-red-500"
                          : task.status === 'inprogress'
                          ? "border-l-4 border-l-inprogress"
                          : undefined,
                        draggedTask?.id === task.id && "opacity-50 transform rotate-2 scale-105 shadow-2xl z-10"
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sleep om te verplaatsen</span>
                      </div>
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={cn(
                            "p-1 h-8 w-8 transition-all duration-200",
                            task.status === 'done' 
                              ? "text-gruppy-green hover:bg-gruppy-green-light" 
                              : "text-muted-foreground hover:text-gruppy-green"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Task Meta */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Priority */}
                        <Badge className={cn("text-xs", priorityConfig[task.priority].color)}>
                          {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
                        </Badge>

                        {/* Tags */}
                        {task.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Subtasks Progress */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtaken
                            </span>
                          </div>
                          <div className="space-y-1">
                            {task.subtasks.slice(0, 2).map(subtask => (
                              <div key={subtask.id} className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubTask(task.id, subtask.id)}
                                  className={cn(
                                    "w-3 h-3 rounded border transition-all duration-200",
                                    subtask.completed 
                                      ? "bg-gruppy-green border-gruppy-green text-white"
                                      : "border-border hover:border-gruppy-green"
                                  )}
                                >
                                  {subtask.completed && <Check className="h-2 w-2" />}
                                </button>
                                <span className={cn(
                                  "text-xs",
                                  subtask.completed ? "line-through text-muted-foreground" : "text-foreground"
                                )}>
                                  {subtask.title}
                                </span>
                              </div>
                            ))}
                            {task.subtasks.length > 2 && (
                              <div className="text-xs text-muted-foreground ml-5">
                                +{task.subtasks.length - 2} meer...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Task Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Assignee */}
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-gruppy-blue to-gruppy-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {teamMembers.find(m => m.name === task.assignee)?.name.slice(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs text-muted-foreground">{task.assignee}</span>
                          </div>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            isOverdue(task.dueDate) && task.status !== 'done'
                              ? "text-red-600"
                              : "text-muted-foreground"
                          )}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2">{config.icon}</div>
                      <p className="text-sm">Geen taken in {config.label.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  {/* Status Checkbox */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                      "p-1 h-8 w-8",
                      task.status === 'done' 
                        ? "text-gruppy-green" 
                        : "text-muted-foreground hover:text-gruppy-green"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </Button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium",
                        task.status === 'done' ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {task.title}
                      </h4>
                      <Badge className={cn("text-xs", priorityConfig[task.priority].color)}>
                        {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-gruppy-blue to-gruppy-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {teamMembers.find(m => m.name === task.assignee)?.name.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-muted-foreground hidden sm:block">{task.assignee}</span>
                  </div>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      isOverdue(task.dueDate) && task.status !== 'done'
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}>
                      <Calendar className="h-4 w-4" />
                      {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Geen taken gevonden
              </h3>
              <p className="text-muted-foreground">
                Probeer een ander filter of voeg een nieuwe taak toe.
              </p>
            </div>
          )}
        </div>
      )}

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={showNewTaskForm}
        onClose={() => setShowNewTaskForm(false)}
        onSubmit={createNewTask}
        teamMembers={teamMembers}
      />
    </div>
  );
}
