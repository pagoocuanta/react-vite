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
import { Loader2, Save, Sparkles } from "lucide-react";
import { learningAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EditWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week: {
    id: string;
    week: number;
    title: string;
    description: string;
    duration: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    color: string;
  };
  onSuccess: () => void;
}

const levelOptions = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Gevorderd" },
  { value: "Advanced", label: "Expert" },
];

const colorOptions = [
  { value: "from-blue-500 to-indigo-600", label: "Blauw" },
  { value: "from-green-500 to-emerald-600", label: "Groen" },
  { value: "from-orange-500 to-red-600", label: "Oranje" },
  { value: "from-purple-500 to-pink-600", label: "Paars" },
  { value: "from-amber-500 to-yellow-600", label: "Geel" },
  { value: "from-cyan-500 to-blue-600", label: "Cyaan" },
];

export function EditWeekDialog({ open, onOpenChange, week, onSuccess }: EditWeekDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: week.title,
    description: week.description,
    duration: week.duration,
    level: week.level,
    color: week.color,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await learningAPI.updateWeek(week.id, formData);

      if (response.success) {
        toast({
          title: "Week bijgewerkt!",
          description: "De wijzigingen zijn succesvol opgeslagen.",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Kon week niet bijwerken");
      }
    } catch (error: any) {
      console.error("Error updating week:", error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                  <DialogTitle className="text-2xl">Week {week.week} bewerken</DialogTitle>
                </div>
                <DialogDescription>
                  Pas de titel, beschrijving en andere eigenschappen van deze leerweek aan.
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
                    placeholder="Bijv. Week 1: Kennismaken & oefenen"
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
                    placeholder="Korte beschrijving van deze leerweek..."
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
                    <Label htmlFor="duration" className="text-sm font-semibold">
                      Duur
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Bijv. 8 min"
                      className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="level" className="text-sm font-semibold">
                      Niveau
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Selecteer niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
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

                <DialogFooter>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex gap-3 w-full sm:w-auto"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                      className="flex-1 sm:flex-none"
                    >
                      Annuleren
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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
                  </motion.div>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
