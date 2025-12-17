import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Home from './pages/Home';
import POS from './pages/POS';
import Manager from './pages/Manager';
import Login from './pages/Login';
import Welcome from './pages/Welcome';

// Component to protect routes that require Operator/Admin login
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login, saving the current location they were trying to go to
    // remove leading slash for cleaner URL param
    const path = location.pathname.substring(1); 
    return <Navigate to={`/login?redirect=${path}`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isCompanyAuthenticated } = useStore();

  if (!isCompanyAuthenticated) {
    return <Welcome />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes: Require Operator Login */}
      <Route path="/pos" element={
        <ProtectedRoute>
          <POS />
        </ProtectedRoute>
      } />
      <Route path="/manager" element={
        <ProtectedRoute>
          <Manager />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </StoreProvider>
  );
};

export default App;