import { useState } from 'react';
import { X, Image, Tag, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: {
    title: string;
    description: string;
    tags: string[];
    isImportant: boolean;
    image?: File;
  }) => void;
}

const predefinedTags = [
  'Belangrijk',
  'HR', 
  'Planning',
  'Rooster',
  'Veiligheid',
  'Event',
  'Aankondiging',
  'Update'
];

export function NewPostModal({ isOpen, onClose, onSubmit }: NewPostModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isImportant, setIsImportant] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      isImportant,
      image: image || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setIsImportant(false);
    setImage(null);
    setCustomTag('');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Nieuwe aankondiging</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Important Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <Label htmlFor="important" className="flex-1 text-sm font-medium">
              Markeer als belangrijk
            </Label>
            <Switch
              id="important"
              checked={isImportant}
              onCheckedChange={setIsImportant}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titel *
            </Label>
            <Input
              id="title"
              placeholder="Voer een titel in voor je aankondiging..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Beschrijving *
            </Label>
            <Textarea
              id="description"
              placeholder="Schrijf je aankondiging hier..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="text-base resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 karakters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            
            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    selectedTags.includes(tag) 
                      ? "bg-gruppy-orange hover:bg-gruppy-orange/90" 
                      : "hover:border-gruppy-orange hover:text-gruppy-orange"
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Aangepaste tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                className="flex-1"
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
                      className="bg-gruppy-orange-light text-gruppy-orange cursor-pointer"
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Afbeelding (optioneel)
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-gruppy-orange transition-colors duration-200">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label htmlFor="image" className="cursor-pointer">
                <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {image ? image.name : 'Klik om een afbeelding te uploaden'}
                </p>
              </Label>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImage(null)}
                  className="mt-2"
                >
                  Verwijder afbeelding
                </Button>
              )}
            </div>
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
              disabled={!title.trim() || !description.trim()}
            >
              Aankondiging plaatsen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
