import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';

type Question = {
  id: string;
  text: string;
  type: 'text' | 'multiple';
  options: { id: string; text: string; image?: string; isCorrect?: boolean }[];
  image?: string;
};

export default function QuizCreator() {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  function startNewQuestion() {
    setEditingQuestion({ id: Date.now().toString(), text: '', type: 'multiple', options: [] });
  }

  function addOption(text = '') {
    if (!editingQuestion) return;
    const option = { id: Date.now().toString(), text, isCorrect: false };
    setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, option] });
  }

  function removeOption(id: string) {
    if (!editingQuestion) return;
    setEditingQuestion({ ...editingQuestion, options: editingQuestion.options.filter(o => o.id !== id) });
  }

  function toggleOptionCorrect(id: string) {
    if (!editingQuestion) return;
    // If single-correct (treat first correct as single) keep toggle behavior; for multi, allow multiple
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o),
    });
  }

  function saveQuestion() {
    if (!editingQuestion) return;
    if (!editingQuestion.text.trim()) return;
    setQuestions(prev => [editingQuestion, ...prev]);
    setEditingQuestion(null);
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function onImageChange(file?: File) {
    if (!editingQuestion || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditingQuestion({ ...editingQuestion, image: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  async function handleCreate() {
    setSaving(true);
    // Simulate save delay
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    // Here you'd normally POST to an API
    setTitle('');
    setDescription('');
    setQuestions([]);
    setEditingQuestion(null);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t('dashboard.quickActions.title') || 'Nieuwe quiz'}</h3>
          <p className="text-sm text-muted-foreground">{t('dashboard.createQuiz.description') || 'Maak een korte interactieve quiz voor je team'}</p>
        </div>
        <Badge className="bg-gruppy-purple text-white">Interactive</Badge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('dashboard.createQuiz.placeholder') || 'Bijv. Onboarding Basics'} className="text-lg font-semibold" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('dashboard.createQuiz.descriptionPlaceholder') || 'Optionele beschrijving'} />
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">{t('dashboard.createQuiz.questionsLabel') || 'Vragen'}</div>
            <div className="flex items-center gap-2">
              {!editingQuestion && <Button size="sm" onClick={startNewQuestion} className="bg-gruppy-purple text-white">Nieuwe vraag</Button>}
              {editingQuestion && <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>Annuleren</Button>}
            </div>
          </div>

          {/* Editor */}
          {editingQuestion ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-border bg-background">
              <div className="space-y-3">
                <Input value={editingQuestion.text} onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })} placeholder="Typ je vraag hier..." className="text-base" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Type</label>
                    <div className="inline-block relative">
                      <select value={editingQuestion.type} onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })} className="appearance-none px-4 py-2 rounded-md border border-border bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-gruppy-purple">
                        <option value="multiple">Meerkeuze</option>
                        <option value="text">Open vraag</option>
                      </select>
                      <svg className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <label className="text-sm">Afbeelding</label>
                    <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-border bg-muted hover:bg-muted/80 transition">
                      <input type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0])} className="hidden" />
                      <span className="text-sm text-muted-foreground">Bestand kiezen</span>
                    </label>
                    {editingQuestion.image && <img src={editingQuestion.image} alt="preview" className="h-14 rounded-md shadow-sm" />}
                  </div>
                </div>

                {editingQuestion.type === 'multiple' && (
                  <div className="space-y-2">
                    {editingQuestion.options.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleOptionCorrect(opt.id)}
                          className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-md transition',
                            opt.isCorrect ? 'bg-gruppy-purple text-white' : 'bg-muted text-muted-foreground'
                          )}
                          aria-label="Toggle correct"
                        >
                          {opt.isCorrect ? '✓' : idx + 1}
                        </button>

                        <Input value={opt.text} onChange={(e) => setEditingQuestion({ ...editingQuestion, options: editingQuestion.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o) })} placeholder="Optie tekst" />

                        <Button size="sm" variant="outline" onClick={() => removeOption(opt.id)}>Verwijder</Button>
                      </div>
                    ))}

                    <div>
                      <Button size="sm" variant="outline" onClick={() => addOption()} className="mt-1">Optie toevoegen</Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>Annuleren</Button>
                  <Button size="sm" onClick={saveQuestion} className="bg-gruppy-purple text-white">Opslaan vraag</Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              {questions.length === 0 && <div className="text-sm text-muted-foreground">{t('dashboard.createQuiz.noQuestions') || 'Nog geen vragen — voeg er één toe bovenaan.'}</div>}
              {questions.map((q) => (
                <div key={q.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{q.text}</div>
                    <div className="text-xs text-muted-foreground">{q.type === 'multiple' ? `${q.options.length} opties` : 'Open vraag'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingQuestion(q)}>Bewerk</Button>
                    <Button size="sm" variant="outline" onClick={() => removeQuestion(q.id)}>Verwijder</Button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{questions.length} vragen</div>
            <div>
              <Button variant="outline" className="mr-2" onClick={() => { setQuestions([]); setEditingQuestion(null); }}>Reset</Button>
              <Button onClick={handleCreate} className={cn('bg-gruppy-purple text-white', (saving || !title || questions.length === 0) && 'opacity-50 pointer-events-none')}>
                {saving ? t('common.loading') || 'Opslaan...' : t('dashboard.createQuiz.createButton') || 'Maak quiz'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
