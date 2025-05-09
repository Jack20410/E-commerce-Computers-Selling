import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If route requires admin privileges, check if user is admin
  if (requireAdmin) {
    console.log('Admin route accessed:', { 
      role: user?.role, 
    });
    
    if (!isAdmin) {
      console.warn("Access denied: User is not an admin");
      return <Navigate to="/" replace />;
    }
    
    console.log('Admin access granted');
  }
  
  // If user is authenticated and has required permissions, render the outlet
  return <Outlet />;
};

export default ProtectedRoute; 