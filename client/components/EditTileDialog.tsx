import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { preboardingAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditTileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tile?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  };
  onSuccess: () => void;
}

const iconOptions = [
  { value: "Users", label: "Gebruikers" },
  { value: "Shield", label: "Veiligheid" },
  { value: "Calendar", label: "Kalender" },
  { value: "BookOpen", label: "Boek" },
  { value: "Briefcase", label: "Aktetas" },
  { value: "Target", label: "Doel" },
  { value: "Award", label: "Award" },
  { value: "Star", label: "Ster" },
];

const colorOptions = [
  { value: "from-blue-500 to-indigo-600", label: "Blauw" },
  { value: "from-green-500 to-emerald-600", label: "Groen" },
  { value: "from-orange-500 to-red-600", label: "Oranje" },
  { value: "from-purple-500 to-violet-600", label: "Paars" },
  { value: "from-amber-500 to-yellow-600", label: "Geel" },
  { value: "from-cyan-500 to-blue-600", label: "Cyaan" },
  { value: "from-pink-500 to-rose-600", label: "Roze" },
];

export function EditTileDialog({ open, onOpenChange, tile, onSuccess }: EditTileDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isCreateMode = !tile?.id;
  const [formData, setFormData] = useState({
    title: tile?.title || "",
    description: tile?.description || "",
    icon: tile?.icon || "Users",
    color: tile?.color || "from-blue-500 to-indigo-600",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (isCreateMode) {
        response = await preboardingAPI.createTile(formData);
      } else {
        response = await preboardingAPI.updateTile(tile!.id, formData);
      }

      if (response.success) {
        toast({
          title: isCreateMode ? "Tegel aangemaakt!" : "Tegel bijgewerkt!",
          description: isCreateMode
            ? "De nieuwe tegel is succesvol toegevoegd."
            : "De wijzigingen zijn succesvol opgeslagen.",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(response.error || `Kon tegel niet ${isCreateMode ? 'aanmaken' : 'bijwerken'}`);
      }
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} tile:`, error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tile?.id) return;

    setDeleting(true);
    try {
      const response = await preboardingAPI.deleteTile(tile.id);

      if (response.success) {
        toast({
          title: "Tegel verwijderd!",
          description: "De tegel is succesvol verwijderd.",
        });
        onSuccess();
        setShowDeleteDialog(false);
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Kon tegel niet verwijderen');
      }
    } catch (error: any) {
      console.error('Error deleting tile:', error);
      toast({
        title: "Fout bij verwijderen",
        description: error.message || "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <DialogTitle className="text-2xl">
                    {isCreateMode ? "Nieuwe tegel aanmaken" : "Tegel bewerken"}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {isCreateMode
                    ? "Maak een nieuwe tegel aan voor de preboarding pagina."
                    : "Pas de titel, beschrijving en andere eigenschappen van deze tegel aan."
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Titel
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bijv. Kennismaking met het team"
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Beschrijving
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Korte beschrijving van deze tegel..."
                    rows={4}
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="icon" className="text-sm font-semibold">
                      Icoon
                    </Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Selecteer icoon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="color" className="text-sm font-semibold">
                      Kleur thema
                    </Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Selecteer kleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full bg-gradient-to-br ${option.value}`}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                <DialogFooter>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3 w-full justify-between"
                  >
                    <div className="flex gap-3">
                      {!isCreateMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={loading}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Verwijderen
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                      >
                        Annuleren
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Opslaan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Wijzigingen opslaan
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. De tegel "{tile?.title}" wordt permanent verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                'Verwijderen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
