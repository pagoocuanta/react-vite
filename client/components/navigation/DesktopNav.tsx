import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Calendar, CheckSquare, User, Settings, Globe, LogOut, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { key: 'news', icon: Home, href: '/' },
  { key: 'chat', icon: MessageCircle, href: '/chat' },
  { key: 'schedule', icon: Calendar, href: '/schedule' },
  { key: 'tasks', icon: CheckSquare, href: '/tasks' },
  { key: 'profile', icon: User, href: '/profile' },
];

const adminNavItems = [
  { key: 'admin', icon: Shield, href: '/admin' },
];

export function DesktopNav() {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 z-50 w-64 bg-sidebar/95 backdrop-blur-md border-r border-border hidden md:flex flex-col" style={{ top: 'var(--header-height)', height: 'calc(100vh - var(--header-height))' }}>
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gruppy-orange to-gruppy-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Gruppy</h1>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 p-3 bg-gruppy-orange-light/10 rounded-xl">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-gruppy-orange text-white text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.position || user.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gruppy-orange text-white shadow-lg shadow-gruppy-orange/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-gruppy-orange-light/10"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "animate-bounce-gentle",
                !isActive && "group-hover:scale-110"
              )} />
              <span className="font-medium">
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {user?.role === 'admin' && (
          <>
            <div className="h-px bg-border my-3" />
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gruppy-orange text-white shadow-lg shadow-gruppy-orange/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-gruppy-orange-light/10"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "animate-bounce-gentle",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span className="font-medium">
                    {t(`nav.${item.key}`)}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Language Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Language</span>
          </div>
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage('nl')}
              className={cn(
                "h-7 px-3 text-xs rounded-md",
                language === 'nl' && "bg-white shadow-sm"
              )}
            >
              NL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage('en')}
              className={cn(
                "h-7 px-3 text-xs rounded-md",
                language === 'en' && "bg-white shadow-sm"
              )}
            >
              EN
            </Button>
          </div>
        </div>

        {/* Settings */}
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">{t('auth.signOut')}</span>
        </Button>
      </div>
    </aside>
  );
}
