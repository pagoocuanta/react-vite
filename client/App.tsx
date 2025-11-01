import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";

// Pages
import Index from "./pages/Index";
import Start from "./pages/Start";
import { LoginScreen } from "@/components/auth/LoginScreen";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Setup from "./pages/Setup";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";
import Preboarding from "./pages/Preboarding";
import TeamIntro from "./pages/TeamIntro";
import LearningPath from "./pages/LearningPath";
import Week1Dashboard from "./pages/Week1Dashboard";
import Week2Dashboard from "./pages/Week2Dashboard";
import TeamQuiz from "./pages/TeamQuiz";
import Agenda from "./pages/Agenda";
import TileContent from "./pages/TileContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/setup" element={<Setup />} />
              <Route path="/debug" element={<Debug />} />
              <Route path="/start" element={<Start />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/preboarding" element={<Preboarding />} />
                      <Route path="/preboarding/tile/:tileId" element={<TileContent />} />
                      <Route path="/team-intro" element={<TeamIntro />} />
                      <Route path="/learning-path" element={<LearningPath />} />
                      <Route path="/week1" element={<Preboarding />} />
                      <Route path="/week1/team-quiz" element={<TeamQuiz />} />
                      <Route path="/week2" element={<Week2Dashboard />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
