import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export type Task = { id: string; title: string; completed?: boolean };

import { useLanguage } from '@/contexts/LanguageContext';

export default function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  const { t } = useLanguage();
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{t('dashboard.tasks.title')}</h3>
        <div className="text-sm text-muted-foreground">{completedCount} / {tasks.length} voltooid</div>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-muted transition-colors animate-fade-in">
            <div className="flex items-center gap-3">
              <Checkbox checked={!!task.completed} onCheckedChange={() => onToggle(task.id)} />
              <div className={task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}>{task.title}</div>
            </div>
            {task.completed ? <Badge className="bg-gruppy-green text-white">{t('dashboard.kpi.completed') || 'Done'}</Badge> : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
