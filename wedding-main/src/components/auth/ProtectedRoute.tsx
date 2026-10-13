
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getAuthData = () => {
  try {
    const localAuth = localStorage.getItem('admin_auth');
    const sessionAuth = sessionStorage.getItem('admin_auth');

    const authData = localAuth || sessionAuth;

    if (!authData) {
      return null;
    }

    return JSON.parse(authData);
  } catch {
    localStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_auth');

    return null;
  }
};

const ProtectedRoute: React.FC = () => {
  const location = useLocation();

  const auth = getAuthData();

  if (!auth?.authenticated || auth.role !== 'admin') {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

