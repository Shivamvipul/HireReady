import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Spinner } from '../ui';

export default function ProtectedRoute() {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner className="h-6 w-6 text-accent" /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}
