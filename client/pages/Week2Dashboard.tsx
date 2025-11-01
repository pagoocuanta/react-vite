import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Briefcase, 
  SmilePlus, 
  BarChart3, 
  Calendar as CalendarIcon,
  ChevronRight, 
  CheckCircle, 
  ArrowLeft,
  Frown,
  Meh,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface EvaluationCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: "task" | "evaluation" | "planning";
  completed: boolean;
  color: string;
}

type SmileyRating = "sad" | "neutral" | "happy" | null;

export default function Week2Dashboard() {
  const [cards, setCards] = useState<EvaluationCard[]>([
    {
      id: "shadowing",
      title: "Meelopen",
      description: "Kies een activiteit: klantgesprek, productie, of project",
      icon: Eye,
      type: "task",
      completed: false,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "complete-task",
      title: "Eerste complete taak",
      description: "Voer zelfstandig uit en bespreek samen",
      icon: Briefcase,
      type: "task",
      completed: false,
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: "checkin",
      title: "Korte check-in",
      description: "Geef een smiley over hoe het gaat",
      icon: SmilePlus,
      type: "evaluation",
      completed: false,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "reflection",
      title: "Terugblik eerste weken",
      description: "Wat ging goed, wat wil je nog leren?",
      icon: BarChart3,
      type: "evaluation",
      completed: false,
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "planning",
      title: "Vooruitblik komende weken",
      description: "Planning van je volgende stappen",
      icon: CalendarIcon,
      type: "planning",
      completed: false,
      color: "from-violet-500 to-fuchsia-600",
    },
  ]);

  const [ratings, setRatings] = useState<Record<string, SmileyRating>>({
    checkin: null,
    reflection: null,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  const completedCount = cards.filter(c => c.completed).length;
  const progressPercentage = (completedCount / cards.length) * 100;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "task": return "Taak";
      case "evaluation": return "Evaluatie";
      case "planning": return "Planning";
      default: return type;
    }
  };

  const handleCardComplete = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, completed: true } : card
    ));
  };

  const handleSmileySelect = (cardId: string, rating: SmileyRating) => {
    setRatings(prev => ({ ...prev, [cardId]: rating }));
  };

  const getSmileyColor = (rating: SmileyRating, currentRating: SmileyRating) => {
    if (rating === currentRating) {
      switch (rating) {
        case "sad": return "fill-red-400 text-red-500";
        case "neutral": return "fill-amber-400 text-amber-500";
        case "happy": return "fill-green-400 text-green-500";
        default: return "text-slate-300";
      }
    }
    return "text-slate-300 hover:text-slate-400";
  };

  // Determine which cards should be visible based on completion
  const getVisibleCards = () => {
    const visible: EvaluationCard[] = [];
    for (let i = 0; i < cards.length; i++) {
      visible.push(cards[i]);
      // If current card is not completed, don't show next cards
      if (!cards[i].completed && i > 0) {
        break;
      }
    }
    return visible;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/learning-path">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Terug naar leerpad
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full mb-4">
            <span className="font-semibold">Week 2</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Zelfstandig aan de slag
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Deze week werk je meer zelfstandig en evalueren we samen je voortgang
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Week 2 voortgang</span>
            <span className="text-sm font-semibold text-purple-600">
              {completedCount} van {cards.length} voltooid
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-600"
            />
          </div>
        </motion.div>

        {/* Evaluation Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
        >
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, index) => {
              const Icon = card.icon;
              const isLocked = index > 0 && !cards[index - 1].completed;
              
              return (
                <motion.div 
                  key={card.id} 
                  variants={itemVariants}
                  layout
                >
                  <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="p-6 flex flex-col h-full relative">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-medium"
                        >
                          {getTypeLabel(card.type)}
                        </Badge>
                        <span className="text-2xl font-bold text-slate-200">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Icon and title */}
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div 
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      {/* For evaluation cards, show smiley rating */}
                      {card.type === "evaluation" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mb-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <p className="text-xs text-slate-600 mb-3 font-medium">Je beoordeling:</p>
                          <div className="flex gap-3 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSmileySelect(card.id, "sad")}
                              className="transition-all"
                            >
                              <Frown
                                className={`h-8 w-8 ${getSmileyColor("sad", ratings[card.id])}`}
                              />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSmileySelect(card.id, "neutral")}
                              className="transition-all"
                            >
                              <Meh
                                className={`h-8 w-8 ${getSmileyColor("neutral", ratings[card.id])}`}
                              />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSmileySelect(card.id, "happy")}
                              className="transition-all"
                            >
                              <Smile
                                className={`h-8 w-8 ${getSmileyColor("happy", ratings[card.id])}`}
                              />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* CTA */}
                      <Button
                        variant="ghost"
                        className="w-full group-hover:bg-slate-100 transition-colors justify-between mt-auto"
                        onClick={() => handleCardComplete(card.id)}
                        disabled={card.completed}
                      >
                        {card.completed ? (
                          <>
                            <span className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Voltooid
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {card.type === "evaluation" ? "Invullen" : "Start"}
                            </span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Completion CTA */}
        <AnimatePresence>
          {completedCount === cards.length && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Card className="inline-block p-8 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-fuchsia-50">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Week 2 voltooid!
                  </h3>
                </motion.div>
                <p className="text-slate-600 mb-6 max-w-md">
                  Geweldig werk! Je hebt alle activiteiten afgerond. Ga verder naar de volgende week.
                </p>
                <Link to="/learning-path">
                  <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white">
                    Terug naar Leerpad
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
