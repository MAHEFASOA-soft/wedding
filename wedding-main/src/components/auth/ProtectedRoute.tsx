
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
  };
}

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const [hasStoredAuth] = useState(() => Boolean(
    localStorage.getItem('admin_auth') || sessionStorage.getItem('admin_auth')
  ));
  const [isChecking, setIsChecking] = useState(hasStoredAuth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!hasStoredAuth) return;

    let isMounted = true;

    const checkSession = async () => {
      const result = await api.get<AuthResponse>('/auth/me');
      if (!isMounted) return;

      if (result?.user) {
        const authData = { authenticated: true, ...result.user };
        sessionStorage.setItem('admin_auth', JSON.stringify(authData));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_auth');
        sessionStorage.removeItem('admin_auth');
      }

      setIsChecking(false);
    };

    void checkSession();
    return () => {
      isMounted = false;
    };
  }, [hasStoredAuth]);

  if (isChecking) {
    return <p className="p-6 text-sm text-slate-500">Vérification de la session...</p>;
  }

  if (!isAuthenticated) {
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
