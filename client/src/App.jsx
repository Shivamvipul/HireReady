import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { Spinner } from './components/ui';
import Landing from './pages/Landing';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/AuthPages';
import NotFound from './pages/NotFound';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Ats = lazy(() => import('./pages/Ats'));
const Interview = lazy(() => import('./pages/Interview'));
const Resumes = lazy(() => import('./pages/Resumes').then((m) => ({ default: m.default })));
const NewResume = lazy(() => import('./pages/Resumes').then((m) => ({ default: m.NewResume })));
const Builder = lazy(() => import('./pages/Builder'));
const Linkedin = lazy(() => import('./pages/Linkedin'));
const PublicResume = lazy(() => import('./pages/PublicResume'));

const Loading = () => <div className="grid min-h-[50vh] place-items-center"><Spinner className="h-6 w-6 text-accent" /></div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent-strong focus:px-3 focus:py-2">Skip to content</a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/r/:slug" element={<PublicResume />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ats" element={<Ats />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/resumes/new" element={<NewResume />} />
            <Route path="/resumes/:id" element={<Builder />} />
            <Route path="/linkedin" element={<Linkedin />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
