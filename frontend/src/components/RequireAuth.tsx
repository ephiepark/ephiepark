import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../firebase/FirebaseContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useFirebase();
  const location = useLocation();

  if (!user) {
    // Redirect to the blog page if not authenticated
    return <Navigate to="/blog" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
