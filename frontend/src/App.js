import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { loadTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import MealPlans from './pages/MealPlans';
import AI from './pages/AI';
import RecipePage from './pages/RecipePage';
import './App.css';

// App entry point and routing configuration.
// /login is public; everything else is wrapped in ProtectedRoute + Layout.
function App() {
  const { isAuthenticated } = useAuth();

  // Restore the saved theme on first load.
  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes/:id" element={<RecipePage />} />
        <Route path="/mealplans" element={<MealPlans />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Unknown paths fall back to the dashboard (or login if unauthenticated). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
