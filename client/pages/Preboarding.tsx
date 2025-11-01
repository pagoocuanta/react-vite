import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Calendar, ChevronRight, CheckCircle, ArrowLeft, Mail, Phone, MapPin, Pencil, BookOpen, Briefcase, Target, Award, Star, Loader2, Sparkles, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { EditTileDialog } from "@/components/EditTileDialog";
import { EditTeamMemberDialog } from "@/components/EditTeamMemberDialog";
import { preboardingAPI, learningAPI, teamMembersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LearningTile {
  id: string;
  tile_id: string;
  title: string;
  description: string;
  icon: any;
  iconName?: string;
  completed: boolean;
  color: string;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Users,
  Shield,
  Calendar,
  BookOpen,
  Briefcase,
  Target,
  Award,
  Star,
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  bio: string;
}

// Default tile definitions with icons
const DEFAULT_TILES: LearningTile[] = [
  {
    id: "team",
    title: "Kennismaking met het team",
    description: "Bekijk wie jouw eerste collega's zijn (1-4 personen)",
    icon: Users,
    completed: false,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "safety",
    title: "Veiligheid en praktische afspraken",
    description: "Lees de huisregels, werktijden en praktische info",
    icon: Shield,
    completed: false,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "day1",
    title: "Planning van dag 1",
    description: "Bekijk wat je kunt verwachten op je eerste werkdag",
    icon: Calendar,
    completed: false,
    color: "from-purple-500 to-violet-600",
  },
];

export default function Preboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [tiles, setTiles] = useState<LearningTile[]>(DEFAULT_TILES);
  const [loading, setLoading] = useState(true);
  const [editingTile, setEditingTile] = useState<LearningTile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

  // Load team members from database
  const loadTeamMembers = async () => {
    try {
      const response = await teamMembersAPI.getMembers();
      if (response.success && response.data) {
        setTeamMembers(response.data);
      }
    } catch (error: any) {
      console.error('Error loading team members:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon de teamleden niet laden.",
        variant: "destructive"
      });
    }
  };

  // Load team members on mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const completedCount = tiles.filter(t => t.completed).length;
  const progressPercentage = tiles.length > 0 ? (completedCount / tiles.length) * 100 : 0;

  // Load tiles from database
  useEffect(() => {
    loadTiles();
  }, []);

  // Reload tiles when user returns to this page (to check for completed tiles)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadTiles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Also reload when navigating back to this page
  useEffect(() => {
    // Reload tiles when component mounts or when location changes
    loadTiles();
  }, [location]);

  const loadTiles = async () => {
    try {
      setLoading(true);
      const [tilesResponse, progressResponse] = await Promise.all([
        preboardingAPI.getTiles(),
        user?.id ? preboardingAPI.getProgress(user.id) : Promise.resolve({ success: true, data: [] })
      ]);

      // Create a map of tile_id to completion status
      const progressData: Record<string, boolean> = {};
      if (progressResponse.success && progressResponse.data) {
        progressResponse.data.forEach((p: any) => {
          progressData[p.tile_id] = p.completed;
        });
      }
      setProgressMap(progressData);

      if (tilesResponse.success && tilesResponse.data && tilesResponse.data.length > 0) {
        const mappedTiles = tilesResponse.data.map((tile: any) => ({
          id: tile.id,
          tile_id: tile.tile_id,
          title: tile.title,
          description: tile.description,
          icon: iconMap[tile.icon] || Users,
          iconName: tile.icon,
          completed: progressData[tile.id] || false,
          color: tile.color,
        }));
        setTiles(mappedTiles);
      }
    } catch (error: any) {
      console.error('Error loading tiles:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon de tegels niet laden. Standaard tegels worden gebruikt.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTile = (tile: LearningTile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTile(tile);
    setIsEditDialogOpen(true);
  };

  const handleCreateTile = () => {
    setEditingTile(null);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadTiles();
  };

  const markTileComplete = async (tileId: string) => {
    if (!user?.id) return;

    try {
      await preboardingAPI.updateProgress(user.id, tileId, true);

      // Update local state
      setTiles(prev =>
        prev.map(tile =>
          tile.id === tileId ? { ...tile, completed: true } : tile
        )
      );
      setProgressMap(prev => ({ ...prev, [tileId]: true }));
    } catch (error: any) {
      console.error('Error updating progress:', error);
    }
  };

  // Auto-redirect to Team Quiz when all preboarding tasks are completed (only if quiz not yet attempted)
  useEffect(() => {
    const checkQuizAndRedirect = async () => {
      if (completedCount === tiles.length && tiles.length > 0 && activeTile === null && user?.id) {
        try {
          // Check if user has already attempted the Week 1 quiz
          const attempts = await learningAPI.getQuizAttempts(user.id, 1);

          // Only redirect if no quiz attempt exists
          if (!attempts || attempts.length === 0) {
            const timer = setTimeout(() => {
              navigate('/week1/team-quiz');
            }, 1500); // 1.5 second delay to show completion
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error('Error checking quiz attempts:', error);
        }
      }
    };

    checkQuizAndRedirect();
  }, [completedCount, tiles.length, activeTile, navigate, user]);

  const handleTileClick = (tile: LearningTile) => {
    // Special handling for specific tiles
    if (tile.tile_id === 'team') {
      // Show team intro page inline
      setActiveTile('team');
      return;
    }

    if (tile.tile_id === 'day1') {
      // Navigate to agenda page
      navigate('/agenda');
      return;
    }

    // For other tiles, navigate to the tile content page
    navigate(`/preboarding/tile/${tile.id}`);
  };

  const handleBackToOverview = () => {
    setActiveTile(null);
  };

  const handleCompleteTeam = async () => {
    const teamTile = tiles.find(t => t.tile_id === 'team');
    if (teamTile) {
      await markTileComplete(teamTile.id);
      // Navigate back to overview to see progress
      setTimeout(() => {
        setActiveTile(null);
      }, 500);
    } else {
      setActiveTile(null);
    }
  };

  const handleEditMember = (member: TeamMember, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingMember(member);
    setIsMemberDialogOpen(true);
  };

  const handleCreateMember = () => {
    setEditingMember(null);
    setIsMemberDialogOpen(true);
  };

  const handleUpdateMember = async (memberId: string, data: Partial<TeamMember>) => {
    const response = await teamMembersAPI.updateMember(memberId, data);
    if (!response.success) {
      throw new Error(response.error || 'Kon teamlid niet bijwerken');
    }
  };

  const handleCreateMemberSubmit = async (data: Omit<TeamMember, 'id'>) => {
    const response = await teamMembersAPI.createMember(data);
    if (!response.success) {
      throw new Error(response.error || 'Kon teamlid niet aanmaken');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const response = await teamMembersAPI.deleteMember(memberId);
    if (!response.success) {
      throw new Error(response.error || 'Kon teamlid niet verwijderen');
    }
  };

  const handleMemberSuccess = () => {
    loadTeamMembers();
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Laden van preboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTile === 'team' ? (
            <motion.div
              key="team-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Back button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Button variant="ghost" className="gap-2" onClick={handleBackToOverview}>
                  <ArrowLeft className="h-4 w-4" />
                  Terug naar overzicht
                </Button>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Wie is wie in jouw team?
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Maak kennis met je directe collega's en belangrijkste contactpersonen
                </p>
              </motion.div>

              {/* Admin: Create New Member Button */}
              {user?.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 flex justify-end"
                >
                  <Button
                    onClick={handleCreateMember}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nieuw teamlid toevoegen
                  </Button>
                </motion.div>
              )}

              {/* Team Members Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {teamMembers.map((member) => (
                  <motion.div key={member.id} variants={cardVariants}>
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative">
                      {/* Admin Edit Button */}
                      {user?.role === 'admin' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleEditMember(member, e)}
                          title="Bewerk teamlid"
                        >
                          <Pencil className="h-4 w-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                        </motion.button>
                      )}
                      <div className="p-6">
                        {/* Avatar and basic info */}
                        <div className="flex flex-col items-center text-center mb-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Avatar className="h-24 w-24 mb-4 ring-4 ring-slate-100 group-hover:ring-indigo-100 transition-all">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-semibold">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>

                          <h3 className="text-xl font-semibold text-slate-900 mb-1">
                            {member.name}
                          </h3>
                          <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                          <Badge variant="secondary" className="mb-3">
                            {member.department}
                          </Badge>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {member.bio}
                          </p>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-4 w-4 text-indigo-600" />
                            </div>
                            <a
                              href={`mailto:${member.email}`}
                              className="text-slate-600 hover:text-indigo-600 transition-colors truncate"
                            >
                              {member.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <a
                              href={`tel:${member.phone}`}
                              className="text-slate-600 hover:text-green-600 transition-colors"
                            >
                              {member.phone}
                            </a>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-slate-600">{member.location}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Next steps CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <Card className="inline-block p-8 border-0 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-slate-900">
                      Je hebt je team ontmoet!
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-6 max-w-md">
                    Nu je weet wie je teamleden zijn, kun je verder met de volgende stap in je onboarding
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleBackToOverview}>
                      Terug naar overzicht
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={handleCompleteTeam}
                    >
                      Volgende stap
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="overview-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1"></div>
                  <div className="flex-1 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                      Voordat je start
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                      Maak kennis met je nieuwe werkplek
                    </p>
                  </div>
                  <div className="flex-1 flex justify-end">
                    {user?.role === 'admin' && completedCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!user?.id) return;

                          try {
                            // Reset all tile progress
                            for (const tile of tiles) {
                              await preboardingAPI.updateProgress(user.id, tile.id, false);
                            }

                            // Reload tiles
                            await loadTiles();
                          } catch (error) {
                            console.error('Error resetting progress:', error);
                          }
                        }}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Reset voortgang
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-md mx-auto mb-12"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Je voortgang</span>
                  <span className="text-sm font-semibold text-indigo-600">{completedCount} van {tiles.length} voltooid</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  />
                </div>

                {/* Show Start Quiz button when all tiles are complete */}
                {completedCount === tiles.length && tiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 text-center"
                  >
                    <p className="text-sm text-slate-600 mb-3">🎉 Alle tegels voltooid!</p>
                    <Button
                      onClick={() => navigate('/week1/team-quiz')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      Start Teamquiz
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              {/* Create tile button for admins */}
              {user?.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="max-w-7xl mx-auto mb-6"
                >
                  <Button
                    onClick={handleCreateTile}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Nieuwe tegel aanmaken
                  </Button>
                </motion.div>
              )}

              {/* Learning Path Tiles */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {tiles.map((tile, index) => {
                  const Icon = tile.icon;
                  return (
                    <motion.div key={tile.id} variants={itemVariants}>
                      <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                        {/* Edit button for admins */}
                        {user?.role === 'admin' && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleEditTile(tile, e)}
                            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200 hover:border-indigo-300 flex items-center justify-center transition-all duration-200 hover:bg-indigo-50 group/edit"
                            title="Bewerk tegel"
                          >
                            <Pencil className="h-4 w-4 text-slate-600 group-hover/edit:text-indigo-600 transition-colors" />
                          </motion.button>
                        )}

                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        <div className="p-6 flex flex-col h-full relative">
                          {/* Icon */}
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tile.color} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-8 w-8 text-white" />
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
                            onClick={() => handleTileClick(tile)}
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
                                <span>Bekijk</span>
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

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <Card className="inline-block p-6 border-0 shadow-lg">
                  <p className="text-slate-600 mb-4">
                    Heb je vragen? Neem contact op met je leidinggevende
                  </p>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Contact opnemen
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit/Create Tile Dialog */}
      <EditTileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tile={editingTile ? {
          id: editingTile.id,
          title: editingTile.title,
          description: editingTile.description,
          icon: editingTile.iconName || 'Users',
          color: editingTile.color,
        } : undefined}
        onSuccess={handleEditSuccess}
      />

      <EditTeamMemberDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        member={editingMember || undefined}
        onSuccess={handleMemberSuccess}
        onUpdate={handleUpdateMember}
        onCreate={handleCreateMemberSubmit}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}
