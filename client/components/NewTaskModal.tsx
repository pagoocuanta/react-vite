import React, { useState } from 'react';
import { X, Calendar, User, Tag, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Task, User as UserType } from '@shared/api';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    assigneeId: string;
    priority: Task['priority'];
    dueDate?: string;
    tags: string[];
    estimatedHours?: number;
  }) => void;
  teamMembers: UserType[];
}

const priorityConfig = {
  low: { label: 'Laag', color: 'bg-gray-100 text-gray-700', icon: '⚪' },
  medium: { label: 'Normaal', color: 'bg-gruppy-blue-light text-gruppy-blue', icon: '🔵' },
  high: { label: 'Hoog', color: 'bg-gruppy-orange-light text-gruppy-orange', icon: '🟠' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: '🔴' },
};

const predefinedTags = [
  'Voorraad',
  'HR', 
  'IT',
  'Klantenservice',
  'Veiligheid',
  'Training',
  'Rapport',
  'Controle',
  'Testing',
  'Planning'
];

export function NewTaskModal({ isOpen, onClose, onSubmit, teamMembers }: NewTaskModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  // Filter team members based on user role
  const availableAssignees = user?.role === 'admin'
    ? teamMembers
    : teamMembers.filter(member => member.id === user?.id || member.name === user?.name);

  // Auto-assign to current user for staff members
  React.useEffect(() => {
    if (user?.role !== 'admin' && availableAssignees.length > 0 && !assigneeId) {
      const currentUserMember = availableAssignees.find(member =>
        member.id === user?.id || member.name === user?.name
      );
      if (currentUserMember) {
        setAssigneeId(currentUserMember.id);
      }
    }
  }, [user, availableAssignees, assigneeId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !assigneeId) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      dueDate: dueDate || undefined,
      tags: selectedTags,
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setPriority('medium');
    setDueDate('');
    setSelectedTags([]);
    setCustomTag('');
    setEstimatedHours('');
    onClose();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nieuwe taak aanmaken</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Taak titel *
            </Label>
            <Input
              id="title"
              placeholder="Wat moet er gedaan worden?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Beschrijving
            </Label>
            <Textarea
              id="description"
              placeholder="Geef meer details over de taak..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>

          {/* Grid Layout for Assignee and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Toegewezen aan *
                {user?.role !== 'admin' && (
                  <Badge className="bg-gruppy-blue/20 text-gruppy-blue border-gruppy-blue/30 text-xs">
                    Alleen jezelf
                  </Badge>
                )}
              </Label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                disabled={user?.role !== 'admin'}
                required
              >
                <option value="">
                  {user?.role === 'admin' ? 'Kies een medewerker' : 'Toegewezen aan jezelf'}
                </option>
                {availableAssignees.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Prioriteit
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={priority === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriority(key as Task['priority'])}
                    className={cn(
                      "text-xs",
                      priority === key && config.color
                    )}
                  >
                    {config.icon} {config.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deadline
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                  className="text-xs"
                >
                  Vandaag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDate(getTomorrowDate())}
                  className="text-xs"
                >
                  Morgen
                </Button>
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Geschatte uren
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="2"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            
            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    "text-xs transition-all duration-200 hover:scale-105",
                    selectedTags.includes(tag) 
                      ? "bg-gruppy-orange hover:bg-gruppy-orange/90" 
                      : "hover:border-gruppy-orange hover:text-gruppy-orange"
                  )}
                >
                  {tag}
                </Button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Aangepaste tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Geselecteerde tags:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-gruppy-orange-light text-gruppy-orange cursor-pointer hover:bg-gruppy-orange-light/80"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gruppy-orange hover:bg-gruppy-orange/90"
              disabled={!title.trim() || !assigneeId}
            >
              Taak aanmaken
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
