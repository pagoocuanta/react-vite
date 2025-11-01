import React from 'react';
import { Card } from '@/components/ui/card';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ProgressCard({ title, percent, subtitle }: { title?: string; percent: number; subtitle?: string }) {
  const { t } = useLanguage();
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ color: 'rgba(27, 28, 34, 1)', fontSize: 17, fontWeight: 600, lineHeight: '20px' }}>{title || t('dashboard.progress.title')}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
        </div>
        <div className="text-sm font-semibold">{pct}%</div>
      </div>

      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gruppy-blue transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
