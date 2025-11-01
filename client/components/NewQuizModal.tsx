import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QuizCreator from '@/pages/dashboard/QuizCreator';
import { useAuth } from '@/contexts/AuthContext';

interface NewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (quiz: { title: string; description?: string; questions: string[] }) => void;
}

export function NewQuizModal({ isOpen, onClose }: NewQuizModalProps) {
  const { user } = useAuth();

  if (user?.role !== 'admin') return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gruppy-purple to-gruppy-blue rounded-xl flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 8l6 .5-4.5 3.5L18 20l-6-3-6 3 1.5-7L2 8.5 8 8 12 2z"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Nieuwe quiz</h2>
              <p className="text-sm text-muted-foreground">Maak een interactieve quiz voor je team</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Card className="p-4">
            <QuizCreator />
          </Card>
        </div>
      </div>
    </div>
  );
}
