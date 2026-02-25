import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Interview from "./pages/Interview";
import Resume from "./pages/Resume";
import EmployerCreateJob from "./pages/EmployerCreateJob";
import EmployerCandidates from "./pages/EmployerCandidates";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/interview" component={Interview} />
      <Route path="/resume" component={Resume} />
      <Route path="/employer/create-job" component={EmployerCreateJob} />
      <Route path="/employer/candidates" component={EmployerCandidates} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Header />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
