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
import { Loader2, Save, Sparkles, Trash2, Users } from "lucide-react";
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

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar?: string;
}

interface EditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  onSuccess: () => void;
  onUpdate: (memberId: string, data: Partial<TeamMember>) => Promise<void>;
  onCreate: (data: Omit<TeamMember, 'id'>) => Promise<void>;
  onDelete?: (memberId: string) => Promise<void>;
}

export function EditTeamMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
  onUpdate,
  onCreate,
  onDelete,
}: EditTeamMemberDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isCreateMode = !member?.id;

  const [formData, setFormData] = useState({
    name: member?.name || "",
    role: member?.role || "",
    department: member?.department || "",
    email: member?.email || "",
    phone: member?.phone || "",
    location: member?.location || "Amsterdam HQ",
    bio: member?.bio || "",
    avatar: member?.avatar || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreateMode) {
        await onCreate(formData);
        toast({
          title: "Teamlid toegevoegd!",
          description: "Het nieuwe teamlid is succesvol toegevoegd.",
        });
      } else {
        await onUpdate(member!.id!, formData);
        toast({
          title: "Teamlid bijgewerkt!",
          description: "De wijzigingen zijn succesvol opgeslagen.",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} team member:`, error);
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
    if (!member?.id || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(member.id);
      toast({
        title: "Teamlid verwijderd!",
        description: "Het teamlid is succesvol verwijderd.",
      });
      onSuccess();
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting team member:', error);
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
    <>
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
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <DialogTitle className="text-2xl">
                      {isCreateMode ? "Nieuw teamlid toevoegen" : "Teamlid bewerken"}
                    </DialogTitle>
                  </div>
                  <DialogDescription>
                    {isCreateMode
                      ? "Voeg een nieuw teamlid toe aan de 'Wie is wie in jouw team' pagina."
                      : "Pas de gegevens van dit teamlid aan."
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
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Naam *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Bijv. Sarah van der Berg"
                      className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="role" className="text-sm font-semibold">
                        Functie *
                      </Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Bijv. Team Lead"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="department" className="text-sm font-semibold">
                        Afdeling *
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Bijv. Operations"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="email" className="text-sm font-semibold">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="naam@company.nl"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="phone" className="text-sm font-semibold">
                        Telefoon *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+31 6 1234 5678"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="location" className="text-sm font-semibold">
                      Locatie *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Bijv. Amsterdam HQ"
                      className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="bio" className="text-sm font-semibold">
                      Bio *
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Korte beschrijving van deze persoon..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </motion.div>

                  <DialogFooter>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex gap-3 w-full justify-between"
                    >
                      <div className="flex gap-3">
                        {!isCreateMode && onDelete && (
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
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. Het teamlid "{member?.name}" wordt permanent verwijderd.
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
    </>
  );
}
