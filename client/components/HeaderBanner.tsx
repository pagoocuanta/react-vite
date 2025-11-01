import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function HeaderBanner() {
  const { user } = useAuth();
  const authed = !!user;

  return (
    <header
      className="fixed left-0 right-0 z-[999] bg-card/95 backdrop-blur-sm shadow-sm"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="max-w-screen-2xl w-full mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F05b6361c4f5f486fa3e1183738746aff%2F2bea067101cd409c987fe32b3915227c?format=webp&width=800"
              alt="InwerkApp logo"
              className="h-[190px] w-auto select-none"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {(() => {
            const location = useLocation();
            const authed = !!user;
            const items = authed
              ? [
                  { to: '/start', label: 'Start' },
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/learning-path', label: 'Leerpad' },
                  { to: '/tasks', label: 'Taken' },
                ]
              : [
                  { to: '/start', label: 'Start' },
                ];

            const withAdmin = authed && user?.role === 'admin'
              ? [...items, { to: '/admin', label: 'Beheer' }]
              : items;

            return (
              <>
                {withAdmin.map((it) => {
                  const isActive = location.pathname === it.to;
                  return (
                    <Link
                      key={it.to}
                      to={it.to}
                      className={cn('nav-tab', isActive && 'active')}
                    >
                      <span className="ml-0">{it.label}</span>
                    </Link>
                  );
                })}
              </>
            );
          })()}
        </nav>

        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gruppy-orange text-white text-xs">3</span>
                </Button>

                <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
                  <Link to="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Instellingen
                  </Link>
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="md:hidden">
                <User className="h-4 w-4" />
              </Button>

              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Inloggen</Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-indigo-900 text-white">Begin</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderBanner;
