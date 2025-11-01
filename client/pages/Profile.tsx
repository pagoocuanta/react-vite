import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Settings,
  Camera,
  Upload,
  Download,
  Activity,
  Award,
  Clock,
  Target,
  TrendingUp,
  Users,
  LogOut,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  avatar?: string;
  role: 'admin' | 'staff';
  preferences: {
    language: 'nl' | 'en';
    notifications: boolean;
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  stats: {
    tasksCompleted: number;
    hoursWorked: number;
    shiftsThisMonth: number;
    teamRating: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
  }[];
  recentActivity: {
    id: string;
    type: 'task' | 'shift' | 'chat' | 'post';
    description: string;
    timestamp: string;
  }[];
}

const mockProfile: UserProfile = {
  id: '5',
  name: 'Jij',
  email: 'jij@gruppy.nl',
  phone: '+31 6 11223344',
  position: 'Kassa Medewerker',
  department: 'Verkoop',
  startDate: '2023-09-01',
  role: 'staff',
  preferences: {
    language: 'nl',
    notifications: true,
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
  },
  stats: {
    tasksCompleted: 47,
    hoursWorked: 168,
    shiftsThisMonth: 22,
    teamRating: 4.8,
  },
  achievements: [
    {
      id: '1',
      title: 'Eerste Week',
      description: 'Eerste week succesvol afgerond',
      icon: '🎯',
      earned: true,
      earnedDate: '2023-09-08'
    },
    {
      id: '2',
      title: 'Teamspeler',
      description: '10 team chats beantwoord',
      icon: '🤝',
      earned: true,
      earnedDate: '2023-09-15'
    },
    {
      id: '3',
      title: 'Taak Master',
      description: '50 taken voltooid',
      icon: '✅',
      earned: false
    },
    {
      id: '4',
      title: 'Perfecte Maand',
      description: 'Alle shifts op tijd aanwezig',
      icon: '🏆',
      earned: true,
      earnedDate: '2023-10-01'
    },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'task',
      description: 'Taak "Inventaris bijwerken" gemarkeerd als in uitvoering',
      timestamp: '2024-01-16T14:30:00Z'
    },
    {
      id: '2',
      type: 'chat',
      description: 'Bericht gestuurd in Team Kassa',
      timestamp: '2024-01-16T12:15:00Z'
    },
    {
      id: '3',
      type: 'shift',
      description: 'Ochtendshift (08:00-16:00) voltooid',
      timestamp: '2024-01-16T16:00:00Z'
    },
    {
      id: '4',
      type: 'post',
      description: 'Reactie gegeven op "Team uitje vrijdag"',
      timestamp: '2024-01-15T19:45:00Z'
    },
  ]
};

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Create profile from authenticated user or fallback to mock
  const createProfileFromUser = (authUser: any): UserProfile => {
    if (!authUser) return mockProfile;

    return {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      phone: authUser.phone || '+31 6 12345678',
      position: authUser.position || 'System Administrator',
      department: authUser.department || 'IT',
      startDate: authUser.start_date || '2023-09-01',
      role: authUser.role,
      preferences: {
        language: authUser.preferences?.language || 'nl',
        notifications: authUser.preferences?.notifications ?? true,
        theme: authUser.preferences?.theme || 'light',
        emailNotifications: true,
        pushNotifications: true,
      },
      stats: {
        tasksCompleted: authUser.role === 'admin' ? 73 : 47,
        hoursWorked: authUser.role === 'admin' ? 180 : 168,
        shiftsThisMonth: authUser.role === 'admin' ? 20 : 22,
        teamRating: authUser.role === 'admin' ? 4.9 : 4.8,
      },
      achievements: [
        {
          id: '1',
          title: 'System Administrator',
          description: 'Succesvol aangemeld als systeembeheerder',
          icon: '🛡️',
          earned: true,
          earnedDate: new Date().toISOString().split('T')[0]
        },
        {
          id: '2',
          title: 'First Login',
          description: 'Eerste keer ingelogd in Gruppy',
          icon: '🚀',
          earned: true,
          earnedDate: new Date().toISOString().split('T')[0]
        },
        {
          id: '3',
          title: 'Team Leader',
          description: 'Beheer een team van 10+ leden',
          icon: '👥',
          earned: authUser.role === 'admin'
        },
        {
          id: '4',
          title: 'Super User',
          description: 'Volledige toegang tot alle functies',
          icon: '⭐',
          earned: authUser.role === 'admin',
          earnedDate: authUser.role === 'admin' ? new Date().toISOString().split('T')[0] : undefined
        },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'task' as const,
          description: 'Gebruikersaccounts geconfigureerd',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: '2',
          type: 'chat' as const,
          description: 'Admin chat gecontroleerd',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '3',
          type: 'shift' as const,
          description: 'Rooster voor komende week goedgekeurd',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
        },
        {
          id: '4',
          type: 'post' as const,
          description: 'Welkomstbericht voor nieuwe medewerkers geplaatst',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
      ],
    };
  };

  const [profile, setProfile] = useState<UserProfile>(() => createProfileFromUser(user));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });

  // Update profile when user changes
  React.useEffect(() => {
    if (user) {
      const newProfile = createProfileFromUser(user);
      setProfile(newProfile);
      setEditForm({
        name: newProfile.name,
        email: newProfile.email,
        phone: newProfile.phone,
      });
    }
  }, [user]);

  // Keep app language in sync with profile preferences
  React.useEffect(() => {
    if (profile?.preferences?.language) {
      setLanguage(profile.preferences.language);
    }
  }, [profile.preferences.language, setLanguage]);

  const handleSaveProfile = () => {
    setProfile(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditing(false);
  };

  const updatePreference = (key: keyof UserProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Net nu';
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    return `${Math.floor(diffInHours / 24)} dagen geleden`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="h-4 w-4 text-gruppy-green" />;
      case 'chat': return <Users className="h-4 w-4 text-gruppy-blue" />;
      case 'shift': return <Clock className="h-4 w-4 text-gruppy-orange" />;
      case 'post': return <Activity className="h-4 w-4 text-gruppy-purple" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('nav.profile')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Beheer je profiel en voorkeuren
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Data exporteren
          </Button>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gruppy-orange hover:bg-gruppy-orange/90"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuleren
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Profiel bewerken
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profiel</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
          <TabsTrigger value="activity">Activiteit</TabsTrigger>
          <TabsTrigger value="achievements">Prestaties</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-gruppy-orange to-gruppy-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.position}</p>
                  <Badge className={`mt-2 ${
                    profile.role === 'admin'
                      ? 'bg-gruppy-orange/20 text-gruppy-orange border-gruppy-orange/30'
                      : 'bg-gruppy-blue/20 text-gruppy-blue border-gruppy-blue/30'
                  }`}>
                    {profile.role === 'admin' ? 'Administrator' : 'Medewerker'}
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Naam
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefoon
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.phone}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Afdeling
                    </Label>
                    <p className="text-foreground font-medium">{profile.department}</p>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Startdatum
                    </Label>
                    <p className="text-foreground font-medium">{formatDate(profile.startDate)}</p>
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Taal
                    </Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setLanguage('nl'); updatePreference('language', 'nl'); }}
                          className={cn(profile.preferences.language === 'nl' && "bg-white shadow-sm")}
                        >
                          🇳🇱 Nederlands
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setLanguage('en'); updatePreference('language', 'en'); }}
                          className={cn(profile.preferences.language === 'en' && "bg-white shadow-sm")}
                        >
                          🇬🇧 English
                        </Button>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">{profile.preferences.language === 'nl' ? 'Nederlands' : 'English'}</p>
                    )}
                  </div>

                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveProfile} className="bg-gruppy-green hover:bg-gruppy-green/90">
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-gruppy-green" />
                <span className="text-sm font-medium text-foreground">Taken voltooid</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.stats.tasksCompleted}</div>
              <div className="text-xs text-muted-foreground">Deze maand</div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gruppy-blue" />
                <span className="text-sm font-medium text-foreground">Uren gewerkt</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.stats.hoursWorked}</div>
              <div className="text-xs text-muted-foreground">Deze maand</div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gruppy-orange" />
                <span className="text-sm font-medium text-foreground">Shifts</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.stats.shiftsThisMonth}</div>
              <div className="text-xs text-muted-foreground">Deze maand</div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-gruppy-purple" />
                <span className="text-sm font-medium text-foreground">Rating</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.stats.teamRating}</div>
              <div className="text-xs text-muted-foreground">⭐ Team beoordeling</div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            {/* Language Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Taal instellingen
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Interface taal</p>
                  <p className="text-sm text-muted-foreground">Kies je voorkeurstaal voor de app</p>
                </div>
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setLanguage('nl'); updatePreference('language', 'nl'); }}
                    className={cn(language === 'nl' && "bg-white shadow-sm")}
                  >
                    🇳🇱 Nederlands
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setLanguage('en'); updatePreference('language', 'en'); }}
                    className={cn(language === 'en' && "bg-white shadow-sm")}
                  >
                    🇬🇧 English
                  </Button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Meldingen
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push notificaties</p>
                    <p className="text-sm text-muted-foreground">Ontvang meldingen in de app</p>
                  </div>
                  <Switch
                    checked={profile.preferences.pushNotifications}
                    onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">E-mail notificaties</p>
                    <p className="text-sm text-muted-foreground">Ontvang updates via e-mail</p>
                  </div>
                  <Switch
                    checked={profile.preferences.emailNotifications}
                    onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Algemene meldingen</p>
                    <p className="text-sm text-muted-foreground">Chat berichten, taken en rooster updates</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications}
                    onCheckedChange={(checked) => updatePreference('notifications', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {profile.preferences.theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                Thema
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Donkere modus</p>
                  <p className="text-sm text-muted-foreground">Schakel tussen licht en donker thema</p>
                </div>
                <Switch
                  checked={profile.preferences.theme === 'dark'}
                  onCheckedChange={(checked) => updatePreference('theme', checked ? 'dark' : 'light')}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Beveiliging
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Wachtwoord wijzigen
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Mijn data downloaden
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Account verwijderen
                </Button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "group relative w-full overflow-hidden rounded-xl py-4 px-6",
                  "bg-gradient-to-r from-gruppy-purple via-gruppy-orange to-gruppy-blue",
                  "text-white font-semibold text-base",
                  "transition-all duration-300 ease-out",
                  "hover:shadow-lg hover:shadow-gruppy-purple/50",
                  "active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-3"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0",
                    "translate-x-[-200%] group-hover:translate-x-[200%]",
                    "transition-transform duration-700 ease-out"
                  )}
                />
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Uitloggen...</span>
                  </>
                ) : (
                  <>
                    <LogOut className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      "group-hover:translate-x-[-4px]"
                    )} />
                    <span className="relative z-10">Uitloggen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recente activiteit
            </h3>
            <div className="space-y-4">
              {profile.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Prestaties & Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200",
                    achievement.earned
                      ? "bg-gruppy-green-light/20 border-gruppy-green/30"
                      : "bg-muted/30 border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "text-2xl",
                      !achievement.earned && "grayscale opacity-50"
                    )}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-semibold",
                        achievement.earned ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-gruppy-green mt-1">
                          Behaald op {formatDate(achievement.earnedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
