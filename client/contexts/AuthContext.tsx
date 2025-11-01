import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type User, type AuthUser } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (authUserId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      return data as User;
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', {
        message: error?.message || 'Unknown error',
        name: error?.name,
        stack: error?.stack
      });
      return null;
    }
  };

  const refreshProfile = async () => {
    if (authUser) {
      const profile = await fetchUserProfile(authUser.id);
      setUser(profile);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in with Supabase...');
    console.log('📧 Email:', email);
    
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-mailadres is nog niet bevestigd. Controleer je inbox.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Te veel inlogpogingen. Wacht even voordat je het opnieuw probeert.';
        }

        toast({
          title: "Inloggen mislukt",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        console.log('✅ Supabase auth successful');
        const profile = await fetchUserProfile(data.user.id);
        
        if (profile) {
          setUser(profile);
          setAuthUser(data.user as AuthUser);
          toast({
            title: "Succesvol ingelogd",
            description: `Welkom terug, ${profile.name}!`,
          });
          return { success: true };
        } else {
          console.error('❌ User profile not found in database');
          await supabase.auth.signOut();
          
          toast({
            title: "Inloggen mislukt",
            description: "Gebruikersprofiel niet gevonden. Neem contact op met de beheerder.",
            variant: "destructive",
          });
          
          return { success: false, error: 'Gebruikersprofiel niet gevonden' };
        }
      }

      return { success: false, error: 'Onbekende fout' };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      toast({
        title: "Inloggen mislukt",
        description: "Er is een fout opgetreden bij het inloggen.",
        variant: "destructive",
      });
      
      return { success: false, error: 'Er is een fout opgetreden' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      setUser(null);
      setAuthUser(null);
      
      console.log('✅ Signed out successfully');
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd",
      });
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setUser(null);
      setAuthUser(null);
      
      toast({
        title: "Uitgelogd",
        description: "Je bent uitgelogd",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🔐 Initializing auth with Supabase...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log('👤 Active session found');
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            console.log('✅ User profile loaded:', profile.name);
            setUser(profile);
            setAuthUser(session.user as AuthUser);
          } else {
            console.warn('⚠️ No user profile found for session');
            await supabase.auth.signOut();
          }
        } else {
          console.log('ℹ️ No active session');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setAuthUser(session.user as AuthUser);
          } else {
            console.warn('⚠️ No profile found after sign in');
            setAuthUser(session.user as AuthUser);
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    authUser,
    loading,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
