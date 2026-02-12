import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // 1. Wait while we check LocalStorage
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 2. If no user found, kick to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. User is safe, show the page
  return <Outlet />;
};

export default ProtectedRoute;