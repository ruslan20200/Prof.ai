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
import RoleGuard from "./components/routing/RoleGuard";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import { I18nProvider } from "./contexts/I18nContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding">
        <RoleGuard allowedRoles={["seeker"]} requireAuth={false} redirectTo="/">
          <Onboarding />
        </RoleGuard>
      </Route>
      <Route path="/dashboard">
        <RoleGuard allowedRoles={["seeker"]} requireAuth={false} redirectTo="/">
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path="/jobs">
        <RoleGuard allowedRoles={["seeker"]} requireAuth={false} redirectTo="/">
          <Jobs />
        </RoleGuard>
      </Route>
      <Route path="/interview">
        <RoleGuard allowedRoles={["seeker"]} requireAuth={false} redirectTo="/">
          <Interview />
        </RoleGuard>
      </Route>
      <Route path="/resume">
        <RoleGuard allowedRoles={["seeker"]} redirectTo="/auth?role=seeker&next=/resume">
          <Resume />
        </RoleGuard>
      </Route>
      <Route path="/employer/create-job">
        <RoleGuard allowedRoles={["employer"]}>
          <EmployerCreateJob />
        </RoleGuard>
      </Route>
      <Route path="/employer/candidates">
        <RoleGuard allowedRoles={["employer"]}>
          <EmployerCandidates />
        </RoleGuard>
      </Route>
      <Route path="/admin">
        <RoleGuard allowedRoles={["super_admin"]}>
          <Admin />
        </RoleGuard>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Header />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
