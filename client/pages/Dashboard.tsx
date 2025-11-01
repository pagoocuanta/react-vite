import React, { useMemo, useState } from 'react';
import { CheckCircle, Clock, Users, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressCard from './dashboard/ProgressCard';
import TaskList, { Task } from './dashboard/TaskList';
import QuizCreator from './dashboard/QuizCreator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewShiftModal } from '@/components/NewShiftModal';
import { NewQuizModal } from '@/components/NewQuizModal';

function KPI({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm flex flex-col items-start gap-2 animate-fade-in transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-3 w-full justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-gruppy-purple" />
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: t('dashboard.tasks.example1') || 'Complete profile setup', completed: true },
    { id: '2', title: t('dashboard.tasks.example2') || 'Take welcome quiz', completed: true },
    { id: '3', title: t('dashboard.tasks.example3') || 'Connect your team', completed: false },
    { id: '4', title: t('dashboard.tasks.example4') || 'Customize dashboard', completed: false },
    { id: '5', title: t('dashboard.tasks.example5') || 'Set up notifications', completed: false },
  ]);

  const summary = useMemo(() => ({
    completed: tasks.filter(t => t.completed).length,
    inProgress: Math.max(0, tasks.filter(t => !t.completed).length - 1),
    teamMembers: 12,
    completionRate: Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100),
  }), [tasks]);

  const onboardingProgress = useMemo(() => (tasks.filter(t => t.completed).length / tasks.length) * 100, [tasks]);

  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const [isNewQuizOpen, setIsNewQuizOpen] = useState(false);

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ font: '700 32px/60px __Inter_d65c78, sans-serif' }} className="font-bold text-foreground">Welkom terug, Sarah</h1>
          <p style={{ color: 'rgb(105, 111, 140)', fontWeight: 400, marginTop: '4px', textDecoration: 'rgb(105, 111, 140)', fontSize: '16px', lineHeight: '14px' }} className="mt-1">Ga verder met je onboarding</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI icon={CheckCircle} label={t('dashboard.kpi.completed') || 'Completed'} value={summary.completed} />
          <KPI icon={Clock} label={t('dashboard.kpi.inProgress') || 'In Progress'} value={summary.inProgress} />
          <KPI icon={Users} label={t('dashboard.kpi.teamMembers') || 'Team Members'} value={summary.teamMembers} />
          <KPI icon={BarChart2} label={t('dashboard.kpi.completionRate') || 'Completion Rate'} value={`${summary.completionRate}%`} />
        </div>

        <ProgressCard title={t('dashboard.progress.title')} percent={onboardingProgress} subtitle={`${Math.round(onboardingProgress)}%`} />

        <TaskList tasks={tasks} onToggle={toggleTask} />

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">{t('dashboard.notes.title') || 'Notes'}</h3>
          <p className="text-sm text-muted-foreground">{t('dashboard.notes.description') || 'Keep track of important onboarding notes here. This panel is intentionally minimal to keep focus on actions and progress.'}</p>
        </Card>
      </div>
    </div>
  );
}
