import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const { language, translations } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError(language === 'nl' ? 'Vul alle velden in' : 'Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || (language === 'nl' ? 'Inloggen mislukt' : 'Login failed'));
    }

    setIsLoading(false);
  };

  const loginTexts = {
    nl: {
      title: "Welkom bij InwerkApp",
      subtitle: "Log in om toegang te krijgen tot je team",
      email: "E-mailadres",
      password: "Wachtwoord",
      signIn: "Inloggen",
      signing: "Bezig met inloggen...",
      teamWork: "Teamwerk gemakkelijk gemaakt",
      features: [
        "📱 Communiceer met je team",
        "📅 Bekijk roosters en planningen",
        "✅ Beheer taken en projecten",
        "👤 Persoonlijk profiel en instellingen"
      ]
    },
    en: {
      title: "Welcome to InwerkApp",
      subtitle: "Sign in to access your team",
      email: "Email address",
      password: "Password",
      signIn: "Sign In",
      signing: "Signing in...",
      teamWork: "Teamwork made simple",
      features: [
        "📱 Communicate with your team",
        "📅 View schedules and planning",
        "✅ Manage tasks and projects",
        "👤 Personal profile and settings"
      ]
    }
  };

  const texts = loginTexts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gruppy-orange/10 via-white to-gruppy-blue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-8">
            <div className="flex items-center lg:justify-start">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F05b6361c4f5f486fa3e1183738746aff%2F2bea067101cd409c987fe32b3915227c?format=webp&width=800"
                alt="InwerkApp logo"
                className="w-[74%] max-w-[669px] h-auto pr-px -mt-[157px] -mb-[172px] ml-[58px]"
              />
            </div>
            <div className="flex flex-col justify-start items-center space-y-3">
              <p className="text-2xl font-semibold text-gray-800">{texts.teamWork}</p>
              <p className="text-gray-600 text-lg max-w-md mx-auto lg:mx-0">
                {language === 'nl'
                  ? "Jouw eerste werkdag begint hier."
                  : "Your first day starts here."
                }
              </p>
            </div>
          </div>

        </div>

        {/* Login Form Section */}
        <div className="order-1 lg:order-2 flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">{texts.title}</CardTitle>
              <CardDescription className="text-gray-600">{texts.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      {texts.email}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                        placeholder={language === 'nl' ? 'naam@bedrijf.nl' : 'name@company.com'}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      {texts.password}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                        placeholder="••••••••"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary text-primary-foreground font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {texts.signing}
                    </>
                  ) : (
                    texts.signIn
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  {language === 'nl'
                    ? "Geen account? Neem contact op met je beheerder."
                    : "No account? Contact your administrator."
                  }
                </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
