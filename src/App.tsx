import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoachWorkoutsPage from "./components/coach/CoachDashboard";
import AthleteDetailPage from "./components/coach/AthleteDetailPage";
import SAIWorkoutsDashboard from "./components/home/SAIWorkoutsDashboard";
import SAIAthleteDetailPage from "./components/home/SAIAthleteDetailPage";
import ConnectionsPageNew from "./components/social/ConnectionsPageNew";
import EnhancedProfilePageNew from "./components/social/EnhancedProfilePageNew";
import WorkoutDetailPage from "./components/social/WorkoutDetailPage";
import CoachContentHub from "./components/coach/CoachContentHub";
import CreateContent from "./components/coach/CreateContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/connections" element={<ConnectionsPageNew />} />
          <Route path="/profile/:userId" element={<EnhancedProfilePageNew />} />
          <Route path="/workout/:workoutId" element={<WorkoutDetailPage />} />
          <Route path="/challenges" element={<Index />} />
          <Route path="/profile" element={<Index />} />
          <Route path="/coach-workouts" element={<CoachWorkoutsPage />} />
          <Route path="/coach-workouts/athlete/:athleteName" element={<AthleteDetailPage />} />
          <Route path="/coach/content-hub" element={<CoachContentHub />} />
          <Route path="/coach/create-content" element={<CreateContent />} />
          <Route path="/sai-workouts" element={<SAIWorkoutsDashboard />} />
          <Route path="/sai-workouts/athlete/:athleteName" element={<SAIAthleteDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
