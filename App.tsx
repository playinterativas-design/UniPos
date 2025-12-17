import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Home from './pages/Home';
import POS from './pages/POS';
import Manager from './pages/Manager';
import Login from './pages/Login';
import Welcome from './pages/Welcome';

const AppRoutes = () => {
  const { isCompanyAuthenticated } = useStore();

  if (!isCompanyAuthenticated) {
    return <Welcome />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pos" element={<POS />} />
      <Route path="/manager" element={<Manager />} />
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