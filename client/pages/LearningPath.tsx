import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  ChevronRight,
  Award,
  Target,
  Zap,
  Loader2,
  Pencil
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { learningAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EditWeekDialog } from "@/components/EditWeekDialog";

interface WeekQuiz {
  id: string;
  week: number;
  title: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
  locked: boolean;
  color: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
}

export default function LearningPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<WeekQuiz[]>([]);
  const [statistics, setStatistics] = useState({
    completedCount: 0,
    availableCount: 0,
    totalMinutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState<WeekQuiz | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLearningProgress();
    }
  }, [user?.id]);

  const loadLearningProgress = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading progress for user:', user.id);
      const response = await learningAPI.getProgress(user.id);

      console.log('API Response:', response);

      if (response.success && response.data) {
        const { progress, statistics } = response.data;

        console.log('Progress data:', progress);
        console.log('Statistics:', statistics);

        // Map progress to quiz format
        const mappedQuizzes = progress.map((p: any) => {
          console.log('Mapping progress item:', p);
          return {
            id: p.week_id,
            week: p.week_number,
            title: p.week?.title || `Week ${p.week_number}`,
            description: p.week?.description || '',
            duration: p.week?.duration || '8 min',
            level: p.week?.level || 'Beginner',
            completed: p.status === 'completed',
            locked: p.status === 'locked',
            color: p.week?.color || 'from-blue-500 to-indigo-600',
            status: p.status
          };
        });

        console.log('Mapped quizzes:', mappedQuizzes);

        setQuizzes(mappedQuizzes);
        setStatistics(statistics);
      } else {
        console.error('API response not successful:', response);
      }
    } catch (error: any) {
      console.error('Error loading learning progress:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon je leervoortgang niet laden. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-amber-100 text-amber-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "Beginner":
        return "Beginner";
      case "Intermediate":
        return "Gevorderd";
      case "Advanced":
        return "Expert";
      default:
        return level;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const handleStartQuiz = async (quiz: WeekQuiz) => {
    if (quiz.locked) return;

    if (!user?.id) {
      toast({
        title: "Niet ingelogd",
        description: "Je moet ingelogd zijn om een quiz te starten.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (quiz.status === 'unlocked') {
        await learningAPI.updateProgress(user.id, quiz.id, {
          status: 'in_progress'
        });
      }

      if (quiz.week === 1) {
        navigate('/week1');
      } else if (quiz.week === 2) {
        navigate('/week2');
      } else {
        console.log("Starting quiz:", quiz.id);
      }
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Fout",
        description: "Kon de quiz niet starten. Probeer het opnieuw.",
        variant: "destructive"
      });
    }
  };

  const handleEditWeek = (quiz: WeekQuiz, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWeek(quiz);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadLearningProgress();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Laden van je leerpad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Kies je leerpad
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Selecteer een quiz categorie om je kennis te testen en belangrijke concepten te versterken.<br />
            Elke quiz is ontworpen om boeiend en leerzaam te zijn.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
        >
          <Card className="p-6 border-0 shadow-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.completedCount}</div>
            </div>
            <p className="text-sm text-slate-600 font-medium">Voltooide Quizzen</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.availableCount}</div>
            </div>
            <p className="text-sm text-slate-600 font-medium">Beschikbare Categorieën</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.totalMinutes}</div>
            </div>
            <p className="text-sm text-slate-600 font-medium">Minuten Bespaard</p>
          </Card>
        </motion.div>

        {/* Quiz Cards */}
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">Geen leerweek gevonden.</p>
            <p className="text-slate-500 text-sm">Neem contact op met je beheerder als dit probleem aanhoudt.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {quizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={cardVariants}>
              <Card 
                className={cn(
                  "group relative overflow-hidden border-0 shadow-lg transition-all duration-300 h-full",
                  !quiz.locked && "hover:shadow-2xl",
                  quiz.locked && "opacity-60"
                )}
              >
                {/* Gradient background */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                  quiz.color,
                  !quiz.locked && "group-hover:opacity-5"
                )} />

                {/* Edit button for admins */}
                {user?.role === 'admin' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleEditWeek(quiz, e)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200 hover:border-indigo-300 flex items-center justify-center transition-all duration-200 hover:bg-indigo-50 group"
                    title="Bewerk week"
                  >
                    <Pencil className="h-4 w-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                  </motion.button>
                )}

                {/* Blur overlay for locked quizzes */}
                {quiz.locked && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-900/10 flex items-center justify-center backdrop-blur-md">
                        <Lock className="h-8 w-8 text-slate-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Voltooi vorige weken om te ontgrendelen
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-6 flex flex-col h-full relative">
                  {/* Icon and Week Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center transform transition-transform duration-300",
                      quiz.color,
                      !quiz.locked && "group-hover:scale-110"
                    )}>
                      {quiz.completed ? (
                        <CheckCircle className="h-7 w-7 text-white" />
                      ) : quiz.locked ? (
                        <Lock className="h-7 w-7 text-white" />
                      ) : (
                        <Target className="h-7 w-7 text-white" />
                      )}
                    </div>
                    
                    {quiz.completed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className={cn(
                    "text-xl font-semibold text-slate-900 mb-2 transition-colors",
                    !quiz.locked && "group-hover:text-indigo-600"
                  )}>
                    {quiz.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 flex-grow">
                    {quiz.description}
                  </p>

                  {/* Meta info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Duur:
                      </span>
                      <span className="font-semibold text-slate-700">{quiz.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Niveau:
                      </span>
                      <Badge className={getLevelColor(quiz.level)}>{getLevelLabel(quiz.level)}</Badge>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full transition-all duration-300",
                      quiz.completed && "bg-green-600 hover:bg-green-700",
                      !quiz.completed && !quiz.locked && "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                      quiz.locked && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={quiz.locked}
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    {quiz.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Voltooid
                      </>
                    ) : (
                      <>
                        <span>Start Quiz</span>
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="inline-block p-8 border-0 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Niet zeker waar te beginnen?
              </h3>
            </div>
            <p className="text-slate-600 mb-6 max-w-md">
              We raden aan om te beginnen met "Kennismaken & oefenen" om een sterke basis te leggen, en daarna verder te gaan met elk volgend onderwerp op basis van je rol en interesses.
            </p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={() => {
                const firstQuiz = quizzes.find(q => q.week === 1);
                if (firstQuiz && !firstQuiz.locked) {
                  handleStartQuiz(firstQuiz);
                }
              }}
            >
              Begin met Kennismaken & oefenen
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Edit Week Dialog */}
      {editingWeek && (
        <EditWeekDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          week={editingWeek}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
