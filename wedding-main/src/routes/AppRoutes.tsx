import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import LoginView from '../features/auth/LoginView';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Remplace ceci par ton composant principal actuel
import App from '../App';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* PUBLIC */}
        {/* ========================= */}

        <Route path="/login" element={<LoginView />} />

        {/* ========================= */}
        {/* ADMIN */}
        {/* ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<App />} />
        </Route>

        {/* ========================= */}
        {/* FALLBACK */}
        {/* ========================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

