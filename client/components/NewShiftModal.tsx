import { useState } from 'react';
import { X, Calendar, User, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@shared/api';

interface NewShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: {
    employeeId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
    location?: string;
    notes?: string;
  }) => void;
  teamMembers: UserType[];
}

const shiftTypes = {
  ochtend: { 
    label: 'Ochtend', 
    color: 'bg-gruppy-blue text-white', 
    lightColor: 'bg-gruppy-blue-light text-gruppy-blue',
    icon: '🌅'
  },
  avond: { 
    label: 'Avond', 
    color: 'bg-gruppy-orange text-white', 
    lightColor: 'bg-gruppy-orange-light text-gruppy-orange',
    icon: '🌆'
  },
  vrij: { 
    label: 'Vrij', 
    color: 'bg-gray-400 text-white', 
    lightColor: 'bg-gray-100 text-gray-600',
    icon: '🏠'
  },
  ziek: { 
    label: 'Ziek', 
    color: 'bg-red-500 text-white', 
    lightColor: 'bg-red-100 text-red-600',
    icon: '🤒'
  },
  vakantie: { 
    label: 'Vakantie', 
    color: 'bg-gruppy-green text-white', 
    lightColor: 'bg-gruppy-green-light text-gruppy-green',
    icon: '🏖️'
  },
};

export function NewShiftModal({ isOpen, onClose, onSubmit, teamMembers }: NewShiftModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie'>('ochtend');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Only allow admins to access this modal
  if (user?.role !== 'admin') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !date) {
      return;
    }

    onSubmit({
      employeeId,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      location: location || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setEmployeeId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setType('ochtend');
    setLocation('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setEmployeeId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setType('ochtend');
    setLocation('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Show time fields only for work shifts
  const showTimeFields = type === 'ochtend' || type === 'avond';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gruppy-orange to-gruppy-green rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Nieuwe shift</h2>
              <p className="text-sm text-muted-foreground">Plan een shift voor je team</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Medewerker
            </Label>
            <select
              id="employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              required
            >
              <option value="">Selecteer medewerker</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.position}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datum
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full"
              required
            />
          </div>

          {/* Shift Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Shift type</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(shiftTypes).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key as any)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-sm font-medium flex items-center justify-center gap-2",
                    type === key
                      ? config.color
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Fields (only for work shifts) */}
          {showTimeFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start tijd
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Eind tijd
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Location (only for work shifts) */}
          {showTimeFields && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locatie
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bijv. Winkel, Magazijn, Kassa..."
                className="w-full"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notities (optioneel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra informatie over deze shift..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="bg-gruppy-orange hover:bg-gruppy-orange/90"
            >
              Shift aanmaken
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
