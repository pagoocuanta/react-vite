import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Book, Coffee, Settings, ChevronRight, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LearningTile {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  color: string;
}

export default function Week1Dashboard() {
  const navigate = useNavigate();
  const [tiles] = useState<LearningTile[]>([
    {
      id: "team-rest",
      title: "Wie is wie in jouw team?",
      description: "Een snelle quiz om jouw team te leren kennen",
      icon: Users,
      completed: false,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "first-task",
      title: "Eerste deel van een taak",
      description: "Leer stap voor stap hoe het werkt",
      icon: Book,
      completed: false,
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "coffee",
      title: "Lunch of koffiemoment",
      description: "Een informeel gesprek met het team",
      icon: Coffee,
      completed: false,
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "systems",
      title: "Belangrijkste werkwijzen of systemen",
      description: "Leer hoe we hier werken",
      icon: Settings,
      completed: false,
      color: "from-green-500 to-emerald-600",
    },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
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

  const completedCount = tiles.filter(t => t.completed).length;
  const progressPercentage = (completedCount / tiles.length) * 100;

  const handleTileClick = (tileId: string) => {
    if (tileId === "team-rest") {
      navigate('/week1/team-quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Terug naar dashboard
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
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full mb-4">
            <span className="font-semibold">Week 1</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Kennismaken &amp; oefenen
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Deze week leer je je collega's beter kennen en maak je kennis met je eerste taken
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
            <span className="text-sm font-medium text-slate-600">Week 1 voortgang</span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedCount} van {tiles.length} voltooid
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          </div>
        </motion.div>

        {/* Learning Path Tiles */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <motion.div key={tile.id} variants={itemVariants}>
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="p-6 flex flex-col h-full relative">
                    {/* Header with icon and number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tile.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-slate-200">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                      {tile.description}
                    </p>

                    {/* CTA */}
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-slate-100 transition-colors justify-between"
                      onClick={() => handleTileClick(tile.id)}
                    >
                      {tile.completed ? (
                        <>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Voltooid
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Begin</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tips card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Tip voor deze week
                </h3>
                <p className="text-slate-600">
                  Maak notities van belangrijke informatie en stel veel vragen. Er zijn geen domme vragen tijdens je eerste week!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
