import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { learningAPI, preboardingAPI, handleAPICall } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

interface QuizQuestion {
  id: number;
  member: TeamMember;
  options: string[];
  correctAnswer: string;
}

interface QuizAnswer {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  options: string[];
}

export default function TeamQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah van der Berg",
      role: "Team Lead",
      department: "Operations",
    },
    {
      id: "2",
      name: "Mark de Vries",
      role: "Senior Developer",
      department: "Engineering",
    },
    {
      id: "3",
      name: "Lisa Jansen",
      role: "HR Specialist",
      department: "Human Resources",
    },
  ];

  const generateQuestions = (): QuizQuestion[] => {
    return teamMembers.map((member, index) => {
      const otherMembers = teamMembers.filter(m => m.id !== member.id);
      const options = [
        member.name,
        ...otherMembers.map(m => m.name)
      ].sort(() => Math.random() - 0.5);

      return {
        id: index,
        member,
        options,
        correctAnswer: member.name,
      };
    });
  };

  const [questions] = useState<QuizQuestion[]>(generateQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showReview, setShowReview] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Track the answer
    const answerRecord: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      question: `Wat is de naam van deze collega? (${currentQuestion.member.role})`,
      options: currentQuestion.options,
    };

    setAnswers([...answers, answerRecord]);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setShowResults(true);

      // Mark Week 1 as completed in the database
      if (user?.id) {
        try {
          // Get Week 1 ID first
          const weeksResponse = await handleAPICall(() => learningAPI.getWeeks());
          const week1 = weeksResponse.find((w: any) => w.week_number === 1);

          if (week1) {
            // Calculate time spent (in seconds, convert to minutes)
            const timeSpent = Math.ceil((answers.length + 1) * 30 / 60); // Rough estimate: 30 sec per question

            // Create quiz attempt record
            await handleAPICall(() => learningAPI.createQuizAttempt({
              userId: user.id,
              weekId: week1.id,
              weekNumber: 1,
              score: score,
              totalQuestions: questions.length,
              answers: answers.reduce((acc, ans) => ({
                ...acc,
                [ans.questionId]: {
                  userAnswer: ans.userAnswer,
                  correctAnswer: ans.correctAnswer,
                  isCorrect: ans.isCorrect
                }
              }), {}),
              duration: (answers.length + 1) * 30 // seconds
            }));

            console.log('Quiz completion saved! Week 1 marked as completed.');

            // Also mark the preboarding "team" tile as complete
            try {
              const tilesResponse = await handleAPICall(() => preboardingAPI.getTiles());
              const teamTile = tilesResponse.find((t: any) => t.tile_id === 'team');

              if (teamTile) {
                await handleAPICall(() => preboardingAPI.updateProgress(user.id, teamTile.id, true));
                console.log('Preboarding team tile marked as complete');
              }
            } catch (error) {
              console.error('Failed to mark preboarding tile as complete:', error);
            }

            toast({
              title: "Voortgang opgeslagen",
              description: "Je hebt Week 1 voltooid! Week 2 is nu ontgrendeld.",
            });
          }
        } catch (error) {
          console.error('Failed to save quiz completion:', error);
          // Don't show error to user, quiz results still display
        }
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setShowReview(false);
    setAnswers([]);
  };

  const getScoreData = () => {
    const percentage = (score / questions.length) * 100;

    if (percentage === 100) {
      return {
        emoji: "😄",
        message: "Perfect! Je kent het team al goed!",
        subtitle: "Je hebt de teamquiz afgerond",
        gradient: "from-green-500 to-emerald-600"
      };
    }
    if (percentage >= 66) {
      return {
        emoji: "😊",
        message: "Geweldig! Je bent goed op weg!",
        subtitle: "Je hebt de teamquiz afgerond",
        gradient: "from-blue-500 to-indigo-600"
      };
    }
    if (percentage >= 33) {
      return {
        emoji: "😐",
        message: "Niet slecht! Blijf oefenen!",
        subtitle: "Je hebt de teamquiz afgerond",
        gradient: "from-amber-500 to-orange-600"
      };
    }
    return {
      emoji: "😢",
      message: "Geen zorgen, je leert ze snel kennen!",
      subtitle: "Je hebt de teamquiz afgerond",
      gradient: "from-slate-500 to-slate-600"
    };
  };

  // Review screen showing all answers
  if (showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setShowReview(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar resultaten
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Je antwoorden</h2>
            <p className="text-slate-600">Bekijk welke vragen je goed en fout had</p>
          </motion.div>

          <div className="space-y-6">
            {answers.map((answer, index) => (
              <motion.div
                key={answer.questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{answer.question}</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-600">Jouw antwoord: </span>
                            <span className={answer.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {answer.userAnswer}
                            </span>
                          </div>
                          {!answer.isCorrect && (
                            <div>
                              <span className="text-slate-600">Correct antwoord: </span>
                              <span className="text-green-600 font-medium">{answer.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={answer.isCorrect ? "default" : "destructive"} className="ml-auto">
                        {answer.isCorrect ? 'Juist' : 'Fout'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-600 mb-2">Keuzes:</p>
                      {answer.options.map((option) => {
                        const isUserAnswer = option === answer.userAnswer;
                        const isCorrectAnswer = option === answer.correctAnswer;

                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              isCorrectAnswer
                                ? 'bg-green-50 border-green-200'
                                : isUserAnswer && !answer.isCorrect
                                ? 'bg-red-50 border-red-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${
                                isCorrectAnswer ? 'text-green-700' : isUserAnswer ? 'text-red-700' : 'text-slate-600'
                              }`}>
                                {option}
                              </span>
                              {isCorrectAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {isUserAnswer && !answer.isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 border-2"
              size="lg"
              onClick={handleRestart}
            >
              Opnieuw proberen
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="lg"
              onClick={() => navigate('/learning-path')}
            >
              Terug naar leerpad
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scoreData = getScoreData();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20" />
              </div>

              {/* Header Section */}
              <div className="relative p-12 text-center">
                {/* Floating Emoji with Pulse Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    scale: { delay: 0.2, type: "spring", stiffness: 200, damping: 15 },
                    rotate: { delay: 0.2, type: "spring", stiffness: 200, damping: 15 },
                    y: { delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="text-9xl mb-6 inline-block"
                  style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))" }}
                >
                  {scoreData.emoji}
                </motion.div>

                {/* Title with Gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h2 className={`text-4xl font-bold mb-3 bg-gradient-to-r ${scoreData.gradient} bg-clip-text text-transparent`}>
                    Quiz Voltooid!
                  </h2>
                  <p className="text-slate-600 text-lg">
                    {scoreData.subtitle}
                  </p>
                </motion.div>

                {/* Score Display with Circular Progress Effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mt-8 mb-6"
                >
                  <div className="inline-block relative">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-100"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / questions.length) * 283} 283`}
                        initial={{ strokeDasharray: "0 283" }}
                        animate={{ strokeDasharray: `${(score / questions.length) * 283} 283` }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={scoreData.gradient.split(' ')[0].replace('from-', '')} stopColor="currentColor" />
                          <stop offset="100%" className={scoreData.gradient.split(' ')[2]} stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Score Text */}
                    <div className="relative w-32 h-32 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                        className="text-5xl font-bold text-slate-900"
                      >
                        {score}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-sm text-slate-500 font-medium"
                      >
                        van {questions.length}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="text-xl text-slate-700 font-medium"
                >
                  {scoreData.message}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="p-8 bg-slate-50/50 space-y-3"
              >
                <Button
                  className={`w-full bg-gradient-to-r ${scoreData.gradient} hover:opacity-90 text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]`}
                  size="lg"
                  onClick={() => setShowReview(true)}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Bekijk antwoorden
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02]"
                  size="lg"
                  onClick={() => navigate('/learning-path')}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Terug naar leerpad
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-slate-200 hover:bg-white hover:border-slate-300 transition-all hover:scale-[1.02]"
                  size="lg"
                  onClick={handleRestart}
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Opnieuw proberen
                </Button>
              </motion.div>
            </Card>
          </motion.div>

          {/* Floating Confetti Effect for Perfect Score */}
          {score === questions.length && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: "100vh",
                    x: `${Math.random() * 100}vw`,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{
                    y: "-10vh",
                    rotate: 360,
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    top: 0,
                    left: 0
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/week1')}
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Week 1
          </Button>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              Vraag {currentQuestionIndex + 1} van {questions.length}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              Score: {score}/{questions.length}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 shadow-2xl p-8 mb-6">
              {/* Question Header */}
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-indigo-100 text-indigo-700 px-4 py-1">
                  Wie is wie?
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Wat is de naam van deze collega?
                </h2>
              </div>

              {/* Team Member Display */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 p-6">
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-lg">
                        <AvatarImage src={currentQuestion.member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-semibold">
                          {currentQuestion.member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <p className="text-indigo-700 font-medium mb-1">{currentQuestion.member.role}</p>
                    <Badge variant="secondary">{currentQuestion.member.department}</Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isSelected = option === selectedAnswer;
                  const showAsCorrect = isAnswered && isCorrect;
                  const showAsWrong = isAnswered && isSelected && !isCorrect;

                  return (
                    <motion.div
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left p-4 h-auto transition-all duration-300 ${
                          showAsCorrect
                            ? "bg-green-50 border-green-500 text-green-700 hover:bg-green-50"
                            : showAsWrong
                            ? "bg-red-50 border-red-500 text-red-700 hover:bg-red-50"
                            : isAnswered
                            ? "opacity-50"
                            : "hover:bg-indigo-50 hover:border-indigo-300"
                        }`}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{option}</span>
                          {(showAsCorrect || showAsWrong) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {showAsCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </motion.div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Next Button */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      size="lg"
                      onClick={handleNext}
                    >
                      {isLastQuestion ? "Bekijk Resultaten" : "Volgende Vraag"}
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
