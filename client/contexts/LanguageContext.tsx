import React, { createContext, useContext, useState } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  nl: {
    // Navigation
    'nav.news': 'Nieuws',
    'nav.chat': 'Chat',
    'nav.schedule': 'Rooster',
    'nav.tasks': 'Taken',
    'nav.profile': 'Profiel',
    'nav.admin': 'Beheer',
    
    // News Feed
    'news.title': 'Nieuws & Aankondigingen',
    'news.filter.all': 'Alles',
    'news.filter.important': 'Belangrijk',
    'news.filter.hr': 'HR',
    'news.filter.planning': 'Planning',
    'news.read': 'Gelezen',
    'news.unread': 'Ongelezen',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Er ging iets mis',
    'common.retry': 'Opnieuw proberen',

    // Authentication
    'auth.signOut': 'Uitloggen',
    
    // Placeholders
    'placeholder.title': 'Pagina in ontwikkeling',
    'placeholder.description': 'Deze pagina wordt binnenkort toegevoegd. Blijf vragen stellen om meer functionaliteit toe te voegen!',
    // Dashboard
    'dashboard.title': 'Welkom terug, {name}',
    'dashboard.subtitle': 'Ga verder met je onboarding',
    'dashboard.kpi.completed': 'Voltooid',
    'dashboard.kpi.inProgress': 'Bezig',
    'dashboard.kpi.teamMembers': 'Teamleden',
    'dashboard.kpi.completionRate': 'Voltooiingspercentage',
    'dashboard.progress.title': 'Onboarding voortgang',
    'dashboard.progress.subtitle': '{percent}%',
    'dashboard.tasks.title': 'Je taken',
    'dashboard.quickActions.title': 'Snelle acties',
    'dashboard.quickActions.takeQuiz': 'Quiz doen',
    'dashboard.quickActions.viewPlans': 'Bekijk plannen',
    // Quiz Creator
    'dashboard.createQuiz.title': 'Quiz titel',
    'dashboard.createQuiz.placeholder': 'Bijv. Onboarding Basics',
    'dashboard.createQuiz.description': 'Korte beschrijving',
    'dashboard.createQuiz.descriptionPlaceholder': 'Optionele beschrijving',
    'dashboard.createQuiz.addQuestion': 'Vraag toevoegen',
    'dashboard.createQuiz.questionPlaceholder': 'Vraag tekst',
    'dashboard.createQuiz.addButton': 'Toevoegen',
    'dashboard.createQuiz.questionsLabel': 'Vragen',
    'dashboard.createQuiz.noQuestions': 'Nog geen vragen — voeg er één toe bovenaan.',
    'dashboard.createQuiz.remove': 'Verwijderen',
    'dashboard.createQuiz.createButton': 'Maak quiz',
    'dashboard.tasks.example1': 'Voltooi profielinstellingen',
    'dashboard.tasks.example2': 'Maak welkomstquiz',
    'dashboard.tasks.example3': 'Verbind je team',
    'dashboard.tasks.example4': 'Pas dashboard aan',
    'dashboard.tasks.example5': 'Stel meldingen in',
    'dashboard.notes.title': 'Notities',
    'dashboard.notes.description': 'Houd belangrijke opmerkingen bij over onboarding. Dit paneel is minimaal gehouden om focus te houden op acties en voortgang.',
  },
  en: {
    // Navigation
    'nav.news': 'News',
    'nav.chat': 'Chat',
    'nav.schedule': 'Schedule',
    'nav.tasks': 'Tasks',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',

    // News Feed
    'news.title': 'News & Announcements',
    'news.filter.all': 'All',
    'news.filter.important': 'Important',
    'news.filter.hr': 'HR',
    'news.filter.planning': 'Planning',
    'news.read': 'Read',
    'news.unread': 'Unread',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try again',

    // Authentication
    'auth.signOut': 'Sign Out',

    // Placeholders
    'placeholder.title': 'Page in Development',
    'placeholder.description': 'This page is coming soon. Keep prompting to add more functionality!',
    // Dashboard
    'dashboard.title': 'Welcome back, {name}',
    'dashboard.subtitle': 'Continue your onboarding journey',
    'dashboard.kpi.completed': 'Completed',
    'dashboard.kpi.inProgress': 'In Progress',
    'dashboard.kpi.teamMembers': 'Team Members',
    'dashboard.kpi.completionRate': 'Completion Rate',
    'dashboard.progress.title': 'Onboarding Progress',
    'dashboard.progress.subtitle': '{percent}%',
    'dashboard.tasks.title': 'Your Tasks',
    'dashboard.quickActions.title': 'Quick Actions',
    'dashboard.quickActions.takeQuiz': 'Take Quiz',
    'dashboard.quickActions.viewPlans': 'View Plans',
    // Quiz Creator
    'dashboard.createQuiz.title': 'Quiz title',
    'dashboard.createQuiz.placeholder': 'E.g. Onboarding Basics',
    'dashboard.createQuiz.description': 'Short description',
    'dashboard.createQuiz.descriptionPlaceholder': 'Optional description',
    'dashboard.createQuiz.addQuestion': 'Add question',
    'dashboard.createQuiz.questionPlaceholder': 'Question text',
    'dashboard.createQuiz.addButton': 'Add',
    'dashboard.createQuiz.questionsLabel': 'Questions',
    'dashboard.createQuiz.noQuestions': 'No questions yet — add one above.',
    'dashboard.createQuiz.remove': 'Remove',
    'dashboard.createQuiz.createButton': 'Create Quiz',
    'dashboard.tasks.example1': 'Complete profile setup',
    'dashboard.tasks.example2': 'Take welcome quiz',
    'dashboard.tasks.example3': 'Connect your team',
    'dashboard.tasks.example4': 'Customize dashboard',
    'dashboard.tasks.example5': 'Set up notifications',
    'dashboard.notes.title': 'Notes',
    'dashboard.notes.description': 'Keep track of important onboarding notes here. This panel is intentionally minimal to keep focus on actions and progress.',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('nl');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['nl']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
