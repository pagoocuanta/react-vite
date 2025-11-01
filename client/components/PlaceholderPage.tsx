import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface PlaceholderPageProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  color?: string;
}

export function PlaceholderPage({ 
  icon: Icon, 
  title, 
  description, 
  color = "gruppy-orange" 
}: PlaceholderPageProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className={`w-20 h-20 bg-${color}/10 rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className={`h-10 w-10 text-${color}`} />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
        {title}
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        {description || t('placeholder.description')}
      </p>
      
      <Button 
        variant="outline" 
        className="gap-2 hover:bg-gruppy-orange hover:text-white hover:border-gruppy-orange"
      >
        <MessageSquare className="h-4 w-4" />
        Vraag om meer functionaliteit
      </Button>
    </div>
  );
}
