import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards routes that require login. Waits for the auth state to rehydrate from
// localStorage before deciding, then redirects unauthenticated users to /login.
function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute;
