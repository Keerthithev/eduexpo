import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import DashboardPage from './pages/Dashboard';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import ArchivePage from './pages/ArchivePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />

        {/* Protected routes with Sidebar Layout */}
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* Redirect unknown routes to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
