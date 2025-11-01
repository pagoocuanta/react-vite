import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Calendar, CheckSquare, User, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const baseNavItems = [
  { key: 'news', icon: Home, href: '/' },
  { key: 'chat', icon: MessageCircle, href: '/chat' },
  { key: 'schedule', icon: Calendar, href: '/schedule' },
  { key: 'tasks', icon: CheckSquare, href: '/tasks' },
  { key: 'profile', icon: User, href: '/profile' },
];

const adminNavItem = { key: 'admin', icon: Shield, href: '/admin' };

export function MobileNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = user?.role === 'admin'
    ? [...baseNavItems.slice(0, 4), adminNavItem, baseNavItems[4]] // Insert admin before profile
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-gruppy-orange bg-gruppy-orange-light/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "animate-bounce-gentle")} />
              <span className="text-xs font-medium">
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
