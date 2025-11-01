import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Users,
  FileText,
  GraduationCap,
  Briefcase,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { tasksAPI, preboardingAPI, handleAPICall } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@shared/api';

interface AgendaTask {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: "intro" | "training" | "meeting" | "task";
  priority: "high" | "medium" | "low";
  completed: boolean;
  description?: string;
}

const categoryConfig = {
  intro: {
    label: "Introductie",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  training: {
    label: "Training",
    icon: GraduationCap,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  meeting: {
    label: "Vergadering",
    icon: Briefcase,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  task: {
    label: "Taak",
    icon: FileText,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
};

export default function Agenda() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const fromWeek1Initial = searchParams.get('from') === 'week1';

  const [showWeek1Card, setShowWeek1Card] = useState(fromWeek1Initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<AgendaTask[]>([]);

  // Map task to category for visual representation
  const mapTaskToCategory = (task: Task): AgendaTask['category'] => {
    const titleLower = task.title?.toLowerCase() || '';
    if (titleLower.includes('training')) return 'training';
    if (titleLower.includes('meeting') || titleLower.includes('lunch') || titleLower.includes('vergadering')) return 'meeting';
    if (titleLower.includes('intro') || titleLower.includes('kennismaking') || titleLower.includes('welkom')) return 'intro';
    return 'task';
  };

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading tasks for user:', user.id);
        const tasksData = await handleAPICall(() => tasksAPI.getAll());

        console.log('Tasks loaded:', tasksData);

        // Filter tasks for current user (if not admin)
        const userTasks = user.role === 'admin'
          ? tasksData.data
          : tasksData.data.filter((task: Task) =>
              task.assignee === user.name ||
              task.assignee === user.id ||
              task.assigneeId === user.id
            );

        // Map database tasks to Agenda tasks format
        const mappedTasks: AgendaTask[] = userTasks.map((task: Task) => ({
          id: task.id,
          title: task.title,
          date: task.dueDate || new Date().toISOString().split('T')[0],
          time: task.dueDate ? new Date(task.dueDate).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : undefined,
          location: undefined,
          category: mapTaskToCategory(task),
          priority: task.priority,
          completed: task.status === 'done',
          description: task.description
        }));

        console.log('Mapped tasks:', mappedTasks);
        setTasks(mappedTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const oldHardcodedTasks = [
    {
      id: "1",
      title: "Introductiegesprek met manager",
      date: "2024-01-15",
      time: "10:00",
      location: "Kantoor A201",
      category: "intro",
      priority: "high",
      completed: false,
      description: "Kennismaking met je directe manager en bespreking van doelen",
    },
    {
      id: "2",
      title: "Team lunch",
      date: "2024-01-15",
      time: "12:30",
      location: "Kantine",
      category: "meeting",
      priority: "medium",
      completed: false,
      description: "Informele lunch met je nieuwe teamleden",
    },
    {
      id: "3",
      title: "Eerste werkdag",
      date: "2024-01-16",
      time: "09:00",
      location: "Hoofdkantoor",
      category: "intro",
      priority: "high",
      completed: true,
      description: "Welkom op je eerste werkdag!",
    },
    {
      id: "4",
      title: "Training: Bedrijfsprocessen",
      date: "2024-01-16",
      time: "14:00",
      location: "Training Room B",
      category: "training",
      priority: "high",
      completed: false,
      description: "Introductie tot onze bedrijfsprocessen en workflows",
    },
    {
      id: "5",
      title: "IT systemen setup",
      date: "2024-01-17",
      time: "10:00",
      location: "IT Afdeling",
      category: "task",
      priority: "high",
      completed: false,
      description: "Installatie en configuratie van benodigde software",
    },
    {
      id: "6",
      title: "HR administratie afronden",
      date: "2024-01-17",
      time: "15:00",
      location: "HR Kantoor",
      category: "task",
      priority: "medium",
      completed: false,
      description: "Documenten invullen en ondertekenen",
    },
    {
      id: "7",
      title: "Kennismaking collega's",
      date: "2024-01-18",
      time: "11:00",
      location: "Koffiebar",
      category: "intro",
      priority: "medium",
      completed: false,
      description: "Speed-dating met je naaste collega's",
    },
    {
      id: "8",
      title: "Veiligheidstraining",
      date: "2024-01-19",
      time: "09:30",
      location: "Training Center",
      category: "training",
      priority: "high",
      completed: false,
      description: "Verplichte bedrijfsveiligheidstraining",
    },
  ];

  const toggleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const pendingTasks = tasks.filter((t) => !t.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Laden van je agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Mijn Agenda
              </h1>
              <p className="text-slate-600">
                Jouw onboarding planning en taken
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold mb-1">Voortgang</h3>
                <p className="text-sm text-blue-100">
                  {completedCount} van {tasks.length} taken voltooid
                </p>
              </div>
              <div className="text-3xl font-bold tabular-nums">{Math.round(progressPercentage)}%</div>
            </div>
            <div className="relative w-full h-2 bg-blue-400/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full bg-blue-900/90 rounded-full"
              />
            </div>
          </Card>
        </motion.div>

        {/* Pending Tasks Summary */}
        {pendingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Openstaande taken
                </h3>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {pendingTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map((task, index) => {
                  const config = categoryConfig[task.category];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() => toggleTaskComplete(task.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                        `${config.bgColor} ${config.borderColor} hover:shadow-md hover:scale-[1.01]`
                      )}
                    >
                      <Circle className={cn("h-6 w-6", config.textColor)} />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          <span>{new Date(task.date).toLocaleDateString("nl-NL")}</span>
                          {task.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.time}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge className={config.textColor} variant="outline">
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Continue Section - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Klaar met je planning bekijken?
                </h3>
                <p className="text-slate-600 text-sm">
                  Ga terug naar het overzicht en sla je voortgang op
                </p>
              </div>
              <Button
                size="lg"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all gap-2"
                onClick={async () => {
                  if (!user?.id) {
                    navigate('/preboarding');
                    return;
                  }

                  setSaving(true);
                  try {
                    // Get all preboarding tiles
                    const tilesResponse = await handleAPICall(() => preboardingAPI.getTiles());

                    // Find the day1/planning tile
                    const day1Tile = tilesResponse.find((t: any) => t.tile_id === 'day1');

                    if (day1Tile) {
                      // Mark it as complete
                      await handleAPICall(() =>
                        preboardingAPI.updateProgress(user.id, day1Tile.id, true)
                      );
                    }

                    // Navigate back to preboarding
                    navigate('/preboarding');
                  } catch (error: any) {
                    console.error('Failed to save progress:', error);
                    // Navigate anyway even if save fails
                    navigate('/preboarding');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    Terug naar overzicht
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
