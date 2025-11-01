import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Save,
  Edit,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { preboardingAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ContentBlock {
  id: string;
  type: "heading" | "paragraph" | "list";
  content: string;
}

export default function TileContent() {
  const { tileId } = useParams<{ tileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tile, setTile] = useState<any>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    loadTileAndContent();
  }, [tileId]);

  const loadTileAndContent = async () => {
    if (!tileId) return;

    try {
      setLoading(true);
      
      // Get all tiles and find the current one
      const tilesResponse = await preboardingAPI.getTiles();
      const currentTile = tilesResponse.data?.find((t: any) => t.id === tileId);
      
      if (!currentTile) {
        toast({
          title: "Tegel niet gevonden",
          description: "De tegel die je zoekt bestaat niet.",
          variant: "destructive",
        });
        navigate("/preboarding");
        return;
      }

      setTile(currentTile);

      // Get tile content
      const contentResponse = await preboardingAPI.getTileContent(tileId);
      const content = contentResponse.data?.content || [];
      
      if (content.length === 0) {
        // Default empty content for new tiles
        setContentBlocks([
          {
            id: crypto.randomUUID(),
            type: "heading",
            content: "Welkom!",
          },
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: "Voeg hier je informatie toe...",
          },
        ]);
      } else {
        setContentBlocks(content);
      }
    } catch (error: any) {
      console.error("Error loading tile content:", error);
      toast({
        title: "Fout bij laden",
        description: "Kon de inhoud niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tileId) return;

    try {
      setSaving(true);
      const response = await preboardingAPI.updateTileContent(tileId, contentBlocks);

      if (response.success) {
        toast({
          title: "Opgeslagen!",
          description: "De wijzigingen zijn succesvol opgeslagen.",
        });
        setEditMode(false);
      } else {
        throw new Error(response.error || "Kon niet opslaan");
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === "heading" ? "Nieuwe heading" : type === "list" ? "• Item 1\n• Item 2" : "Nieuwe paragraaf",
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setContentBlocks(
      contentBlocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter((block) => block.id !== id));
  };

  const handleComplete = async () => {
    if (!user?.id || !tileId) {
      navigate("/preboarding");
      return;
    }

    setMarkingComplete(true);
    try {
      await preboardingAPI.updateProgress(user.id, tileId, true);
      navigate("/preboarding");
    } catch (error: any) {
      console.error("Error marking tile complete:", error);
      // Navigate anyway even if save fails
      navigate("/preboarding");
    } finally {
      setMarkingComplete(false);
    }
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    if (editMode) {
      return (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: index * 0.05 }}
          className="group relative"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {block.type === "heading" ? (
                <Input
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  className="text-2xl font-bold border-2 border-indigo-200 focus:border-indigo-500"
                  placeholder="Heading..."
                />
              ) : (
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  className="min-h-[100px] border-2 border-indigo-200 focus:border-indigo-500 resize-none"
                  placeholder={
                    block.type === "list"
                      ? "• Item 1\n• Item 2"
                      : "Paragraaf tekst..."
                  }
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteBlock(block.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      );
    }

    // View mode
    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {block.type === "heading" && (
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {block.content}
          </h2>
        )}
        {block.type === "paragraph" && (
          <p className="text-lg text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
            {block.content}
          </p>
        )}
        {block.type === "list" && (
          <div className="text-lg text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
            {block.content}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/preboarding")}
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Button>

          {user?.role === "admin" && (
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      loadTileAndContent();
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Opslaan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Opslaan
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Title Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-br ${tile?.color || "from-blue-500 to-indigo-600"}`}>
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{tile?.title}</h1>
              <p className="text-lg opacity-90">{tile?.description}</p>
            </div>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border-0 shadow-lg">
            <AnimatePresence mode="popLayout">
              <div className="space-y-6">
                {contentBlocks.map((block, index) => renderBlock(block, index))}
              </div>
            </AnimatePresence>

            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-6 border-t border-slate-200 flex gap-2"
              >
                <Button
                  variant="outline"
                  onClick={() => addBlock("heading")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Heading
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addBlock("paragraph")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Paragraaf
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addBlock("list")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Lijst
                </Button>
              </motion.div>
            )}

            {!editMode && contentBlocks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>Geen inhoud beschikbaar.</p>
                {user?.role === "admin" && (
                  <Button
                    onClick={() => setEditMode(true)}
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Inhoud toevoegen
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Continue Button - Only in view mode */}
        {!editMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Klaar met lezen?
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Ga terug naar het overzicht en sla je voortgang op
                  </p>
                </div>
                <Button
                  size="lg"
                  disabled={markingComplete}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all gap-2"
                  onClick={handleComplete}
                >
                  {markingComplete ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Terug naar overzicht
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
